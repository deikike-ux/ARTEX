// Lógica específica del creador de camisetas ARTEX
document.addEventListener("DOMContentLoaded", () => {
  const canvas      = document.getElementById("creator-canvas");
  const mockup      = document.getElementById("creator-mockup");
  const tint        = document.getElementById("creator-tint");
  const layersWrap  = document.getElementById("creator-layers"); // NUEVO contenedor de capas

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
  if (!canvas || !mockup || !tint || !layersWrap) {
    return;
  }

  /* -----------------------------
     ESTADO DEL DISEÑO (CAPAS)
  ----------------------------- */
  let isFront   = true;
  let dragging  = false;
  let dragStartX = 0;
  let dragStartY = 0;
  let activeLayer = null; // capa seleccionada actualmente

  function selectLayer(layer) {
    if (!layer) return;
    // quitar selección previa
    [...layersWrap.children].forEach(l => l.classList.remove("is-selected"));
    activeLayer = layer;
    activeLayer.classList.add("is-selected");

    // actualizar sliders con el estado de esa capa
    if (scaleInput) {
      scaleInput.value = String(activeLayer._scale || 1);
    }
    if (rotateInput) {
      rotateInput.value = String(activeLayer._angle || 0);
    }
    if (rotateLabel) {
      rotateLabel.textContent = (activeLayer._angle || 0) + "°";
    }
  }

  function applyTransform(layer) {
    if (!layer) return;
    const x = layer._posX || 0;
    const y = layer._posY || 0;
    const s = layer._scale || 1;
    const a = layer._angle || 0;

    layer.style.transform =
      `translate(-50%, -50%) translate(${x}px, ${y}px) rotate(${a}deg) scale(${s})`;
  }

  function centerActiveLayer() {
    if (!activeLayer) return;
    activeLayer._posX = 0;
    activeLayer._posY = 0;
    applyTransform(activeLayer);
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
     CREAR UNA CAPA NUEVA
  ----------------------------- */
  function createLayer(imgSrc) {
    const layer = document.createElement("div");
    layer.className = "creator-layer";

    const img = document.createElement("img");
    img.src = imgSrc;
    img.alt = "Diseño";
    layer.appendChild(img);

    // estado inicial
    layer._posX  = 0;
    layer._posY  = 0;
    layer._scale = parseFloat(scaleInput?.value || "1");
    layer._angle = parseInt(rotateInput?.value || "0", 10);

    // colocar en el centro
    applyTransform(layer);

    // eventos de selección
    layer.addEventListener("mousedown", (e) => {
      e.stopPropagation();
      selectLayer(layer);
      startDrag(e.clientX, e.clientY);
    });

    layer.addEventListener("touchstart", (e) => {
      e.stopPropagation();
      selectLayer(layer);
      const touch = e.touches[0];
      startDrag(touch.clientX, touch.clientY);
    }, { passive: true });

    layersWrap.appendChild(layer);
    selectLayer(layer);
  }

  function startDrag(clientX, clientY) {
    if (!activeLayer) return;
    dragging = true;
    dragStartX = clientX;
    dragStartY = clientY;
    activeLayer._startPosX = activeLayer._posX || 0;
    activeLayer._startPosY = activeLayer._posY || 0;
  }

  function handleDragMove(clientX, clientY) {
    if (!dragging || !activeLayer) return;
    const dx = clientX - dragStartX;
    const dy = clientY - dragStartY;
    activeLayer._posX = (activeLayer._startPosX || 0) + dx;
    activeLayer._posY = (activeLayer._startPosY || 0) + dy;
    applyTransform(activeLayer);
  }

  function endDrag() {
    dragging = false;
  }

  /* -----------------------------
     SUBIR IMAGEN(ES)
  ----------------------------- */
  if (uploadInput) {
    uploadInput.addEventListener("change", (e) => {
      const files = e.target.files;
      if (!files || !files.length) return;

      [...files].forEach((file) => {
        const reader = new FileReader();
        reader.onload = () => {
          const src = reader.result;
          createLayer(src);
        };
        reader.readAsDataURL(file);
      });

      // limpiar input para permitir volver a subir las mismas si quiere
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
     TAMAÑO (aplica a capa activa)
  ----------------------------- */
  if (scaleInput) {
    scaleInput.addEventListener("input", () => {
      if (!activeLayer) return;
      const s = parseFloat(scaleInput.value || "1");
      activeLayer._scale = s;
      applyTransform(activeLayer);
    });
  }

  /* -----------------------------
     ROTACIÓN (aplica a capa activa)
  ----------------------------- */
  if (rotateInput) {
    rotateInput.addEventListener("input", () => {
      if (!activeLayer) return;
      const a = parseInt(rotateInput.value || "0", 10);
      activeLayer._angle = a;
      if (rotateLabel) rotateLabel.textContent = a + "°";
      applyTransform(activeLayer);
    });

    // valor inicial
    if (rotateLabel) {
      const initial = parseInt(rotateInput.value || "0", 10);
      rotateLabel.textContent = initial + "°";
    }
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

      setTimeout(() => {
        updateTintMask();
      }, 50);
    });
  }

  /* -----------------------------
     DRAG GLOBAL (mouse + touch)
  ----------------------------- */
  document.addEventListener("mousemove", (e) => {
    if (!dragging) return;
    handleDragMove(e.clientX, e.clientY);
  });

  document.addEventListener("mouseup", () => {
    endDrag();
  });

  document.addEventListener("touchmove", (e) => {
    if (!dragging) return;
    const touch = e.touches[0];
    handleDragMove(touch.clientX, touch.clientY);
  }, { passive: true });

  document.addEventListener("touchend", () => {
    endDrag();
  });

  /* -----------------------------
     BOTONES: CENTRAR / QUITAR
  ----------------------------- */
  if (centerBtn) {
    centerBtn.addEventListener("click", () => {
      if (!activeLayer) {
        alert("Primero sube un diseño y selecciónalo.");
        return;
      }
      centerActiveLayer();
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      layersWrap.innerHTML = "";
      activeLayer = null;
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

  /* -----------------------------
     AÑADIR AL CARRITO
  ----------------------------- */
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

      const hasDesign = layersWrap && layersWrap.children.length > 0;

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
          html2canvas(frame).then(canvasEl => {
            designPreview = canvasEl.toDataURL("image/png");

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
