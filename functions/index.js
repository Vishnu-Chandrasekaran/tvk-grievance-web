const admin = require("firebase-admin");
const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { setGlobalOptions } = require("firebase-functions/v2");
const sgMail = require("@sendgrid/mail");

admin.initializeApp();
setGlobalOptions({ region: "us-central1" });

sgMail.setApiKey(
  "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",
);

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
    const complaintId = event.params.id;

    // const attachments = (data.files || []).map((file) => ({
    //   content: file.content, // base64
    //   filename: file.name,
    //   type: file.type,
    //   disposition: "attachment",
    // }));

    // const msg = {
    //   to: "admin-tvkgrieve@yopmail.com",
    //   from: "vishnu-tvk-grieve@yopmail.com",
    //   subject: "🚨 New Complaint",
    //   html: `
    //     <h2>New Complaint</h2>
    //     <p>${data.description}</p>
    //     <p>${data.department}</p>
    //     <p>${data.location?.lat}, ${data.location?.lng}</p>
    //   `,
    //   attachments,
    // };

    const attachmentsRaw = await Promise.all(
      (data.files || []).map(async (file) => {
        try {
          if (!file?.path) return null;

          const bucket = admin.storage().bucket();

          const [exists] = await bucket.file(file.path).exists();
          if (!exists) return null;

          const [buffer] = await bucket.file(file.path).download();

          if (!buffer || buffer.length === 0) return null;

          return {
            content: buffer.toString("base64"),
            filename: file.name || "file",
            type: file.type || "application/octet-stream",
            disposition: "attachment",
          };
        } catch (err) {
          console.error("Attachment build failed:", err);
          return null;
        }
      }),
    );

    // 🔥 IMPORTANT: FINAL FILTER (this is what fixes your error)
    const attachments = attachmentsRaw.filter(
      (a) => a && typeof a.content === "string" && a.content.length > 0,
    );

    const msg = {
      to: "admin-tvkgrieve@yopmail.com",
      from: "vishnu-tvk-grieve@yopmail.com",
      subject: "🚨 New Complaint - #${complaintId}",
      html: `
        <h2>New Complaint</h2>
        <p>${data.description}</p>
        <p>${data.department}</p>
        <p>${data.location?.lat}, ${data.location?.lng}</p>
      `,
      attachments, // 🔥 SAFE ARRAY ONLY
    };

    await sgMail.send(msg);
  },
);
