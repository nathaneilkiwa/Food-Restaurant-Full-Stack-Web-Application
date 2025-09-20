const express = require('express');
const router = express.Router();
const Stripe = require('stripe');
const stripeSecret = process.env.STRIPE_SECRET_KEY;
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
const stripe = stripeSecret ? new Stripe(stripeSecret, { apiVersion: '2024-06-20' }) : null;
const Booking = require('../models/Booking.js');

// Stripe webhook endpoint
router.post('/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  if (!stripe) return res.status(500).send('Stripe not configured');

  const sig = req.headers['stripe-signature'];
  let event;

  try {
    if (webhookSecret) {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } else {
      // Dev fallback (not recommended for prod)
      event = JSON.parse(req.body.toString());
    }
  } catch (err) {
    console.error('❌ Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    try {
      const order = new Booking({
        name: session.metadata?.name || session.customer_details?.name || 'Stripe Customer',
        email: session.metadata?.email || session.customer_details?.email || '',
        phone: session.metadata?.phone || '',
        date: session.metadata?.date || new Date().toISOString().slice(0,10),
        time: session.metadata?.time || new Date().toISOString().slice(11,16),
        partySize: Number(session.metadata?.partySize) || 1,
        notes: session.metadata?.requests || `Stripe payment: ${session.payment_status}`,
        paid: session.payment_status === 'paid',
        paymentStatus: session.payment_status,
        meta: {
          stripeSessionId: session.id,
          amount_total: session.amount_total
        }
      });

      await order.save();
      console.log('✅ Booking saved from webhook:', order._id);
    } catch (err) {
      console.error('❌ Failed to save booking from webhook', err);
    }
  }

  res.json({ received: true });
});

module.exports = router;
