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

// ---------- Catálogo enriquecido ----------
const PRODUCTS = {
  "berry-blast": {
    id: "berry-blast",
    nombre: "Berry Blast",
    descripcion: "Deliciosa mezcla de fresas, arándanos y frambuesas con yogurt natural",
    precio: 4990,
    color: "#ff6b6b",
    stock: 12,
    ingredientes: ["Fresas frescas","Arándanos","Frambuesas","Yogurt natural"],
    beneficios: ["Antioxidantes naturales","Vitamina C para el sistema inmune"],
    nutricion: { "Porción":"350 ml","Calorías":"210 kcal","Proteínas":"6 g","Carbohidratos":"36 g","Azúcares":"28 g","Grasas":"3 g","Fibra":"4 g" }
  },
  "tropical-paradise": {
    id: "tropical-paradise",
    nombre: "Tropical Paradise",
    descripcion: "Mango, piña y maracuyá con un toque de coco para transportarte al trópico",
    precio: 5490,
    color: "#ffd166",
    stock: 8,
    ingredientes: ["Mango","Piña","Maracuyá","Coco"],
    beneficios: ["Hidratación natural","Energía rápida antes del ejercicio"],
    nutricion: { "Porción":"350 ml","Calorías":"240 kcal","Proteínas":"4 g","Carbohidratos":"42 g","Azúcares":"31 g","Grasas":"5 g","Fibra":"3 g" }
  },
  "green-energy": {
    id: "green-energy",
    nombre: "Green Energy",
    descripcion: "Espinaca, plátano, kiwi y manzana verde para un boost de energía natural",
    precio: 5990,
    color: "#06d6a0",
    stock: 5,
    ingredientes: ["Espinaca","Plátano","Kiwi","Manzana verde"],
    beneficios: ["Rico en hierro y vitamina K","Energía sostenida"],
    nutricion: { "Porción":"350 ml","Calorías":"200 kcal","Proteínas":"5 g","Carbohidratos":"34 g","Azúcares":"22 g","Grasas":"2 g","Fibra":"5 g" }
  },
  "choco-protein": {
    id: "choco-protein",
    nombre: "Choco Protein",
    descripcion: "Cacao puro con proteína whey y leche de almendras",
    precio: 6290,
    color: "#8b5cf6",
    stock: 10,
    ingredientes: ["Cacao 70%","Proteína whey","Leche de almendras","Dátiles"],
    beneficios: ["Recuperación muscular","Antioxidantes del cacao"],
    nutricion: { "Porción":"350 ml","Calorías":"260 kcal","Proteínas":"22 g","Carbohidratos":"24 g","Azúcares":"15 g","Grasas":"7 g","Fibra":"5 g" }
  },
  "matcha-boost": {
    id: "matcha-boost",
    nombre: "Matcha Boost",
    descripcion: "Té matcha con plátano y leche de coco",
    precio: 5790,
    color: "#22c55e",
    stock: 7,
    ingredientes: ["Matcha","Plátano","Leche de coco","Miel"],
    beneficios: ["Energía sostenida","Mejora la concentración"],
    nutricion: { "Porción":"350 ml","Calorías":"230 kcal","Proteínas":"4 g","Carbohidratos":"35 g","Azúcares":"24 g","Grasas":"6 g","Fibra":"3 g" }
  },
  "piña-colada-fit": {
    id: "piña-colada-fit",
    nombre: "Piña Colada Fit",
    descripcion: "Piña y coco sin azúcar añadida",
    precio: 5290,
    color: "#facc15",
    stock: 0,
    ingredientes: ["Piña","Agua de coco","Yogurt griego","Hielo"],
    beneficios: ["Hidratación natural","Refrescante y ligera"],
    nutricion: { "Porción":"350 ml","Calorías":"190 kcal","Proteínas":"8 g","Carbohidratos":"28 g","Azúcares":"21 g","Grasas":"3 g","Fibra":"2 g" }
  }
};

// ---------- Render dinámico del catálogo ----------
function cardHTML(p) {
  const agotado = (p.stock ?? 999) <= 0;
  return `
    <div class="smoothie-card">
      <div class="smoothie-img" style="background-color: ${p.color};"></div>
      <div class="smoothie-info">
        <h3 class="smoothie-name">${p.nombre}</h3>
        <p class="smoothie-desc">${p.descripcion}</p>
        <p class="smoothie-price">${CLP.format(p.precio)}</p>
        <button
          class="add-to-cart"
          data-id="${p.id}"
          data-name="${p.nombre}"
          data-price="${p.precio}"
          ${agotado ? 'disabled' : ''}
        >
          ${agotado ? 'No Disponible' : 'Agregar al Carrito'}
        </button>
      </div>
    </div>
  `;
}

function renderCatalog(filtro = '') {
  const grid = document.getElementById('smoothies-grid');
  if (!grid) return;

  const base = Object.values(PRODUCTS);
  const items = filtro
    ? base.filter(p => (p.nombre + ' ' + p.descripcion).toLowerCase().includes(filtro.toLowerCase()))
    : base;

  grid.innerHTML = items.map(cardHTML).join('');
}

// ---------- Buscador ----------
function setupSearch() {
  const input = document.getElementById('search');
  if (!input) return;
  const doFilter = () => renderCatalog(input.value.trim());
  input.addEventListener('input', doFilter);
  doFilter(); // render inicial
}

