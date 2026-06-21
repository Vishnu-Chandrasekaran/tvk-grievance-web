const admin = require("firebase-admin");
const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { setGlobalOptions } = require("firebase-functions/v2");
const sgMail = require("@sendgrid/mail");

admin.initializeApp();
setGlobalOptions({ region: "us-central1" });

sgMail.setApiKey("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");

const departmentEmails = {
  "IT Support": "it-tvkgrieve@yopmail.com",
  HR: "hr-tvkgrieve@yopmail.com",
  Finance: "finance-tvkgrieve@yopmail.com",
  Admin: "admin-tvkgrieve@yopmail.com",
};

exports.sendComplaintEmail = onDocumentCreated(
  "complaints/{id}",
  async (event) => {
   const data = event.data.data();

    const attachments = (data.files || []).map((file) => ({
      content: file.content, // base64
      filename: file.name,
      type: file.type,
      disposition: "attachment",
    }));

    const msg = {
      to: "admin-tvkgrieve@yopmail.com",
      from: "vishnu-tvk-grieve@yopmail.com",
      subject: "🚨 New Complaint",
      html: `
        <h2>New Complaint</h2>
        <p>${data.description}</p>
        <p>${data.department}</p>
        <p>${data.location?.lat}, ${data.location?.lng}</p>
      `,
      attachments,
    };

    await sgMail.send(msg);}
);