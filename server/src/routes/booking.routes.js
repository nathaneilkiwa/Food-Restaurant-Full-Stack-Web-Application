const express = require("express");
const Stripe = require("stripe");
const Booking = require("../models/Booking");

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-06-20"
});

// Create Checkout Session
router.post("/create-checkout-session", async (req, res) => {
  try {
    const { cart, customer } = req.body;

    if (!cart || cart.length === 0) {
      return res.status(400).json({ error: "Cart is empty" });
    }

    const line_items = cart.map(item => ({
      price_data: {
        currency: "usd",
        product_data: { name: item.name },
        unit_amount: Math.round(item.price * 100)
      },
      quantity: item.qty
    }));

    const totalAmount = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items,
      mode: "payment",
      customer_email: customer?.email,
      metadata: {
        name: customer?.name || "",
        phone: customer?.phone || "",
        date: customer?.date || "",
        time: customer?.time || "",
        requests: customer?.requests || "",
        items: JSON.stringify(cart),
        totalAmount: totalAmount.toString()
      },
      success_url: `${process.env.CLIENT_URL}/checkout-success.html`,
      cancel_url: `${process.env.CLIENT_URL}/cart.html`
    });

    res.json({
      id: session.id,
      publicKey: process.env.STRIPE_PUBLISHABLE_KEY
    });
  } catch (err) {
    console.error("Stripe session error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Stripe Webhook (should be in webhook.routes.js ideally)
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];
    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error("Webhook signature error:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      try {
        // Prevent duplicate booking
        const existing = await Booking.findOne({ stripeSessionId: session.id });
        if (!existing) {
          const booking = new Booking({
            name: session.metadata.name,
            email: session.customer_email,
            phone: session.metadata.phone,
            date: session.metadata.date,
            time: session.metadata.time,
            requests: session.metadata.requests,
            items: JSON.parse(session.metadata.items),
            totalAmount: Number(session.metadata.totalAmount),
            paymentStatus: "paid",
            stripeSessionId: session.id
          });

          await booking.save();
          console.log("✅ Booking saved:", booking._id);
        }
      } catch (dbErr) {
        console.error("Error saving booking:", dbErr);
      }
    }

    res.json({ received: true });
  }
);

module.exports = router;
