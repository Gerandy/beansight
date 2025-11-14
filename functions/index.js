const functions = require("firebase-functions");
const cors = require("cors")({ origin: true });
const Xendit = require("xendit-node");

// HTTP Cloud Function
exports.createInvoice = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method Not Allowed" });
    }

    try {
      const { amount, orderId, description } = req.body;

      const xenditClient = new Xendit({
        secretKey: functions.config().xendit.secret,
      });

      const { Invoice } = xenditClient;

      const invoice = await Invoice.createInvoice({
        externalId: orderId,
        amount,
        description,
        currency: "PHP",
        paymentMethods: ["GCASH"],
        successRedirectUrl: "http://localhost:3000/success",
        failureRedirectUrl: "http://localhost:3000/failed",
      });

      return res.json(invoice);

    } catch (err) {
      console.error("❌ Xendit Error:", err);
      return res.status(500).json({ error: err.message });
    }
  });
});