// ---------- Add to cart (delegación + handler modal protegido) ----------
// Delegación global (funciona aunque el grid se re-renderice)
document.addEventListener('click', (e) => {
  const btn = e.target.closest('.add-to-cart');
  if (!btn) return;

  // Ignora el botón del modal; ese tiene su propio handler
  if (btn.id === 'pd-add') return;

  const { id, name, price } = btn.dataset;
  if (!id || !name || !price) return;

  const precio = parseInt(price, 10);
  Carrito.agregar({ id, nombre: name, precio, cantidad: 1 });
  alert(`¡${name} agregado al carrito!`);
  renderCarrito();
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
  cont.querySelector('#cart-checkout')?.addEventListener('click', () => {
    alert('Checkout simulado. Aquí conectaremos con tu backend.');
  });
}

// ---------- Modal (detalle de producto) ----------
let PD = {};

function wireProductDetail() {
  PD.modal = document.getElementById('product-detail');
  if (!PD.modal) { console.warn('[main.js] No hay #product-detail en este documento.'); return; }

  PD.close = document.getElementById('pd-close');
  PD.img   = document.getElementById('pd-image');
  PD.name  = document.getElementById('pd-name');
  PD.price = document.getElementById('pd-price');
  PD.desc  = document.getElementById('pd-desc');
  PD.add   = document.getElementById('pd-add');

  // Tabs
  function setActiveTab(name) {
    PD.modal.querySelectorAll('.pd-tab')
      .forEach(b => b.classList.toggle('is-active', b.dataset.tab === name));
    PD.modal.querySelectorAll('.pd-panel')
      .forEach(p => p.classList.toggle('is-hidden', p.dataset.panel !== name));
  }
  PD.modal.addEventListener('click', (e) => {
    const tab = e.target.closest('.pd-tab');
    if (!tab) return;
    setActiveTab(tab.dataset.tab);
  });

  // Abrir modal con delegación (funciona tras re-render del grid)
  document.addEventListener('click', (e) => {
    const el = e.target.closest('.smoothie-img, .smoothie-name');
    if (!el) return;

    const card = el.closest('.smoothie-card');
    if (!card) return;

    const addBtn = card.querySelector('.add-to-cart');
    const id    = addBtn?.dataset.id ||
                  card.querySelector('.smoothie-name')?.textContent?.trim().toLowerCase().replace(/\s+/g, '-');
    const name  = addBtn?.dataset.name || card.querySelector('.smoothie-name')?.textContent?.trim() || '';
    const price = parseInt(addBtn?.dataset.price ||
                  (card.querySelector('.smoothie-price')?.textContent || '').replace(/[^\d]/g, ''), 10);
    const desc  = card.querySelector('.smoothie-desc')?.textContent?.trim() || '';
    const color = card.querySelector('.smoothie-img')?.style?.backgroundColor || '#888';

    const extra = PRODUCTS[id] || {};
    const stock = typeof extra.stock === 'number' ? extra.stock : 999;

    // Rellenar modal
    PD.name.textContent  = name;
    PD.price.textContent = CLP.format(price);
    PD.desc.textContent  = desc;
    if (PD.img) PD.img.style.background = color;

    const stockEl = document.getElementById('pd-stock');
    if (stockEl) {
      stockEl.textContent = stock > 0 ? `Disponible: ${stock}` : 'Agotado temporalmente';
      stockEl.className = 'pd-stock-badge ' + (stock > 0 ? 'pd-stock--ok' : 'pd-stock--no');
    }

    PD.add.dataset.id    = id;
    PD.add.dataset.name  = name;
    PD.add.dataset.price = String(price);
    PD.add.disabled = stock <= 0;
    PD.add.textContent = stock > 0 ? 'Agregar al Carrito' : 'No Disponible';

    // Ingredientes
    const ulIng = document.getElementById('pd-ingredientes');
    if (ulIng) {
      ulIng.innerHTML = '';
      (extra.ingredientes || []).forEach(txt => {
        const li = document.createElement('li');
        li.textContent = txt;
        ulIng.appendChild(li);
      });
    }

    // Beneficios
    const ulBen = document.getElementById('pd-beneficios');
    if (ulBen) {
      ulBen.innerHTML = '';
      (extra.beneficios || []).forEach(txt => {
        const li = document.createElement('li');
        li.textContent = txt;
        ulBen.appendChild(li);
      });
    }

    // Nutrición
    const tbl = document.getElementById('pd-nutricion');
    if (tbl) {
      tbl.innerHTML = '';
      const nutri = extra.nutricion || {};
      Object.keys(nutri).forEach(k => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${k}</td><td style="text-align:right">${nutri[k]}</td>`;
        tbl.appendChild(tr);
      });
    }

    setActiveTab('ingredientes');
    PD.modal.classList.remove('pd-hidden');
  });

  // Agregar al carrito desde el modal (sin duplicar)
  PD.add?.addEventListener('click', (ev) => {
    ev.preventDefault();
    ev.stopPropagation();
    const { id, name, price } = PD.add.dataset;
    const precio = parseInt(price, 10);
    if (!id || !name || Number.isNaN(precio)) return;

    Carrito.agregar({ id, nombre: name, precio, cantidad: 1 });
    alert(`¡${name} agregado al carrito!`);
    PD.modal.classList.add('pd-hidden');
    renderCarrito();
  });

  // Cerrar modal
  function closeModal() { PD.modal.classList.add('pd-hidden'); }
  PD.close?.addEventListener('click', closeModal);
  PD.modal.addEventListener('click', (e) => { if (e.target === PD.modal) closeModal(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });
}

// ---------- Inicio ----------
function start() {
  try { renderCatalog(); } catch (e) { console.error(e); }
  try { setupSearch(); } catch (e) { console.error(e); }
  try { renderCarrito(); } catch (e) { console.error(e); }
  try { wireProductDetail(); } catch (e) { console.error(e); }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', start);
} else {
  start();
}



