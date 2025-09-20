# Restaurant (Wix-inspired) – Full-Stack

A fully responsive restaurant website inspired by modern Wix templates. Built with HTML, Bootstrap 5, CSS, and a Node.js/Express backend for bookings.

## Features
- Pages: Home, Menu, About, Booking
- Fully responsive (mobile-first, Bootstrap 5)
- Booking form with front-end and server-side validation
- MongoDB via Mongoose
- Clean, modern layout/components
- Simple admin endpoint to view bookings: `GET /admin/bookings` (requires `ADMIN_TOKEN`)

## Quick Start
```bash
npm install
cp .env.example .env
# edit .env: MONGODB_URI and ADMIN_TOKEN
npm run dev
```
- Frontend: http://localhost:4000
- API:
  - `POST /api/bookings`
  - `GET /admin/bookings` (header: `x-admin-token: YOUR_TOKEN`)


## Stripe Checkout Integration Added
Files added:
- server/src/routes/checkout.routes.js
- client/assets/js/cart.js
- client/checkout.html
- client/checkout-success.html

To enable payments:
1. Add `STRIPE_SECRET_KEY=sk_live_...` (or test key) and `CLIENT_URL=http://localhost:3000` to .env.
2. Run `npm install` to install stripe.
3. Start the server with `npm run dev` and serve the client (e.g., open client/menu.html) or serve the client from same server.



## Additional automatic updates
- Serving `client/` from Express (static files)
- Added Stripe webhook endpoint at POST `/api/webhook/stripe` (configure `STRIPE_WEBHOOK_SECRET` in .env)
- Injected `Add to cart` buttons into `client/menu.html` (best-effort).
- Booking model extended with `paid` and `meta` fields to capture Stripe info.


## Stripe Webhook with Ngrok (Local Testing)
1. Install ngrok: https://ngrok.com/download
2. Run your server locally on port 4000:
   ```bash
   npm run dev
   ```
3. In a second terminal, start ngrok:
   ```bash
   ngrok http 4000
   ```
4. Copy the https://xxxx.ngrok.io URL from ngrok output.
5. In Stripe Dashboard → Developers → Webhooks → Add endpoint:
   - URL: https://xxxx.ngrok.io/api/webhook/stripe
   - Events to send: checkout.session.completed
6. Copy the Signing Secret (whsec_...) and add to your `.env`:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxx
   ```
7. Test a checkout — Stripe will send events to your local server.
8. Use test cards (e.g. 4242 4242 4242 4242, any future expiry, any CVC).
