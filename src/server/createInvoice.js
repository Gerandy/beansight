import Xendit from "xendit-node";
import express from "express";

const router = express.Router();

const xendit = new Xendit({
  secretKey: "xnd_development_VIMcuQdS1A2UO5K3JY1cLD5vb3glIiMLoQ0PIBy1J3MyXDY6iDAgMUkyHXLUl", // TEST KEY
});

const { Invoice } = xendit;

router.post("/create-invoice", async (req, res) => {
  const { amount, orderId, description } = req.body;

  try {
    const invoice = await Invoice.createInvoice({
      externalId: orderId,
      amount,
      description,
      currency: "PHP",
      paymentMethods: ["GCASH"],
      successRedirectUrl: "http://localhost:3000/success",
      failureRedirectUrl: "http://localhost:3000/failed",
    });

    res.json(invoice);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
