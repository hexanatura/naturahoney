const admin = require("firebase-admin");

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
});

async function setAdmin() {
  const uid = "5kGzG61rlMWqzPfY1DiG7x0XfU52";

  await admin.auth().setCustomUserClaims(uid, { admin: true });
  console.log("Admin claim set for:", uid);
}

setAdmin().catch(console.error);
