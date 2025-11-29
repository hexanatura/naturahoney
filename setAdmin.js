const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");  // rename if needed

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

async function setAdmin() {
  const uid = "5kGzG61rlMWqzPfY1DiG7x0XfU52";

  await admin.auth().setCustomUserClaims(uid, { admin: true });
  console.log("Admin claim set for:", uid);
}

setAdmin().catch(console.error);
