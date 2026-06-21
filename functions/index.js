const admin = require("firebase-admin");
const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { setGlobalOptions } = require("firebase-functions/v2");

admin.initializeApp();
setGlobalOptions({ region: "us-central1" });

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

      const sgMail = require("@sendgrid/mail");
      sgMail.setApiKey("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");

      const bucket = admin.storage().bucket();

      // Convert file URLs → signed URLs
      const attachmentsHTML = await Promise.all(
        (data.files || []).map(async (file) => {
          try {
            // Extract file path from full URL
            // Example: complaints/abc.jpg
            const pathMatch = file.url.match(/complaints%2F[^?]+/);
            const filePath = pathMatch
              ? decodeURIComponent(pathMatch[0])
              : null;

            let signedUrl = file.url;

            if (filePath) {
              const [url] = await bucket.file(filePath).getSignedUrl({
                action: "read",
                expires: Date.now() + 60 * 60 * 1000, // 1 hour
              });
              signedUrl = url;
              console.log(`Generated signed URL for ${file.name}: ${signedUrl}`);
            }

            return `
              <div style="margin-bottom:12px;padding:10px;border:1px solid #eee;border-radius:6px;">
                <p><b>Name:</b> ${file.name}</p>
                <p><b>Type:</b> ${file.type}</p>
                <a href="${signedUrl}" target="_blank">
                  📎 Open Attachment
                </a>
              </div>
            `;
          } catch (err) {
            console.error("File URL error:", err);
            return `<p>⚠️ Attachment unavailable</p>`;
          }
        })
      );

      const toEmail =
        departmentEmails[data.department] || "admin-tvkgrieve@yopmail.com";

      const msg = {
        to: toEmail,
        from: "vishnu-tvk-grieve@yopmail.com",
        subject: "🚨 New Complaint Received",
        html: `
          <div style="font-family:Arial">

            <h2>New Complaint</h2>

            <p><b>Description:</b> ${data.description}</p>
            <p><b>Department:</b> ${data.department}</p>

            <p><b>Location:</b> ${data.location?.lat}, ${data.location?.lng}</p>

            <hr/>

            <h3>📎 Attachments</h3>
            ${attachmentsHTML.join("")}

          </div>
        `,
      };

      await sgMail.send(msg);

      console.log("Email sent successfully");
    } catch (err) {
      console.error("SendGrid Function Error:", err);
    }
  }
);