const express = require('express');
const cors = require('cors');
const Stripe = require('stripe');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// Load Stripe secret key from env variable
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

app.post('/api/create-stripe-session', async (req, res) => {
  const { amount, order } = req.body;
  if (!amount) return res.status(400).json({ error: 'Missing payment amount' });

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'RxNow Medical Order',
            description: `Order #${order.id} (${order.items.length} items)`,
          },
          unit_amount: amount, // in cents
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: 'http://localhost:5173/success',
      cancel_url: 'http://localhost:5173/cancel',
    });
    res.json({ url: session.url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Stripe server running on ${PORT}`));
