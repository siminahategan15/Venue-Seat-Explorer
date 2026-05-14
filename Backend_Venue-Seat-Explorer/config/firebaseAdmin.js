const admin = require("firebase-admin");
const serviceAccount = require("./venue-seat-explorer-firebase-adminsdk-fbsvc-6705d49f01.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;
