import { https } from "firebase-functions";
import { initializeApp } from "firebase-admin";
initializeApp();

export const paymongoWebhook = https.onRequest((req, res) => {
  const event = req.body;
  console.log("Incoming webhook:", event);
  res.status(200).send("Webhook received");
});
