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
      sgMail.setApiKey(
        "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",
      );
      console.log(`📧 SENDING EMAIL NOW ${process.env.SENDGRID_API_KEY}`);

      const toEmail = "admin-tvkgrieve@yopmail.com";

      const msg = {
        to: toEmail,
        from: "vishnu-tvk-grieve@yopmail.com",
        subject: "New Complaint Received",
        html: `
          <h2>🚨 New Complaint Received</h2>

            <p><b>Description:</b> ${data.description}</p>
            <p><b>Department:</b> ${data.department}</p>

            <p><b>Location:</b> 
                ${data.location?.lat}, ${data.location?.lng}
            </p>

            <hr/>

            <h3>📎 Attachments</h3>
           ${
             data.files && data.files.length > 0
               ? data.files
                   .map(
                     (file) => `
              <div style="margin-bottom:10px;">
                <p><b>Name:</b> ${file.name}</p>
                <p><b>Type:</b> ${file.type}</p>
                <a href="${file.url}" target="_blank">
                  🔗 View Attachment
                </a>
              </div>
            `,
                   )
                   .join("")
               : "<p>No attachments</p>"
           } `,
      };

      await sgMail.send(msg);

      console.log("Email sent successfully");
    } catch (err) {
      console.error("Function error:", err);
    }
  },
);
