const express = require('express');
const router = express.Router();
const Stripe = require('stripe');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Create Checkout Session
router.post('/create-checkout-session', async (req, res, next) => {
  try {
    if (!stripe) return res.status(500).json({ error: 'Stripe not configured' });

    const { items, customer } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'No items provided' });
    }

    if (!global.stripePriceCache) global.stripePriceCache = {};
    const line_items = [];

    for (const item of items) {
      let priceId = global.stripePriceCache[item.id];

      if (!priceId) {
        // Create product & price (only once per item.id)
        const product = await stripe.products.create({
          name: item.name,
          description: item.description || ''
        });

        const price = await stripe.prices.create({
          unit_amount: Math.round(Number(item.price) * 100),
          currency: process.env.CURRENCY || 'zar',
          product: product.id
        });

        priceId = price.id;
        global.stripePriceCache[item.id] = priceId;
      }

      line_items.push({ price: priceId, quantity: Number(item.qty || 1) });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      success_url: `${process.env.CLIENT_URL}/checkout-success.html`,
      cancel_url: `${process.env.CLIENT_URL}/checkout.html`,
      customer_email: customer?.email || undefined
    });

    res.json({ id: session.id, publicKey: process.env.STRIPE_PUBLIC_KEY });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
