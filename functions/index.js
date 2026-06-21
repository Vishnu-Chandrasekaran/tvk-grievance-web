const admin = require("firebase-admin");
const { onDocumentCreated } = require("firebase-functions/v2/firestore");

admin.initializeApp();

exports.sendComplaintEmail = onDocumentCreated(
  "complaints/{id}",
  async (event) => {
    const data = event.data.data();

    console.log("Complaint received:", data);

    return null;
  }
);