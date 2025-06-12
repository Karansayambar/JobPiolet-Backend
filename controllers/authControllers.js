const catchAsync = require("../utils/catchAsync");
const filterObj = require("../utils/filterObj");
const User = require("../models/authModels");
const otpGenerator = require("otp-generator");
const mailService = require("../services/mailler");
const jwt = require("jsonwebtoken");
const resetPassword = require("../utils/resetPasswordTemplate");
const crypto = require("crypto");
const candidateProfile = require("../models/userModels");
const dotenv = require("dotenv").config();
const secretKey = process.env.JWT_SECRET;

const signToken = (userId) => jwt.sign({ userId }, secretKey);

const otpTemplate = (name, otp) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 400px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; text-align: center; background-color: #f9f9f9;">
      <h2 style="color: #333;">Hello, ${name} 👋</h2>
      <p style="font-size: 16px; color: #555;">Your One-Time Password (OTP) for verification is:</p>
      <p style="font-size: 22px; font-weight: bold; color: #007bff; background: #e8f0fe; padding: 10px; border-radius: 5px; display: inline-block;">
        ${otp}
      </p>
      <p style="font-size: 14px; color: #666;">This OTP will expire in <strong>10 minutes</strong>.</p>
      <hr style="border: none; height: 1px; background-color: #ddd; margin: 20px 0;">
      <p style="font-size: 12px; color: #888;">If you did not request this OTP, please ignore this email.</p>
      <p style="font-size: 14px; color: #444;">Thank you! 🚀</p>
    </div>
  `;
};

// Register User

exports.registerUser = catchAsync(async (req, res, next) => {
  const { firstName, lastName, role, email, password } = req.body;

  const filteredBody = filterObj(
    req.body,
    "firstName",
    "lastName",
    "role",
    "email",
    "password"
  );

  const existing_user = await User.findOne({ email: email });

  console.log("existing user", existing_user);

  if (existing_user && existing_user.verified) {
    return res.status(400).json({
      status: "error",
      message: "Email already in use, Please login.",
    });
  } else if (existing_user) {
    await User.findOneAndUpdate({ email: email }, filteredBody, {
      new: true,
      validateModifiedOnly: true,
    });

    req.userId = existing_user._id;
    next();
  } else {
    const new_user = await User.create(filteredBody);
    console.log("new user", new_user);

    req.userId = new_user._id;
    next();
  }
});

//send OTP

exports.sendOTP = catchAsync(async (req, res, next) => {
  console.log("Received userId in sendOTP:", req.userId); // Debugging

  const userId = req.userId;

  const new_otp = otpGenerator.generate(6, {
    upperCaseAlphabets: false,
    specialChars: false,
    lowerCaseAlphabets: false,
  });

  console.log("otp", new_otp);

  const otp_expiry_time = Date.now() + 10 * 60 * 1000;

  const user = await User.findByIdAndUpdate(userId, {
    otp_expiry_time: otp_expiry_time,
  });

  console.log("user", user);

  user.otp = new_otp.toString();

  await user.save({ new: true, validateModifiedOnly: true });

  // TODO send mail
  mailService.sendEmail({
    from: "karansayambar@gmail.com",
    to: user.email,
    subject: "Verification OTP",
    html: otpTemplate(user.firstName, new_otp),
    attachments: [],
  });

  res.status(200).json({
    status: "success",
    message: "OTP Sent Successfully!",
  });
});

// verify OTP

exports.verifyOTP = catchAsync(async (req, res, next) => {
  const { email, otp } = req.body;
  console.log(req.body);

  const user = await User.findOne({
    email,
    otp_expiry_time: { $gt: Date.now() }, // Ensure OTP is still valid
  });

  if (!user) {
    return res.status(400).json({
      status: "error",
      message: "Email is invalid or OTP expired",
    });
  }

  if (user.verified) {
    return res.status(400).json({
      status: "error",
      message: "Email is already verified",
    });
  }

  // Check if OTP is correct
  const isOTPValid = await user.correctOTP(otp, user.otp);
  if (!isOTPValid) {
    return res.status(400).json({
      status: "error",
      message: "OTP is incorrect",
    });
  }

  // Mark email as verified and remove OTP
  user.verified = true;
  user.otp = undefined;
  user.otp_expiry_time = undefined;

  user.markModified("verified"); // Ensure it updates
  await user.save({ new: true, validateModifiedOnly: true });

  // Generate JWT token
  const token = signToken(user._id);

  res.status(200).json({
    status: "success",
    message: "OTP verified Successfully!",
    token,
    user_id: user._id,
  });
});

// login User

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email: email }).select("+password");
  if (!user || !user.password) {
    res.status(400).json({
      status: "error",
      message: "user not found" || "Incorrect password",
    });
    return;
  }
let candidateProfileRole;
const profile = await candidateProfile.findOne({ userId: user._id });
if(profile){
  candidateProfileRole =profile.candidateInfo.title
}

  if (!user || !(await user.correctPassword(password, user.password))) {
    res.status(400).json({
      status: "error",
      message: "Email or Password is Invalid",
    });
    return;
  }

  const token = signToken(user._id);

  const response = {
    status: "success",
    message: "Logged in successfully!",
    token,
    user_id: user._id,
    role: user.role,
    title :candidateProfileRole
  };

  if (user.role === "company") {
    response.profileId = user.profileId || null;
    response.profileCreated = user.profileCreated || false;
  }

  res.status(200).json(response);
});

// protect
exports.protect = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.herders.authorization &&
    req.herders.authorization.startsWith("Bearer")
  ) {
    token = req.herders.authorization.split(" ")[1];
  } else if (req.cookie.jwt) {
    token = req.cookies.jwt;
  }

  if (token) {
    return res.status(401).json({
      message: "You are not logged in! Please log in to get access.",
    });
  }

  const decoded = await promisify(jwt.verify(token, process.env.JWT_SECRET));

  // 3) Check if user still exists
  Pending;
  const this_user = await User.findById(decoded.userId);
  if (!this_user) {
    return res.status(401).json({
      message: "The user belonging to this token does no longer exists.",
    });
  }

  // 4) Check if user changed password after the token was issued
  if (this_user.changedPasswordAfter(decoded.iat)) {
    return res.status(401).json({
      message: "User recently changed password! Please log in again.",
    });
  }

  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = this_user;
  next();
});

//forgot password

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  console.log(email);
  const user = await User.findOne({ email });

  if (!user) {
    return res.status(404).json({
      status: "error",
      message: "There is no user with email address.",
    });
  }

  // 2) Generate the random reset token
  const resetToken = user.createPasswordResetToken();

  await user.save({ validateBeforeSave: false });

  try {
    // 3) Send it to user's email
    const resetUrl = `http://localhost:5173/auth/new-password?token=${resetToken}`;

    mailService.sendEmail({
      from: "karansayambar@gmail.com.com",
      to: user.email,
      subject: "Reset Password",
      html: resetPassword(user.firstName, resetUrl),
      attachments: [],
    });
    res.status(200).json({
      status: "success",
      message: "Token sent to email!",
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save({ validateBeforeSave: false });

    return res.status(500).json({
      message: "There was an error sending the email. Try again later!",
    });
  }
});

//reset password

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on the token
  console.log(req.body);

  const hasedToken = crypto
    .createHash("sha256")
    .update(req.body.token)
    .digest("hex");

  const user = await User.findOne({
    passwordResetToken: hasedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // 2) If token has not expired, and there is user, set the new password
  if (!user) {
    return res.status(400).json({
      status: "error",
      message: "Token is Invalid or Expired",
    });
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // 3) Update changedPasswordAt property for the user

  // 4) Log the user in, send JWT
  const token = signToken(user._id);

  res.status(200).json({
    status: "success",
    message: "Password Reseted Successfully",
    token,
  });
});
