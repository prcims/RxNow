# RxNow — Medical Orders App Prototype

## Stripe Backend Setup


2. Install dependencies:
    ```bash
    npm install express cors stripe dotenv
    ```

3. Start the backend server:
    ```bash
    node server.js
    ```
    or
    ```bash
    npm run start:server
    ```

4. **How it works:**  
   - The frontend React app posts order details to `/api/create-stripe-session`.
   - The backend creates a Stripe Checkout session (using the server secret key).
   - The response contains `url` for Stripe Checkout; frontend redirects to Stripe for payment.

5. Change `success_url` and `cancel_url` to point to your production app domain when deploying!

---

**Codespaces Usage:**  
- Open two terminals:  
  - One for `npm run dev` (React frontend)  
  - One for `node server.js` (Stripe backend)

---

## Security

- **Do not commit .env with real Stripe secrets.**
- Only publishable key (`pk_live_...`) goes in frontend.
- Protect your backend server routes and enable auth/session tracking for real deployments.

---
