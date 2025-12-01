import React, { useState, useEffect } from "react";
import { searchMedicationsRxNorm } from "./medications";

// Stripe public key
const STRIPE_PK = "pk_test_MY_TEST_PUBLISHABLE_KEY"; // <--- Replace with your Stripe publishable key

export default function RxOrdersApp() {
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedMed, setSelectedMed] = useState(null);
  const [cart, setCart] = useState([]);
  const [orderNotes, setOrderNotes] = useState("");
  const [icd10, setIcd10] = useState("");
  const [instant, setInstant] = useState(false);

  // form fields for the selected med
  const [dosage, setDosage] = useState("");
  const [indication, setIndication] = useState("");
  const [quantity, setQuantity] = useState(30);
  const [refills, setRefills] = useState(0);

  // RxNorm live search
  useEffect(() => {
    if (query.length >= 2) {
      searchMedicationsRxNorm(query).then(setSearchResults);
    } else {
      setSearchResults([]);
    }
  }, [query]);

  function addSelectedToCart() {
    if (!selectedMed) return alert("Select a medication first");
    if (!dosage) return alert("Please enter a dosage");
    if (!indication) return alert("Please enter an indication");
    const item = {
      id: `${selectedMed.id}_${Date.now()}`,
      medId: selectedMed.id,
      name: selectedMed.name,
      strength: selectedMed.strength,
      form: selectedMed.form,
      dosage,
      indication,
      quantity: Number(quantity),
      refills: Number(refills)
    };
    setCart((c) => [...c, item]);
    setSelectedMed(null);
    setDosage("");
    setIndication("");
    setQuantity(30);
    setRefills(0);
    setQuery("");
  }

  function removeFromCart(itemId) {
    setCart((c) => c.filter((i) => i.id !== itemId));
  }

  function pricingForCount(count, instantFlag) {
    if (instantFlag) return { price: 75, note: "Instant order (<1 hour)" };
    if (count === 0) return { price: 0, note: "No items" };
    if (count <= 4) return { price: 30, note: "1–4 items — delivery up to 48 hrs" };
    if (count <= 10) return { price: 45, note: "5–10 items — delivery up to 48 hrs" };
    return { price: 55, note: "11+ items — delivery up to 48 hrs" };
  }

  const pricing = pricingForCount(cart.length, instant);

  async function handleCheckout() {
    if (cart.length === 0 && orderNotes.trim() === "") {
      return alert("Add at least one prescription or write a medical order/lab before checkout.");
    }

    const order = {
      id: `order_${Date.now()}`,
      items: cart,
      notes: orderNotes,
      icd10: icd10.trim(),
      instant,
      pricing,
      createdAt: new Date().toISOString()
    };

    // Call Stripe backend endpoint to create checkout session
    try {
      const res = await fetch("/api/create-stripe-session", {
        method: "POST",
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ amount: pricing.price * 100, order }),
      });
      const { url } = await res.json();
      if (url) window.location.href = url;
      else alert("Stripe session not created.");
    } catch (e) {
      alert("Payment failed: " + e.message);
    }
  }

  function exportJSON() {
    const payload = {
      items: cart,
      notes: orderNotes,
      icd10,
      instant,
      pricing
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `medical_order_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-md p-4 md:p-8">
        <header className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold">RxNow — Medical Orders Prototype</h1>
            <p className="text-sm text-gray-500 mt-1">RxNorm-powered search. Stripe Checkout integrated.</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600">Order items: <span className="font-medium">{cart.length}</span></div>
            <div className="mt-2 text-lg font-bold">Total: ${pricing.price}</div>
            <div className="text-xs text-gray-400">{pricing.note}</div>
          </div>
        </header>

        <main className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <section className="md:col-span-2">
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Search medication</label>
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search RxNorm..." className="w-full rounded-md border px-3 py-2" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-56 overflow-auto mb-4">
              {searchResults.map((m) => (
                <button key={m.id} onClick={() => { setSelectedMed(m); setQuery(`${m.name}`); }} className={`text-left p-3 rounded-lg border ${selectedMed?.id === m.id ? 'bg-indigo-50 border-indigo-300' : 'bg-white'}`}>
                  <div className="font-medium">{m.name}</div>
                  <div className="text-sm text-gray-500">{m.strength} • {m.form}</div>
                </button>
              ))}
            </div>
            <div className="p-4 rounded-lg border bg-gray-50">
              <h3 className="font-semibold mb-2">Selected medication</h3>
              {selectedMed ? (
                <div>
                  <div className="text-lg font-medium">{selectedMed.name} <span className="text-sm text-gray-500">{selectedMed.strength}</span></div>
                  <label className="block text-sm mt-3">Dosage</label>
                  <input value={dosage} onChange={(e) => setDosage(e.target.value)} placeholder="e.g., 1 tablet twice daily" className="w-full rounded-md border px-3 py-2" />
                  <label className="block text-sm mt-3">Indication</label>
                  <input value={indication} onChange={(e) => setIndication(e.target.value)} placeholder="e.g., Type 2 diabetes" className="w-full rounded-md border px-3 py-2" />
                  <div className="flex gap-3 mt-3">
                    <div className="flex-1">
                      <label className="block text-sm">Quantity (# pills)</label>
                      <input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} className="w-full rounded-md border px-3 py-2" />
                    </div>
                    <div className="w-36">
                      <label className="block text-sm">Refills</label>
                      <input type="number" value={refills} onChange={(e) => setRefills(e.target.value)} className="w-full rounded-md border px-3 py-2" />
                    </div>
                  </div>
                  <div className="mt-4 flex gap-3">
                    <button onClick={addSelectedToCart} className="px-4 py-2 rounded-lg bg-indigo-600 text-white">Add to order</button>
                    <button onClick={() => { setSelectedMed(null); setDosage(''); setIndication(''); }} className="px-4 py-2 rounded-lg border">Clear</button>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-gray-500">No medication selected.</div>
              )}
            </div>

            <div className="mt-4 p-4 rounded-lg border bg-white">
              <h3 className="font-semibold mb-2">Free-text Medical Orders/Labs</h3>
              <label className="block text-sm">Orders or Labs (describe what you need)</label>
              <textarea value={orderNotes} onChange={(e) => setOrderNotes(e.target.value)} rows={4} className="w-full rounded-md border px-3 py-2" placeholder="e.g., CBC with diff; Chest X-ray"></textarea>
              <label className="block text-sm mt-3">ICD-10 Diagnosis (optional)</label>
              <input value={icd10} onChange={(e) => setIcd10(e.target.value)} placeholder="e.g., E11.9" className="w-full rounded-md border px-3 py-2" />
              <div className="mt-3 flex items-center gap-3">
                <input id="instant" type="checkbox" checked={instant} onChange={(e) => setInstant(e.target.checked)} className="h-4 w-4" />
                <label htmlFor="instant" className="text-sm">Instant processing (&lt;1 hour): $75</label>
              </div>
            </div>
          </section>

          <aside className="md:col-span-1">
            <div className="sticky top-6">
              <div className="p-4 rounded-lg border bg-white mb-4">
                <h3 className="font-semibold">Order summary</h3>
                <div className="text-sm text-gray-500 mt-2">Items: {cart.length}</div>
                <ul className="mt-3 divide-y">
                  {cart.map((it) => (
                    <li key={it.id} className="py-2">
                      <div className="font-medium">{it.name} <span className="text-sm text-gray-500">{it.strength}</span></div>
                      <div className="text-sm text-gray-500">{it.dosage} • Qty: {it.quantity} • Refills: {it.refills}</div>
                      <div className="text-sm mt-1">Indication: {it.indication}</div>
                      <div className="mt-2 flex gap-2">
                        <button onClick={() => removeFromCart(it.id)} className="text-xs px-2 py-1 rounded border">Remove</button>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="mt-4">
                  <div className="text-sm">Pricing rule: <span className="font-medium">{pricing.note}</span></div>
                  <div className="text-2xl font-bold mt-2">${pricing.price}</div>
                </div>
                <div className="mt-4 flex flex-col gap-2">
                  <button onClick={handleCheckout} className="w-full px-4 py-2 rounded-lg bg-emerald-600 text-white">Proceed to payment</button>
                  <button onClick={exportJSON} className="w-full px-4 py-2 rounded-lg border">Export order (JSON)</button>
                </div>
                <div className="mt-3 text-xs text-gray-400">Payment now uses Stripe Checkout session via backend endpoint.</div>
              </div>
              <div className="p-4 rounded-lg border bg-white">
                <h4 className="font-semibold">Quick help</h4>
                <ul className="text-sm text-gray-600 mt-2 space-y-1">
                  <li>- Medications now loaded via RxNorm API (search by drug name).</li>
                  <li>- Stripe Checkout now enabled (see server endpoint example below).</li>
                  <li>- Implement backend auth and secure storage for production/HIPAA use.</li>
                </ul>
              </div>
            </div>
          </aside>
        </main>
        <footer className="mt-6 text-center text-sm text-gray-500">Prototype — not for production use. Add auth, secure backend, Stripe secret, HIPAA compliance for clinical use.</footer>
      </div>
    </div>
  );
}
