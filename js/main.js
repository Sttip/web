// js/main.js

console.log('[main.js] Cargado ✅');

// ---------- Utils ----------
const STORAGE_KEY = 'carrito_v1';
const CLP = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 });

const Carrito = {
  obtener() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
    catch { return []; }
  },
  guardar(items) { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); },
  agregar({ id, nombre, precio, cantidad = 1 }) {
    const items = this.obtener();
    const i = items.findIndex(p => p.id === id);
    if (i >= 0) items[i].cantidad += cantidad;
    else items.push({ id, nombre, precio, cantidad });
    this.guardar(items);
    return items;
  },
  eliminar(id) {
    const items = this.obtener().filter(p => p.id !== id);
    this.guardar(items);
    return items;
  },
  actualizarCantidad(id, cantidad) {
    const c = Math.max(1, parseInt(cantidad, 10) || 1);
    const items = this.obtener().map(p => p.id === id ? { ...p, cantidad: c } : p);
    this.guardar(items);
    return items;
  },
  vaciar() { this.guardar([]); },
  total() { return this.obtener().reduce((acc, p) => acc + p.precio * p.cantidad, 0); }
};

// ---------- Add to cart (setup directo y delegación) ----------
function wireButtons() {
  const botones = document.querySelectorAll('.add-to-cart[data-id]');
  if (!botones.length) {
    console.warn('[main.js] No se encontraron botones .add-to-cart con data-id en el DOM inicial.');
    return;
  }
  botones.forEach(btn => btn.addEventListener('click', onAddToCartClick));
  console.log(`[main.js] Listeners añadidos a ${botones.length} botón(es).`);
}

function onAddToCartClick(ev) {
  const btn = ev.currentTarget || ev.target.closest('.add-to-cart');
  if (!btn) return;

  const { id, name, price } = btn.dataset;
  if (!id || !name || !price) {
    console.error('[main.js] Botón sin data-id/name/price:', btn);
    alert('Este producto no tiene datos completos.');
    return;
  }

  const precio = parseInt(price, 10);
  if (Number.isNaN(precio)) {
    console.error('[main.js] data-price inválido:', price);
    alert('Precio inválido.');
    return;
  }

  Carrito.agregar({ id, nombre: name, precio, cantidad: 1 });
  alert(`¡${name} agregado al carrito!`);
  renderCarrito(); // por si estamos en carrito.html
}

// Delegación (por si los botones se agregan dinámicamente)
document.addEventListener('click', (e) => {
  const btn = e.target.closest('.add-to-cart');
  if (!btn) return;
  // si no tenía el listener directo (por cualquier motivo), manejamos aquí
  if (!btn.dataset.id) {
    console.error('[main.js] .add-to-cart sin data-id:', btn);
    return;
  }
  // Evita doble manejo si ya vino del listener directo
  if (!e.__handled_add_to_cart__) {
    e.__handled_add_to_cart__ = true;
    onAddToCartClick(e);
  }
});

// ---------- Carrito UI ----------
function renderCarrito() {
  const cont = document.getElementById('carrito-lista');
  if (!cont) return;

  const items = Carrito.obtener();
  cont.innerHTML = '';

  if (!items.length) {
    cont.innerHTML = `<p>No tienes productos agregados aún.</p>`;
    return;
  }

  const list = document.createElement('div');
  list.className = 'cart-list';

  items.forEach(p => {
    const row = document.createElement('div');
    row.className = 'cart-item';
    row.innerHTML = `
      <div class="cart-item__main">
        <div class="cart-item__name">${p.nombre}</div>
        <div class="cart-item__price">${CLP.format(p.precio)}</div>
      </div>
      <div class="cart-item__actions">
        <label>Cant.
          <input type="number" min="1" value="${p.cantidad}" class="cart-qty" data-id="${p.id}">
        </label>
        <div class="cart-item__subtotal">${CLP.format(p.precio * p.cantidad)}</div>
        <button class="cart-remove" data-id="${p.id}">Eliminar</button>
      </div>
    `;
    list.appendChild(row);
  });

  cont.appendChild(list);

  const footer = document.createElement('div');
  footer.className = 'cart-footer';
  footer.innerHTML = `
    <div class="cart-total"><strong>Total:</strong> <span id="cart-total-number">${CLP.format(Carrito.total())}</span></div>
    <div class="cart-actions">
      <button id="cart-clear">Vaciar carrito</button>
      <button id="cart-checkout">Ir a pagar</button>
    </div>
  `;
  cont.appendChild(footer);

  // Eventos del carrito
  cont.querySelectorAll('.cart-qty').forEach(input => {
    input.addEventListener('change', () => {
      Carrito.actualizarCantidad(input.dataset.id, input.value);
      renderCarrito();
    });
  });
  cont.querySelectorAll('.cart-remove').forEach(btn => {
    btn.addEventListener('click', () => {
      Carrito.eliminar(btn.dataset.id);
      renderCarrito();
    });
  });
  cont.querySelector('#cart-clear')?.addEventListener('click', () => {
    if (confirm('¿Vaciar el carrito?')) {
      Carrito.vaciar();
      renderCarrito();
    }
  });
  cont.querySelector('#cart-checkout')?.addEventListener('click', async () => {
    // Aquí conectas a tu backend más adelante:
    // await fetch('https://tu-api/checkout', {...});
    alert('Checkout simulado. Aquí conectaremos con tu backend.');
  });
}

// ---------- Arranque robusto ----------
function start() {
  try { wireButtons(); } catch (e) { console.error(e); }
  try { renderCarrito(); } catch (e) { console.error(e); }
}

// DOM listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', start);
} else {
  start();
}

