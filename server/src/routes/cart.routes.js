// --- CART STORAGE ---
const CART_KEY = "cart_v1";

function getCart() {
  return JSON.parse(localStorage.getItem(CART_KEY)) || [];
}
function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartCount();
}
function clearCart() {
  localStorage.removeItem(CART_KEY);
  updateCartCount();
}

// --- CART BADGE ---
function updateCartCount() {
  const cart = getCart();
  const totalQty = cart.reduce((sum, i) => sum + i.qty, 0);
  const el = document.getElementById("cart-count");
  if (el) el.textContent = totalQty;
}

// --- CART OPERATIONS ---
function addToCart(item) {
  let cart = getCart();
  let existing = cart.find(i => i.id === item.id);
  if (existing) {
    existing.qty += Number(item.qty || 1);
  } else {
    cart.push({ ...item, qty: Number(item.qty || 1) });
  }
  saveCart(cart);
  updateCartCount();
  alert(item.name + " added to cart!");
}

function updateQty(index, qty) {
  let cart = getCart();
  cart[index].qty = parseInt(qty);
  saveCart(cart);
  renderCart();
}

function removeItem(index) {
  let cart = getCart();
  cart.splice(index, 1);
  saveCart(cart);
  renderCart();
}

// --- RENDER CART PAGE ---
function renderCart() {
  const cart = getCart();
  const tbody = document.getElementById("cart-items");
  if (!tbody) return;

  tbody.innerHTML = "";
  let total = 0;
  cart.forEach((item, index) => {
    total += item.price * item.qty;
    tbody.innerHTML += `
      <tr>
        <td>${item.name}</td>
        <td>
          <input type="number" value="${item.qty}" min="1" class="form-control form-control-sm"
            onchange="updateQty(${index}, this.value)">
        </td>
        <td>$${(item.price * item.qty).toFixed(2)}</td>
        <td><button class="btn btn-sm btn-danger" onclick="removeItem(${index})">Remove</button></td>
      </tr>`;
  });
  document.getElementById("cart-total").innerText = total.toFixed(2);
}

// --- RENDER CHECKOUT SUMMARY ---
function renderCheckout() {
  const cart = getCart();
  const list = document.getElementById("order-summary");
  if (!list) return;

  list.innerHTML = "";
  let total = 0;
  cart.forEach(item => {
    total += item.price * item.qty;
    list.innerHTML += `<li class="list-group-item d-flex justify-content-between">
      ${item.name} x ${item.qty}
      <span>$${(item.price * item.qty).toFixed(2)}</span>
    </li>`;
  });
  document.getElementById("checkout-total").innerText = total.toFixed(2);
}

// --- CHECKOUT HANDLER ---
// --- CHECKOUT HANDLER ---
function initCheckoutForm() {
  const form = document.getElementById("checkout-form");
  if (!form) return;

  form.addEventListener("submit", async e => {
    e.preventDefault();
    const cart = getCart();
    if (cart.length === 0) {
      alert("Your cart is empty!");
      return;
    }

    const response = await fetch("/api/checkout/create-checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: cart, // ✅ send as `items`
        customer: {
          name: document.getElementById("name").value,
          email: document.getElementById("email").value,
          phone: document.getElementById("phone").value,
          date: document.getElementById("date").value,
          time: document.getElementById("time").value,
          requests: document.getElementById("requests").value
        }
      })
    });

    const data = await response.json();

    if (data.id && data.publicKey) {
      const stripe = Stripe(data.publicKey);

      // ✅ clear cart *before* redirecting away
      clearCart();

      await stripe.redirectToCheckout({ sessionId: data.id });
    } else {
      alert("Error starting checkout");
      console.error("Checkout response:", data);
    }
  });
}


// --- INIT ---
window.addEventListener("DOMContentLoaded", () => {
  updateCartCount();
  renderCart();
  renderCheckout();
  initCheckoutForm();

  // ✅ Support add-to-cart buttons with data attributes
  document.body.addEventListener("click", e => {
    const btn = e.target.closest && e.target.closest(".add-to-cart");
    if (!btn) return;
    const id = btn.dataset.id || ("item-" + Date.now());
    const name = btn.dataset.name || btn.dataset.title || btn.textContent.trim();
    const price = parseFloat(btn.dataset.price || btn.dataset.amount || "0");
    const description = btn.dataset.description || "";
    addToCart({ id, name, price, description, qty: 1 });

    // simple feedback
    btn.textContent = "Added ✓";
    setTimeout(() => {
      btn.textContent = "Add to cart";
    }, 1000);
  });
});
