// --- CART STORAGE ---
function getCart() {
  return JSON.parse(localStorage.getItem("cart")) || [];
}
function saveCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCount();
}

// --- CART BADGE ---
function updateCartCount() {
  const cart = getCart();
  const badge = document.getElementById("cart-count");
  if (badge) {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    badge.textContent = count;
  }
}

// --- RENDER CART TABLE ---
function renderCart() {
  const cart = getCart();
  const container = document.getElementById("cart-items");
  const totalEl = document.getElementById("cart-total");
  const checkoutBtn = document.querySelector(".btn.btn-primary");

  if (!container || !totalEl) return;

  container.innerHTML = "";

  if (cart.length === 0) {
    container.innerHTML = `<tr><td colspan="4" class="text-center">Your cart is empty</td></tr>`;
    totalEl.textContent = "0.00";
    if (checkoutBtn) checkoutBtn.style.display = "none";
    return;
  }

  let total = 0;
  cart.forEach((item, index) => {
    const row = document.createElement("tr");
    const subtotal = item.price * item.quantity;
    total += subtotal;

    row.innerHTML = `
      <td>${item.name}</td>
      <td>${item.quantity}</td>
      <td>$${subtotal.toFixed(2)}</td>
      <td><button class="btn btn-sm btn-danger" onclick="removeFromCart(${index})">Remove</button></td>
    `;
    container.appendChild(row);
  });

  totalEl.textContent = total.toFixed(2);
  if (checkoutBtn) checkoutBtn.style.display = "inline-block";
}

// --- REMOVE ITEM ---
function removeFromCart(index) {
  const cart = getCart();
  cart.splice(index, 1);
  saveCart(cart);
  renderCart();
}

// --- INIT ---
document.addEventListener("DOMContentLoaded", () => {
  updateCartCount();
  renderCart();
});

// expose globally
window.removeFromCart = removeFromCart;

// --- RENDER CHECKOUT PAGE ---
function renderCheckout() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const orderSummary = document.getElementById("order-summary");
  const totalEl = document.getElementById("checkout-total");

  if (!orderSummary || !totalEl) return; // exit if page elements not found

  orderSummary.innerHTML = ""; // clear previous items
  let total = 0;

  if (cart.length === 0) {
    orderSummary.innerHTML = '<li class="list-group-item">Your cart is empty</li>';
  } else {
    cart.forEach(item => {
      const li = document.createElement("li");
      li.className = "list-group-item d-flex justify-content-between align-items-center";
      li.textContent = `${item.name} x${item.quantity}`;
      const priceSpan = document.createElement("span");
      priceSpan.textContent = `R${(item.price * item.quantity).toFixed(2)}`;
      li.appendChild(priceSpan);
      orderSummary.appendChild(li);

      total += item.price * item.quantity;
    });
  }

  totalEl.textContent = `R${total.toFixed(2)}`;
}
