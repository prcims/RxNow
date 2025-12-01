# RxNow — Medical Orders App Prototype

**Developed by prcims.**

## Overview

RxNow is a medical prescription and order entry prototype that's mobile-first, built in React + Vite, styled with Tailwind CSS.  
It supports searching medications (expandable DB/API), prescription entry, pricing rules, order export, and a Stripe-ready payment flow (placeholder).

### Features

- Mobile-friendly UI, React + Tailwind
- Search & select from medications (expandable DB, RxNorm API ready)
- Dose, indication, quantity, refills per drug
- Free-text labs/orders, ICD-10 DX field
- Pricing: $30/1-4 items, $45/5-10 items, $55/11+, $75 instant
- Order/Cart preview, JSON export
- Stripe payment flow placeholder
- Easily expandable to thousands of meds with `src/medications.full.csv`
- RxNorm API integration ready (see `src/medications.js`)

## Quick Start

1. Clone the repo:
   ```bash
   git clone https://github.com/prcims/RxNow.git
   cd RxNow
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start development:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:5173](http://localhost:5173) in browser.

## Expanding Medication Database

- To load a huge list, add to `src/medications.full.csv`.  
- Use `medications.js` to switch to API mode (RxNorm or other).

## Stripe Payment Integration

- Replace the `handleCheckout` function in `src/App.jsx` with live Stripe session creation:
  See [Stripe Docs: Checkout](https://stripe.com/docs/checkout) for server endpoints and client redirection.
- Example:
  ```
  // Server: create Stripe Checkout session and return URL
  // Client: window.location = session.url
  ```

## Security & Production

- This prototype does NOT include auth, HIPAA compliance, audit logging, or backend order storage.
- Secure diagnosis/order data with encryption before launch!

## License

MIT

## Author

prcims
