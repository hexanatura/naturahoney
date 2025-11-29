const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");  // rename if needed

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

async function setAdmin() {
  const uid = "hTN0c8z381aFrQYC5ZkbPx7bG3E3";

  await admin.auth().setCustomUserClaims(uid, { admin: true });
  console.log("Admin claim set for:", uid);
}

setAdmin().catch(console.error);
