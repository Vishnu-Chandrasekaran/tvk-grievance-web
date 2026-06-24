const admin = require("firebase-admin");
const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { setGlobalOptions } = require("firebase-functions/v2");
const { onMessagePublished } = require("firebase-functions/v2/pubsub");
const sgMail = require("@sendgrid/mail");
const { CloudBillingClient } = require('@google-cloud/billing');

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
const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT;
const PROJECT_NAME = `projects/${PROJECT_ID}`;
const billingClient = new CloudBillingClient();

/**
 * Pub/Sub-triggered Cloud Function to automatically stop billing.
 */
exports.stopBilling = onMessagePublished("billing-alerts-topic",  async (pubsubEvent) => {
  const pubsubMessage = pubsubEvent.data.message;
  // Decode the incoming Pub/Sub message payload
  const pubsubData = JSON.parse(
    Buffer.from(pubsubEvent.data, 'base64').toString()
  );

  console.log(`Current Cost: ${pubsubData.costAmount}, Budget Limit: ${pubsubData.budgetAmount}`);
  console.log(`Message ${pubsubMessage}`);

  // Only take action if the spending has actually met or exceeded the budget
  if (pubsubData.costAmount < pubsubData.budgetAmount) {
    console.log(`No action necessary. Spend is below the target.`);
    return 'Spend is below budget.';
  }

  if (!PROJECT_ID) {
    console.error('Error: GOOGLE_CLOUD_PROJECT environment variable is not defined.');
    return 'No project specified.';
  }

  const isEnabled = await isBillingEnabled(PROJECT_NAME);
  if (isEnabled) {
    return await disableBillingForProject(PROJECT_NAME);
  } else {
    console.log('Billing is already disabled for this project.');
    return 'Billing already disabled.';
  }
});

/**
 * Checks if billing is currently active on the project.
 */
async function isBillingEnabled(projectName) {
  try {
    const [res] = await billingClient.getProjectBillingInfo({ name: projectName });
    return res.billingEnabled;
  } catch (err) {
    console.error('Unable to determine billing status, proceeding to disable:', err);
    return true; // Assume active to proceed with safety shut-off
  }
}

/**
 * Detaches the billing account, triggering a project safety shut-off.
 */
async function disableBillingForProject(projectName) {
  try {
    const [res] = await billingClient.updateProjectBillingInfo({
      name: projectName,
      projectBillingInfo: { billingAccountName: '' } // Setting to empty string disables billing
    });
    console.log(`Billing successfully disabled: ${JSON.stringify(res)}`);
    return `Billing disabled for ${projectName}`;
  } catch (err) {
    console.error(`Failed to disable billing:`, err);
    throw err;
  }
}


exports.sendComplaintEmail = onDocumentCreated(
  "complaints/{id}",

  //   async (event) => {
  //     const data = event.data.data();
  //     const complaintId = event.params.id;

  //     // const attachments = (data.files || []).map((file) => ({
  //     //   content: file.content, // base64
  //     //   filename: file.name,
  //     //   type: file.type,
  //     //   disposition: "attachment",
  //     // }));

  //     // const msg = {
  //     //   to: "admin-tvkgrieve@yopmail.com",
  //     //   from: "vishnu-tvk-grieve@yopmail.com",
  //     //   subject: "🚨 New Complaint",
  //     //   html: `
  //     //     <h2>New Complaint</h2>
  //     //     <p>${data.description}</p>
  //     //     <p>${data.department}</p>
  //     //     <p>${data.location?.lat}, ${data.location?.lng}</p>
  //     //   `,
  //     //   attachments,
  //     // };

  //     const attachmentsRaw = await Promise.all(
  //       (data.files || []).map(async (file) => {
  //         try {
  //           if (!file?.path) return null;

  //           const bucket = admin.storage().bucket();

  //           const [exists] = await bucket.file(file.path).exists();
  //           if (!exists) return null;

  //           const [buffer] = await bucket.file(file.path).download();

  //           if (!buffer || buffer.length === 0) return null;

  //           return {
  //             content: buffer.toString("base64"),
  //             filename: file.name || "file",
  //             type: file.type || "application/octet-stream",
  //             disposition: "attachment",
  //           };
  //         } catch (err) {
  //           console.error("Attachment build failed:", err);
  //           return null;
  //         }
  //       }),
  //     );

  //     // 🔥 IMPORTANT: FINAL FILTER (this is what fixes your error)
  //     const attachments = attachmentsRaw.filter(
  //       (a) => a && typeof a.content === "string" && a.content.length > 0,
  //     );

  async (event) => {
    try {
      const data = event.data.data();
      const bucket = admin.storage().bucket();

      const complaintId = event.params.id;

      const attachments = [];

      for (const file of data.files || []) {
        try {
          // 🔥 file.path must be like: complaints/uuid-filename.jpg
          const filePath = file.path;

          if (!filePath) continue;

          const fileBuffer = await bucket.file(filePath).download();

          const base64 = fileBuffer[0].toString("base64");

          const attachmentsHTML = (data.files || [])
            .map((file) => {
              return `
                        <div style="margin-bottom:10px;">
                            <p><b>${file.name}</b></p>
                            <a href="${file.url}" target="_blank">
                            📎 Open Attachment
                            </a>
                        </div>
                        `;
            })
            .join("");

          attachments.push({
            content: base64,
            filename: file.name,
            type: file.type || "application/octet-stream",
            disposition: "attachment",
          });
        } catch (err) {
          console.error("Attachment error:", err);
        }
      }

      const attachmentsHTML = (data.files || [])
        .map((file) => {
          const url = file.url || file.path;

          return `
                <div style="margin-bottom:10px;">
                    <p><b>${file.name}</b></p>
                    <a href="${url}" target="_blank">📎 View File</a>
                </div>
                `;
        })
        .join("");

      const msg = {
        to: "admin-tvkgrieve@yopmail.com",
        from: "vishnu-tvk-grieve@yopmail.com",
        subject: `🚨 New Complaint - # ${complaintId}`,
        html: `
        <h2>New Complaint</h2>
        <p><b>Complaint ID:</b> ${complaintId}</p>
        <p><b>Description:</b> ${data.description}</p>
        <p><b>Address:</b> ${data.location?.address}</p>
        <p><b>Latitude:</b> ${data.location?.lat}, <b>Longitude:</b> ${data.location?.lng}</p>
        ${attachmentsHTML} `,
        // attachments: attachments,
        // 🔥 SAFE ARRAY ONLY
      };

      await sgMail.send(msg);
      console.log("Email sent with attachments");
    } catch (err) {
      console.error("SendGrid Function Error:", err);
    }
  },
);




