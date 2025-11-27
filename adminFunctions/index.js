const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();


function generateRandomPassword(length = 10) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}


exports.generateTempPassword = functions.https.onCall(async (data) => {
  const tempPassword = generateRandomPassword();


  return { tempPassword };
});
