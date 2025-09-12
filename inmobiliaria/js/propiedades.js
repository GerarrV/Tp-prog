document.addEventListener('DOMContentLoaded', async () => {
  const grid = document.getElementById('prop-grid');
  const modal = document.getElementById('prop-modal');
  const modalBody = document.getElementById('prop-modal-body');

  if (!grid) return;

  // Cargar datos del JSON
  let data = [];
  try {
    const res = await fetch('JSON/inmuebles.json', { cache: 'no-cache' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    data = await res.json();
  } catch (e) {
    console.error('No se pudo cargar inmuebles.json:', e);
    grid.innerHTML = '<p style="color: var(--color-muted)">No se pudieron cargar las propiedades.</p>';
    return;
  }

  // Renderizar cards (imagen cuadrada y soporte multi-imagenes tomando la primera)
  grid.innerHTML = data.map(item => cardHTML(item)).join('');

  // Click en card -> abrir modal
  grid.addEventListener('click', (ev) => {
    const card = ev.target.closest('[data-prop-id]');
    if (!card) return;

    const id = Number(card.dataset.propId);
    const prop = data.find(p => p.id === id);
    if (!prop) return;

    openModal(prop);
  });

  // Accesibilidad: abrir con Enter cuando la card tiene foco
  grid.addEventListener('keydown', (ev) => {
    if (ev.key === 'Enter') {
      const card = ev.target.closest('[data-prop-id]');
      if (!card) return;

      const id = Number(card.dataset.propId);
      const prop = data.find(p => p.id === id);
      if (prop) openModal(prop);
    }
  });

  document.addEventListener('keydown', (ev) => {
    if (ev.key === 'Escape' && !modal.hasAttribute('hidden')) closeModal();
  });

  // Cerrar modal por clicks en backdrop, botón X, o click en el contenedor fuera del contenido
  modal?.addEventListener('click', (ev) => {
    const target = ev.target;
    const isBackdrop = target.classList?.contains('modal-backdrop');
    const isCloseBtn = target.matches?.('[data-close]');
    const clickedOutsideContent = target === modal; // click directo en el contenedor
    if (isBackdrop || isCloseBtn || clickedOutsideContent) {
      closeModal();
    }
  });

  // Estado del carrusel en el modal
  let currentImages = [];
  let currentIndex = 0;

  function openModal(prop) {
    modalBody.innerHTML = modalHTML(prop);
    // Configurar estado de imágenes (array)
    currentImages = Array.isArray(prop.imagenes) && prop.imagenes.length > 0 ? prop.imagenes : [prop.imagen];
    currentIndex = 0;
    updateCarousel();

    // Listeners de flechas e indicadores
    const prevBtn = modalBody.querySelector('[data-prev]');
    const nextBtn = modalBody.querySelector('[data-next]');
    prevBtn?.addEventListener('click', () => move(-1));
    nextBtn?.addEventListener('click', () => move(1));

    const dots = modalBody.querySelectorAll('[data-dot]');
    dots.forEach((dot, i) => dot.addEventListener('click', () => goTo(i)));

    // Listener explícito para el botón X de cerrar
    const closeBtn = modalBody.parentElement?.querySelector('[data-close]');
    closeBtn?.addEventListener('click', closeModal);

    modal.removeAttribute('hidden');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modal.setAttribute('hidden', '');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function cardHTML(p) {
    const firstImg = Array.isArray(p.imagenes) && p.imagenes.length > 0 ? p.imagenes[0] : p.imagen;
    return `
      <article class="card clickable" data-prop-id="${p.id}" tabindex="0" aria-label="Ver detalle de ${p.titulo}">
        <img class="card-media" src="${firstImg}" alt="${p.titulo}" loading="lazy">
        <div class="card-body">
          <h3 class="card-title">${p.titulo}</h3>
          <p class="card-meta">${p.direccion}</p>
          <p class="price">Precio $${p.precio.toLocaleString('es-AR')}</p>
        </div>
      </article>
    `;
  }

  function modalHTML(p) {
    const imgs = Array.isArray(p.imagenes) && p.imagenes.length > 0 ? p.imagenes : [p.imagen];
    return `
      <div class="prop-detail">
        <div class="carousel">
          <button class="carousel-arrow left" aria-label="Anterior" data-prev>❮</button>
          <div class="carousel-viewport">
            ${imgs.map((src, i) => `<img class="detail-media" data-slide="${i}" src="${src}" alt="${p.titulo} - imagen ${i+1}" loading="lazy">`).join('')}
          </div>
          <button class="carousel-arrow right" aria-label="Siguiente" data-next>❯</button>
          <div class="carousel-dots">
            ${imgs.map((_, i) => `<button class="dot" data-dot="${i}" aria-label="Ir a imagen ${i+1}"></button>`).join('')}
          </div>
        </div>
        <div class="detail-body">
          <h2 id="prop-modal-title">${p.titulo}</h2>
          <p class="detail-meta">${p.direccion}</p>
          <p class="detail-price">Precio $${p.precio.toLocaleString('es-AR')}</p>
          <ul class="detail-specs">
            <li><strong>Dormitorios:</strong> ${p.dormitorios}</li>
            <li><strong>Baños:</strong> ${p.banos}</li>
            <li><strong>Metros:</strong> ${p.metros} m²</li>
            <li><strong>Tipo:</strong> ${p.tipo}</li>
            <li><strong>Estado:</strong> ${p.estado}</li>
          </ul>
          <p class="detail-desc">${p.descripcion}</p>
        </div>
      </div>
    `;
  }

  function move(delta) {
    if (!currentImages.length) return;
    currentIndex = (currentIndex + delta + currentImages.length) % currentImages.length;
    updateCarousel();
  }

  function goTo(index) {
    if (index < 0 || index >= currentImages.length) return;
    currentIndex = index;
    updateCarousel();
  }

  function updateCarousel() {
    const slides = modalBody.querySelectorAll('[data-slide]');
    const dots = modalBody.querySelectorAll('[data-dot]');
    slides.forEach((img, i) => {
      img.style.display = i === currentIndex ? 'block' : 'none';
    });
    dots.forEach((dot, i) => {
      if (i === currentIndex) dot.classList.add('active'); else dot.classList.remove('active');
    });
  }

  // Navegación con teclas en el modal (izquierda/derecha)
  document.addEventListener('keydown', (ev) => {
    if (modal.hasAttribute('hidden')) return;
    if (ev.key === 'ArrowLeft') move(-1);
    if (ev.key === 'ArrowRight') move(1);
  });
});