console.log('[main.js] Cargado ✅');

const API_URL = "http://127.0.0.1:8000/api";
const STORAGE_KEY = 'carrito_v1';
const CLP = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 });

const Carrito = {
  obtener(){ try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; } catch { return []; } },
  guardar(items){ localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); },
  agregar({ id, nombre, precio, cantidad=1 }){ const items=this.obtener(); const i=items.findIndex(p=>p.id===id); if(i>=0) items[i].cantidad+=cantidad; else items.push({id,nombre,precio,cantidad}); this.guardar(items); return items; },
  eliminar(id){ const items=this.obtener().filter(p=>p.id!==id); this.guardar(items); return items; },
  actualizarCantidad(id,cantidad){ const c=Math.max(1, parseInt(cantidad,10)||1); const items=this.obtener().map(p=>p.id===id?{...p,cantidad:c}:p); this.guardar(items); return items; },
  vaciar(){ this.guardar([]); },
  total(){ return this.obtener().reduce((acc,p)=>acc+p.precio*p.cantidad,0); }
};

async function obtenerProductos() {
  try {
    const res = await fetch(`${API_URL}/products`);
    if (!res.ok) throw new Error(`Error HTTP ${res.status}`);
    const data = await res.json();
    return data;
  } catch (e) {
    console.error("❌ Error al obtener productos:", e);
    return [];
  }
}

function cardHTML(p) {
  const agotado = (p.stock ?? 999) <= 0;
  return `
    <div class="smoothie-card">
      <div class="smoothie-img" style="background-color:${p.color};"></div>
      <div class="smoothie-info">
        <h3 class="smoothie-name">${p.name}</h3>
        <p class="smoothie-desc">${p.description}</p>
        <p class="smoothie-price">${CLP.format(p.price)}</p>
        <button class="add-to-cart" data-id="${p.id}" data-name="${p.name}" data-price="${p.price}" ${agotado?'disabled':''}>
          ${agotado?'No Disponible':'Agregar al Carrito'}
        </button>
      </div>
    </div>
  `;
}

async function renderCatalog(filtro='') {
  const grid = document.getElementById('smoothies-grid');
  if (!grid) return;
  grid.innerHTML = `<p style="text-align:center;">Cargando productos...</p>`;
  const base = await obtenerProductos();
  if (!base.length) { grid.innerHTML = `<p style="text-align:center;color:red;">Error al cargar los productos 😢</p>`; return; }
  const items = filtro ? base.filter(p => (p.name + ' ' + p.description).toLowerCase().includes(filtro.toLowerCase())) : base;
  grid.innerHTML = items.map(cardHTML).join('');
}

function setupSearch() {
  const input = document.getElementById('search');
  if (!input) return;
  input.addEventListener('input', () => renderCatalog(input.value.trim()));
}

document.addEventListener('click', (e) => {
  const btn = e.target.closest('.add-to-cart');
  if (!btn) return;
  const { id, name, price } = btn.dataset;
  if (!id || !name || !price) return;
  Carrito.agregar({ id: parseInt(id), nombre: name, precio: parseInt(price,10), cantidad: 1 });
  alert(`✅ ${name} agregado al carrito`);
  renderCarrito();
});

function renderCarrito() {
  const cont = document.getElementById('carrito-lista');
  if (!cont) return;

  const items = Carrito.obtener();
  cont.innerHTML = '';

  if (!items.length) { cont.innerHTML = `<p>Tu carrito está vacío.</p>`; return; }

  let total = 0;
  items.forEach(p => total += p.precio * p.cantidad);

  const list = items.map(p => `
    <div class="carrito-item">
      <span>${p.nombre}</span>
      <input type="number" min="1" value="${p.cantidad}" data-id="${p.id}" class="cart-qty"/>
      <span>${CLP.format(p.precio * p.cantidad)}</span>
      <button class="cart-remove" data-id="${p.id}">Eliminar</button>
    </div>
  `).join('');

  cont.innerHTML = list + `
    <div class="carrito-total">
      <strong>Total:</strong> ${CLP.format(total)}<br>
      <button id="cart-clear">Vaciar carrito</button>
      <button id="cart-checkout">Confirmar pedido</button>
    </div>
  `;

  cont.querySelectorAll('.cart-qty').forEach(input => {
    input.addEventListener('change', () => {
      Carrito.actualizarCantidad(parseInt(input.dataset.id), input.value);
      renderCarrito();
    });
  });

  cont.querySelectorAll('.cart-remove').forEach(btn => {
    btn.addEventListener('click', () => {
      Carrito.eliminar(parseInt(btn.dataset.id));
      renderCarrito();
    });
  });

  cont.querySelector('#cart-clear').addEventListener('click', () => {
    if (confirm('¿Vaciar carrito?')) { Carrito.vaciar(); renderCarrito(); }
  });

  cont.querySelector('#cart-checkout').addEventListener('click', confirmarCompra);
}

async function confirmarCompra() {
  // 👉 usa email de sesión si existe
  const u = window.Auth?.currentUser ? Auth.currentUser() : null;
  let email = u?.email;
  if (!email) email = prompt("Ingresa tu correo electrónico para el pedido:");
  if (!email) return alert("Correo requerido para continuar.");

  const carrito = Carrito.obtener();
  if (!carrito.length) return alert("Tu carrito está vacío.");

  const items = carrito.map(p => ({ product_id: parseInt(p.id), qty: p.cantidad }));

  try {
    const res = await fetch(`${API_URL}/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, items })
    });
    if (!res.ok) throw new Error(`Error HTTP ${res.status}`);
    const data = await res.json();
    alert(`✅ Pedido creado correctamente (ID: ${data.id})`);
    Carrito.vaciar();
    renderCarrito();
  } catch (err) {
    console.error("❌ Error al crear pedido:", err);
    alert("❌ Error al procesar el pedido");
  }
}

function start() {
  try { renderCatalog(); } catch {}
  try { setupSearch(); } catch {}
  try { renderCarrito(); } catch {}
}

if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', start); }
else { start(); }
