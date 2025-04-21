const resetPassword = (firstName, resetUrl) => {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <style>
      body {
        font-family: Arial, sans-serif;
        background-color: #f4f4f4;
        margin: 0;
        padding: 0;
      }
      .container {
        max-width: 600px;
        margin: 20px auto;
        background: #fff;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
        text-align: center;
      }
      .logo {
        width: 100px;
        margin-bottom: 20px;
      }
      .title {
        font-size: 22px;
        color: #333;
        margin-bottom: 10px;
      }
      .message {
        font-size: 16px;
        color: #555;
        margin-bottom: 20px;
        line-height: 1.5;
      }
      .button {
        display: inline-block;
        padding: 12px 24px;
        font-size: 16px;
        color: #fff;
        background-color: #007bff;
        text-decoration: none;
        border-radius: 5px;
      }
      .footer {
        font-size: 14px;
        color: #777;
        margin-top: 20px;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <img class="logo" src="https://your-logo-url.com/logo.png" alt="Company Logo">
      <h2 class="title">Reset Your Password</h2>
      <p class="message">Hello ${firstName},</p>
      <p class="message">We received a request to reset your password. Click the button below to reset it:</p>
      <a class="button" href="${resetUrl}" target="_blank">Reset Password</a>
      <p class="message">If you didn't request this, please ignore this email.</p>
      <p class="footer">© ${new Date().getFullYear()} Your Company. All rights reserved.</p>
    </div>
  </body>
  </html>
  `;
};

module.exports = resetPassword;
