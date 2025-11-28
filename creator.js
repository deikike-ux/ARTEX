// Lógica específica del creador de camisetas ARTEX
document.addEventListener("DOMContentLoaded", () => {
  const canvas      = document.getElementById("creator-canvas");
  const mockup      = document.getElementById("creator-mockup");
  const tint        = document.getElementById("creator-tint");
  const design      = document.getElementById("creator-design");

  const uploadInput = document.getElementById("creator-upload");
  const colorInput  = document.getElementById("creator-color");
  const scaleInput  = document.getElementById("creator-scale");
  const rotateInput = document.getElementById("creator-rotate");
  const rotateLabel = document.getElementById("creator-rotate-label");

  const sideToggle  = document.getElementById("creator-side-toggle");
  const centerBtn   = document.getElementById("creator-center");
  const clearBtn    = document.getElementById("creator-clear");

  const typeSelect  = document.getElementById("creator-type");
  const sizeSelect  = document.getElementById("creator-size");
  const addCartBtn  = document.getElementById("creator-add-cart");

  // Si no existe el creador en la página, salir
  if (!canvas || !mockup || !tint || !design) {
    return;
  }

  /* -----------------------------
     ESTADO DEL DISEÑO
  ----------------------------- */
  let isFront   = true;
  let posX      = 0;
  let posY      = 0;
  let scale     = 1;
  let angle     = 0;
  let dragging  = false;
  let dragStartX = 0;
  let dragStartY = 0;
  let startPosX  = 0;
  let startPosY  = 0;

  function updateTransform() {
    design.style.transform =
      `translate(-50%, -50%) translate(${posX}px, ${posY}px) rotate(${angle}deg) scale(${scale})`;
  }

  function centerDesign() {
    posX = 0;
    posY = 0;
    updateTransform();
  }

  /* -----------------------------
     MÁSCARA PARA EL TINTE
  ----------------------------- */
  function updateTintMask() {
    if (!tint || !mockup) return;

    const src = mockup.getAttribute("src");
    if (!src) return;

    tint.style.webkitMaskImage = `url(${src})`;
    tint.style.maskImage       = `url(${src})`;
    tint.style.webkitMaskSize  = "contain";
    tint.style.maskSize        = "contain";
    tint.style.webkitMaskRepeat = "no-repeat";
    tint.style.maskRepeat       = "no-repeat";
    tint.style.webkitMaskPosition = "center";
    tint.style.maskPosition       = "center";
  }

  updateTintMask();

  // Color inicial
  if (colorInput) {
    tint.style.backgroundColor = colorInput.value;
  }

  /* -----------------------------
     SUBIR IMAGEN
  ----------------------------- */
  if (uploadInput) {
    uploadInput.addEventListener("change", (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = () => {
        design.src = reader.result;
        design.style.display = "block";

        // Reiniciar estado
        posX = 0;
        posY = 0;
        scale = parseFloat(scaleInput?.value || "1");
        angle = parseInt(rotateInput?.value || "0", 10);

        design.style.top  = "50%";
        design.style.left = "50%";
        updateTransform();
      };
      reader.readAsDataURL(file);

      uploadInput.value = "";
    });
  }

  /* -----------------------------
     COLOR CAMISETA
  ----------------------------- */
  if (colorInput) {
    colorInput.addEventListener("input", () => {
      tint.style.backgroundColor = colorInput.value;
    });
  }

  /* -----------------------------
     TAMAÑO
  ----------------------------- */
  if (scaleInput) {
    scale = parseFloat(scaleInput.value || "1");
    scaleInput.addEventListener("input", () => {
      scale = parseFloat(scaleInput.value || "1");
      updateTransform();
    });
  }

  /* -----------------------------
     ROTACIÓN
  ----------------------------- */
  if (rotateInput) {
    angle = parseInt(rotateInput.value || "0", 10);
    if (rotateLabel) rotateLabel.textContent = angle + "°";

    rotateInput.addEventListener("input", () => {
      angle = parseInt(rotateInput.value || "0", 10);
      if (rotateLabel) rotateLabel.textContent = angle + "°";
      updateTransform();
    });
  }

  /* -----------------------------
     FRENTE / ESPALDA
  ----------------------------- */
  if (sideToggle) {
    sideToggle.addEventListener("click", () => {
      isFront = !isFront;

      const frontSrc = mockup.dataset.front;
      const backSrc  = mockup.dataset.back;

      mockup.src = isFront ? frontSrc : backSrc;
      sideToggle.textContent = isFront ? "Ver espalda" : "Ver frente";

     // Esperar a que la imagen cargue antes de aplicar la máscara
setTimeout(() => {
  updateTintMask();
}, 50);

    });
  }

  /* -----------------------------
     DRAG DEL DISEÑO
  ----------------------------- */
  if (design) {
    design.style.cursor = "grab";

    design.addEventListener("mousedown", (e) => {
      if (!design.src) return;
      dragging = true;
      design.style.cursor = "grabbing";
      dragStartX = e.clientX;
      dragStartY = e.clientY;
      startPosX  = posX;
      startPosY  = posY;
    });

    document.addEventListener("mousemove", (e) => {
      if (!dragging) return;
      const dx = e.clientX - dragStartX;
      const dy = e.clientY - dragStartY;
      posX = startPosX + dx;
      posY = startPosY + dy;
      updateTransform();
    });

    document.addEventListener("mouseup", () => {
      if (dragging) {
        dragging = false;
        design.style.cursor = "grab";
      }
    });
  }
/* -----------------------------
   DRAG DEL DISEÑO (TOUCH)
----------------------------- */
if (design) {
  design.addEventListener("touchstart", (e) => {
    if (!design.src) return;
    dragging = true;

    const touch = e.touches[0];
    dragStartX = touch.clientX;
    dragStartY = touch.clientY;
    startPosX  = posX;
    startPosY  = posY;
  });

  document.addEventListener("touchmove", (e) => {
    if (!dragging) return;

    const touch = e.touches[0];
    const dx = touch.clientX - dragStartX;
    const dy = touch.clientY - dragStartY;

    posX = startPosX + dx;
    posY = startPosY + dy;

    updateTransform();
  });

  document.addEventListener("touchend", () => {
    dragging = false;
  });
}

  /* -----------------------------
     BOTONES: CENTRAR / QUITAR
  ----------------------------- */
  if (centerBtn) {
    centerBtn.addEventListener("click", () => {
      if (!design.src) {
        alert("Primero sube un diseño.");
        return;
      }
      centerDesign();
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      design.src = "";
      design.style.display = "none";
    });
  }

  /* -----------------------------
     TALLAS POR TIPO
  ----------------------------- */
  const SIZE_MAP = {
    normal:  ["S", "M", "L", "XL", "XXL"],
    oversize:["S", "M", "L", "XL", "XXL"]
  };

  function refreshSizes() {
    if (!typeSelect || !sizeSelect) return;

    const type = typeSelect.value || "normal";
    const sizes = SIZE_MAP[type] || [];

    sizeSelect.innerHTML = '<option value="" disabled selected>Selecciona talla</option>';

    sizes.forEach((t) => {
      const opt = document.createElement("option");
      opt.value = t;
      opt.textContent = t;
      sizeSelect.appendChild(opt);
    });
  }

  if (typeSelect && sizeSelect) {
    refreshSizes();
    typeSelect.addEventListener("change", refreshSizes);
  }
if (addCartBtn) {
  addCartBtn.addEventListener("click", () => {
    const type = typeSelect ? typeSelect.value : "";
    const size = sizeSelect ? sizeSelect.value : "";

    if (!type) {
      alert("Por favor selecciona el tipo de camiseta (Normal u Oversize).");
      return;
    }

    if (!size) {
      alert("Por favor selecciona una talla para la camiseta.");
      return;
    }

    const hasDesign = !!(design && design.src && design.style.display !== "none");

    const name = hasDesign
      ? "Camiseta personalizada ARTEX"
      : "Camiseta básica ARTEX";

    const price = 60000;

    /* ================================
       GENERAR CAPTURA DEL DISEÑO
    ================================= */
    const frame = document.querySelector(".creator-canvas, .shirt-frame");
    let designPreview = "";

    if (frame) {
      try {
        html2canvas(frame).then(canvas => {
          designPreview = canvas.toDataURL("image/png");

          // Añadir al carrito incluyendo la imagen del diseño
          window.addToCart(name, price, type, size, designPreview);
          alert("Tu diseño se añadió al carrito 💜");
        });
            } catch (err) {
        console.error("Error generando imagen:", err);
        window.addToCart(name, price, type, size);
        alert("Tu camiseta se añadió al carrito 💜");
      }

       } else {
      window.addToCart(name, price, type, size);
      alert("Tu camiseta se añadió al carrito 💜");
    }

  });
}

});
