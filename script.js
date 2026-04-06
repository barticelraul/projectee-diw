// ── PRODUCTOS ──────────────────────────────────────────────
const productos = [
    {
        id: 1, nombre: 'Kebab Mixto', precio: 6.50, categoria: 'kebab',
        imgs: [
            'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?auto=format&fit=crop&w=600&q=80',
            'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=600&q=80',
            'https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?auto=format&fit=crop&w=600&q=80'
        ]
    },
    {
        id: 2, nombre: 'Pizza Margarita', precio: 8.90, categoria: 'pizza',
        imgs: [
            'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80',
            'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=600&q=80',
            'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=600&q=80'
        ]
    },
    {
        id: 3, nombre: 'Taco Francés XL', precio: 9.50, categoria: 'tacos',
        imgs: [
            'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=600&q=80',
            'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80',
            'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80'
        ]
    },
    {
        id: 4, nombre: 'Taco Mexicano', precio: 3.50, categoria: 'tacos',
        imgs: [
            'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80',
            'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=600&q=80',
            'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?auto=format&fit=crop&w=600&q=80'
        ]
    }
];

// Estado de cada carrusel: { productoId: índiceActual }
const carouselState = {};

// ── CARRITO ─────────────────────────────────────────────────
let carrito = [];

// ── CARRUSEL ────────────────────────────────────────────────

/**
 * Avanza o retrocede el carrusel de un producto.
 * @param {number} id       - id del producto
 * @param {number} dir      - +1 (siguiente) o -1 (anterior)
 */
function slideCarousel(id, dir) {
    const producto = productos.find(p => p.id === id);
    const total    = producto.imgs.length;

    // Inicializar si no existe
    if (carouselState[id] === undefined) carouselState[id] = 0;

    carouselState[id] = (carouselState[id] + dir + total) % total;

    _renderCarousel(id);
}

/**
 * Salta directamente a un slide concreto (puntos indicadores).
 */
function goToSlide(id, index) {
    carouselState[id] = index;
    _renderCarousel(id);
}

/**
 * Actualiza la imagen visible y los dots del carrusel.
 */
function _renderCarousel(id) {
    const current = carouselState[id];
    const producto = productos.find(p => p.id === id);

    // Actualizar imagen con fade
    const img = document.querySelector(`.carousel[data-id="${id}"] .carousel-img`);
    if (img) {
        img.classList.remove('fade-in');
        void img.offsetWidth; // reflow para reiniciar animación
        img.src = producto.imgs[current];
        img.classList.add('fade-in');
    }

    // Actualizar dots
    document.querySelectorAll(`.carousel[data-id="${id}"] .dot`).forEach((dot, i) => {
        dot.classList.toggle('active', i === current);
    });
}

// ── MENÚ ────────────────────────────────────────────────────

function displayMenu(items) {
    document.getElementById('menu-container').innerHTML = items.map(item => {
        // Inicializar estado del carrusel
        if (carouselState[item.id] === undefined) carouselState[item.id] = 0;

        const dotsHTML = item.imgs.map((_, i) => `
            <span class="dot ${i === 0 ? 'active' : ''}" onclick="goToSlide(${item.id}, ${i})"></span>
        `).join('');

        return `
        <div class="menu-item">
            <div class="carousel" data-id="${item.id}">
                <button class="carousel-btn prev" onclick="slideCarousel(${item.id}, -1)">
                    <i class="fas fa-chevron-left"></i>
                </button>
                <img class="carousel-img fade-in" src="${item.imgs[0]}" alt="${item.nombre}">
                <button class="carousel-btn next" onclick="slideCarousel(${item.id}, 1)">
                    <i class="fas fa-chevron-right"></i>
                </button>
                <div class="carousel-dots">${dotsHTML}</div>
            </div>
            <h3>${item.nombre}</h3>
            <p>${item.precio.toFixed(2)}€</p>
            <button onclick="addToCart(${item.id})" class="btn-primary" style="padding:8px 20px;font-size:0.8rem;">
                Añadir
            </button>
        </div>`;
    }).join('');
}

function filterMenu(cat) {
    const filtered = cat === 'todos' ? productos : productos.filter(p => p.categoria === cat);
    displayMenu(filtered);
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle(
            'active',
            btn.innerText.toLowerCase() === cat || (cat === 'todos' && btn.innerText === 'Todos')
        );
    });
}

// ── CARRITO: AÑADIR ─────────────────────────────────────────
function addToCart(id) {
    carrito.push(productos.find(p => p.id === id));
    updateCartUI();
    document.getElementById('cart-modal').style.display = 'block';
}

// ── CARRITO: ELIMINAR ────────────────────────────────────────
function removeFromCart(index) {
    carrito.splice(index, 1);
    updateCartUI();
}

// ── CARRITO: ACTUALIZAR UI ───────────────────────────────────
function updateCartUI() {
    document.getElementById('cart-count').innerText = carrito.length;

    const itemsContainer = document.getElementById('cart-items');

    if (carrito.length === 0) {
        itemsContainer.innerHTML = '<p class="cart-empty-msg"><i class="fas fa-shopping-basket"></i> Tu carrito está vacío</p>';
    } else {
        itemsContainer.innerHTML = carrito.map((item, index) => `
            <div class="cart-item-row">
                <span class="item-name">${item.nombre}</span>
                <span class="item-price">${item.precio.toFixed(2)}€</span>
                <button class="btn-remove" onclick="removeFromCart(${index})" title="Eliminar">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>
        `).join('');
    }

    document.getElementById('total-price').innerText =
        carrito.reduce((sum, item) => sum + item.precio, 0).toFixed(2);
}

// ── CARRITO: ABRIR/CERRAR ────────────────────────────────────
function toggleCart() {
    const modal = document.getElementById('cart-modal');
    modal.style.display = modal.style.display === 'block' ? 'none' : 'block';
}

// ── CHECKOUT ─────────────────────────────────────────────────
function checkout() {
    if (!carrito.length) return alert('El carrito está vacío');
    alert('¡Pedido realizado con éxito!');
    carrito = [];
    updateCartUI();
    toggleCart();
}

// ── INIT ─────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    displayMenu(productos);

    document.getElementById('contact-form').addEventListener('submit', e => {
        e.preventDefault();
        alert('¡Gracias por tu mensaje!');
        e.target.reset();
    });
});