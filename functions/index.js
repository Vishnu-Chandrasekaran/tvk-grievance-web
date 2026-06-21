const admin = require("firebase-admin");
const { onDocumentCreated } = require("firebase-functions/v2/firestore");

admin.initializeApp();

/**
 * ⚠️ IMPORTANT:
 * DO NOT initialize SendGrid at top level
 * (this causes Cloud Run crash)
 */

const departmentEmails = {
  "IT Support": "it-tvkgrieve@yopmail.com",
  HR: "hr-tvkgrieve@yopmail.com",
  Finance: "finance-tvkgrieve@yopmail.com",
  Admin: "admin-tvkgrieve@yopmail.com",
};

exports.sendComplaintEmail = onDocumentCreated(
  "complaints/{id}",
  async (event) => {
    try {
      const data = event.data.data();
      console.log("DATA RECEIVED:", data);
      // 🔥 IMPORT SendGrid INSIDE function (critical fix)
      const sgMail = require("@sendgrid/mail");

      // ⚠️ SET API KEY INSIDE FUNCTION (prevents startup crash)
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);
      console.log(`📧 SENDING EMAIL NOW ${process.env.SENDGRID_API_KEY}`);


      const toEmail = "admin-tvkgrieve@yopmail.com";

      const msg = {
        to: toEmail,
        from: "vishnu-tvk-grieve@yopmail.com",
        subject: "New Complaint Received",
        html: `
          <h2>New Complaint</h2>
          <p>${data.description}</p>
          <p>${data.department}</p>
          <p>${JSON.stringify(data.location)}</p>
        `,
      };

      await sgMail.send(msg);

      console.log("Email sent successfully");
    } catch (err) {
      console.error("Function error:", err);
    }
  }
);