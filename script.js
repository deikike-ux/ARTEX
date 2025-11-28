document.addEventListener("DOMContentLoaded", () => {

  /* =======================================
     DETECTOR DE MÓVIL
  ======================================= */
  function isMobile() {
    return window.innerWidth <= 768;
  }

  /* =======================================
     NAV MÓVIL
  ======================================= */
  const navToggle = document.getElementById("nav-toggle");
  const navMenu = document.getElementById("nav-menu");

  if (navToggle && navMenu) {
    navToggle.addEventListener("click", () => {
      navMenu.classList.toggle("is-open");
      navToggle.classList.toggle("is-open");
    });
  }
/* =======================================
   CERRAR MENÚ AL HACER CLIC EN UN ENLACE
======================================= */
const navLinks = document.querySelectorAll(".nav-menu a");

navLinks.forEach(link => {
  link.addEventListener("click", () => {
    if (navMenu.classList.contains("is-open")) {
      navMenu.classList.remove("is-open");
      navToggle.classList.remove("is-open");
    }
  });
});

  /* =======================================
     FILTRO DE CATEGORÍAS
  ======================================= */
  const filterButtons = document.querySelectorAll(".cat-btn");
  const productCards = document.querySelectorAll(".product-card");

  if (filterButtons.length && productCards.length) {
    filterButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        const category = btn.dataset.filter;

        filterButtons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        productCards.forEach(card => {
          const cardCat = card.dataset.category;
          card.style.display =
            category === "todos" || cardCat === category ? "flex" : "none";
        });
      });
    });
  }

  /* =======================================
     CARRITO
  ======================================= */
  const cartToggleBtn   = document.getElementById("cart-toggle");
  const cartPanel       = document.getElementById("cart-panel");
  const cartItemsList   = document.getElementById("cart-items");
  const cartTotalSpan   = document.getElementById("cart-total");
  const cartCountSpan   = document.getElementById("cart-count");
  const cartClearBtn    = document.getElementById("cart-clear");
  const cartCheckoutBtn = document.getElementById("cart-checkout");
  // Botón flotante y contador flotante (para móvil)
  const cartToggleFloating = document.getElementById("cart-toggle-floating");
  const cartCountFloating  = document.getElementById("cart-count-floating");

  let cart = [];

  function loadCart() {
    try {
      const saved = localStorage.getItem("artex_cart");
      if (saved) cart = JSON.parse(saved) || [];
    } catch {
      cart = [];
    }
  }

  function saveCart() {
    try {
      localStorage.setItem("artex_cart", JSON.stringify(cart));
    } catch {}
  }

  function renderCart() {
    if (!cartItemsList || !cartTotalSpan || !cartCountSpan) return;

    cartItemsList.innerHTML = "";
    let total = 0;
    let count = 0;

    cart.forEach(item => {
      total += item.price * item.qty;
      count += item.qty;

      const li = document.createElement("li");
      li.className = "cart-item";

      // Miniatura del diseño si existe
      if (item.designPreview) {
        const img = document.createElement("img");
        img.src = item.designPreview;
        img.style.width = "80px";
        img.style.borderRadius = "6px";
        img.style.marginBottom = "6px";
        li.appendChild(img);
      }

      const label = document.createElement("span");
      label.textContent = `${item.displayName} x${item.qty}`;

      const priceSpan = document.createElement("span");
      priceSpan.textContent = `$${(item.price * item.qty).toLocaleString("es-CO")}`;

      li.appendChild(label);
      li.appendChild(priceSpan);
      cartItemsList.appendChild(li);
    });
    cartTotalSpan.textContent = `$${total.toLocaleString("es-CO")}`;
    cartCountSpan.textContent = count;

    // Actualizar contador del botón flotante (si existe)
    if (cartCountFloating) {
      cartCountFloating.textContent = count;
    }

    // Mostrar/ocultar botón carrito del menú
    if (cartToggleBtn) {
      cartToggleBtn.style.display = count === 0 ? "none" : "inline-flex";
    }

    // Mostrar/ocultar botón flotante
    if (cartToggleFloating) {
      cartToggleFloating.style.display = count === 0 ? "none" : "flex";
    }

    saveCart();

    saveCart();
  }

  function addToCart(name, price, type, size, designPreview = null) {
    const labelParts = [];
    if (type) labelParts.push(type === "normal" ? "Normal" : type);
    if (size) labelParts.push(`Talla ${size}`);

    const displayName =
      labelParts.length ? `${name} (${labelParts.join(", ")})` : name;

    // Diferenciar también por diseño para que dos diseños distintos no se mezclen
    const existing = cart.find(item =>
      item.displayName === displayName &&
      item.designPreview === designPreview
    );

    if (existing) {
      existing.qty++;
    } else {
      cart.push({
        name,
        displayName,
        price: Number(price),
        type,
        size,
        qty: 1,
        designPreview: designPreview || null
      });
    }

    renderCart();

       renderCart();

    // 👉 En MÓVIL: animar el botón flotante (no abrir el panel)
    if (isMobile()) {
      if (cartToggleFloating) {
        cartToggleFloating.classList.add("cart-bump");
        setTimeout(() => cartToggleFloating.classList.remove("cart-bump"), 400);
      }
    } else {
      // 👉 En PC: abrir el carrito normalmente
      if (cartPanel) cartPanel.style.display = "block";
    }

  }

  window.addToCart = addToCart;

  loadCart();
  renderCart();

  if (cartToggleBtn && cartPanel) {
    cartToggleBtn.addEventListener("click", () => {
      cartPanel.style.display =
        cartPanel.style.display === "block" ? "none" : "block";
    });
  }
  // NUEVO: botón flotante abre/cierra el panel del carrito
  if (cartToggleFloating && cartPanel) {
    cartToggleFloating.addEventListener("click", () => {
      cartPanel.style.display =
        cartPanel.style.display === "block" ? "none" : "block";
    });
  }

  if (cartClearBtn) {
    cartClearBtn.addEventListener("click", () => {
      if (!confirm("¿Vaciar el carrito?")) return;
      cart = [];
      localStorage.removeItem("artex_cart");
      renderCart();
      if (cartPanel) cartPanel.style.display = "none";
    });
  }

  if (cartCheckoutBtn) {
    cartCheckoutBtn.addEventListener("click", () => {
      if (!cart.length) {
        alert("Tu carrito está vacío.");
        return;
      }

      // Construir mensaje automático para WhatsApp
      let message = "🛒 *Pedido ARTEX*%0A%0A";

      cart.forEach(item => {
        message += `• ${item.displayName} x${item.qty} - $${(item.price * item.qty).toLocaleString("es-CO")}%0A`;
      });

      const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

      message += `%0A💵 *Total:* $${total.toLocaleString("es-CO")}%0A%0A`;
      message += `🎨 Si diseñaste una camiseta personalizada, por favor envíanos también una captura donde se vea tu diseño.%0A%0A`;
      message += "Gracias por tu compra 💜";

      const phone = "573128945622";
      const whatsappURL = `https://wa.me/${phone}?text=${message}`;

      // Abrir WhatsApp
      window.open(whatsappURL, "_blank");

      // Animación "pedido enviado" si existe
      const anim = document.getElementById("order-sent");
      if (anim) {
        anim.classList.add("active");
        setTimeout(() => {
          anim.classList.remove("active");
        }, 2500);
      }

      // Vaciar carrito después de enviar
      cart = [];
      localStorage.removeItem("artex_cart");
      renderCart();
      if (cartPanel) cartPanel.style.display = "none";
    });
  }

  /* =======================================
     MODAL DE PRODUCTO
  ======================================= */
  const productModal         = document.getElementById("product-modal");
  const productModalClose    = document.getElementById("product-modal-close");
  const productModalBackdrop = document.getElementById("product-modal-backdrop");

  const modalImg   = document.getElementById("modal-product-img");
  const modalName  = document.getElementById("modal-product-name");
  const modalPrice = document.getElementById("modal-product-price");
  const modalDesc  = document.getElementById("modal-product-desc");

  const modalAddBtn        = document.getElementById("modal-add-to-cart");
  const modalTypeButtons   = document.querySelectorAll(".modal-type-btn");
  const modalSizeContainer = document.getElementById("modal-size-options");

  const SIZE_LIST = ["S", "M", "L", "XL", "XXL"];

  function initModalSizes() {
    if (!modalSizeContainer) return;
    modalSizeContainer.innerHTML = "";

    SIZE_LIST.forEach(size => {
      const b = document.createElement("button");
      b.classList.add("size-btn");
      b.dataset.size = size;
      b.textContent = size;

      b.addEventListener("click", () => {
        modalSizeContainer.querySelectorAll(".size-btn")
          .forEach(x => x.classList.remove("active"));
        b.classList.add("active");
      });

      modalSizeContainer.appendChild(b);
    });
  }
  initModalSizes();

  modalTypeButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      modalTypeButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
    });
  });

  function getActiveType() {
    const active = document.querySelector(".modal-type-btn.active");
    return active ? active.dataset.type : null;
  }

  function getActiveSize() {
    const active = document.querySelector(".size-btn.active");
    return active ? active.dataset.size : null;
  }

  document.querySelectorAll(".product-card .add-to-cart").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();

      const card = btn.closest(".product-card");
      if (!card) return;

      const name =
        btn.dataset.name ||
        card.querySelector("h3")?.textContent.trim() ||
        "Producto ARTEX";

      const priceAttr =
        btn.dataset.price ||
        card.querySelector(".product-price")?.dataset.price ||
        "0";

      const price = parseInt(priceAttr, 10) || 0;
      const imgFront = card.querySelector(".product-img");
      const descEl   = card.querySelector(".product-desc");

      if (imgFront && modalImg) modalImg.src = imgFront.src;
      if (modalName) modalName.textContent = name;
      if (modalPrice) modalPrice.textContent = "$" + price.toLocaleString("es-CO");
      if (modalDesc && descEl) modalDesc.textContent = descEl.textContent;

      if (productModal) {
        productModal.dataset.name = name;
        productModal.dataset.price = String(price);
        productModal.classList.add("open");
      }

      if (modalSizeContainer) {
        modalSizeContainer.querySelectorAll(".size-btn")
          .forEach(b => b.classList.remove("active"));
      }
    });
  });

  if (modalAddBtn) {
    modalAddBtn.addEventListener("click", () => {
      if (!productModal) return;

      const name  = productModal.dataset.name || "Producto ARTEX";
      const price = parseInt(productModal.dataset.price || "0", 10) || 0;

      const type = getActiveType();
      const size = getActiveSize();

      if (!size) return alert("Por favor selecciona una talla.");

      addToCart(name, price, type, size);
      productModal.classList.remove("open");
      alert("Producto añadido al carrito ✔");
    });
  }

  function closeProductModal() {
    if (productModal) productModal.classList.remove("open");
  }

  if (productModalClose) {
    productModalClose.addEventListener("click", closeProductModal);
  }
  if (productModalBackdrop) {
    productModalBackdrop.addEventListener("click", closeProductModal);
  }

  /* ================================
     MODAL DE ZOOM
  ================================ */
  const zoomModal = document.getElementById("zoom-modal");
  const zoomImg   = document.getElementById("zoom-img");
  const zoomClose = document.getElementById("zoom-close");
  const zoomBackdrop = zoomModal?.querySelector(".zoom-backdrop");

  if (zoomModal && zoomImg) {
    document.querySelectorAll(".product-img").forEach(img => {
      img.addEventListener("click", () => {
        zoomImg.src = img.src;
        zoomModal.classList.add("open");
      });
    });

    const closeZoom = () => zoomModal.classList.remove("open");

    if (zoomClose)   zoomClose.addEventListener("click", closeZoom);
    if (zoomBackdrop) zoomBackdrop.addEventListener("click", closeZoom);
  }
/* ================================
   HEADER INTELIGENTE (sube/baja)
================================ */
let lastScrollY = window.scrollY;
const header = document.getElementById("main-navbar");


function handleHeaderScroll() {
  const currentScroll = window.scrollY;

  if (currentScroll > lastScrollY && currentScroll > 80) {
    // Bajando → ocultar header
    header.classList.add("hide-header");
  } else {
    // Subiendo → mostrar header
    header.classList.remove("hide-header");
  }

  lastScrollY = currentScroll;
}

window.addEventListener("scroll", handleHeaderScroll);

});
