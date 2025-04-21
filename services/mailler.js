const sgMail = require("@sendgrid/mail");

const SENDGRID_API_KEY =
  "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";

sgMail.setApiKey(SENDGRID_API_KEY);

const sendSGMail = async ({ to, sender, subject, html, attachments, text }) => {
  try {
    const from = "karansayambar@gmail.com";

    const msg = {
      to: to, // Change to your recipient
      from: from, // Change to your verified sender
      subject: subject,
      html: html,
      // text: text,
      attachments,
    };

    return sgMail.send(msg);
  } catch (error) {
    console.log(error);
  }
};

exports.sendEmail = async (args) => {
  if (!process.env.NODE_ENV === "development") {
    return Promise.resolve();
  } else {
    return sendSGMail(args);
  }
};
