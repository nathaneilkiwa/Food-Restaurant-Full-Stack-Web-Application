// menu.js

// menu.js

let cart = JSON.parse(localStorage.getItem('cart')) || [];

// ----- CART FUNCTIONS -----
function addToCart(item) {
  let cart = JSON.parse(localStorage.getItem('cart')) || [];

  const existingIndex = cart.findIndex(ci => ci.id === item.id);
  if (existingIndex > -1) {
    cart[existingIndex].quantity += 1;
  } else {
    cart.push({
      id: item.id,
      name: item.name,
      price: Number(item.price),
      quantity: 1
    });
  }

  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartCount();
}

function saveCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
}

function updateCartCount() {
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  const badge = document.getElementById('cart-count');
  if (badge) badge.textContent = count;
}

// ----- MENU TAB SWITCHING -----
function openMenu(evt, menuName) {
  document.querySelectorAll(".menu").forEach(menu => menu.style.display = "none");
  document.querySelectorAll(".tablink").forEach(tab => tab.classList.remove("active"));
  const targetMenu = document.getElementById(menuName);
  if (targetMenu) targetMenu.style.display = "block";
  if (evt && evt.currentTarget) evt.currentTarget.classList.add("active");
}

// ----- ON PAGE LOAD -----
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('Pizza').style.display = 'block';
  document.getElementById('mainLink').classList.add('active');
  updateCartCount();
});

// Expose globally for HTML inline handlers
window.addToCart = addToCart;
window.openMenu = openMenu;
