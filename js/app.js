const fmt = new Intl.NumberFormat("es-MX", { style: "currency", currency: CONFIG.currency, maximumFractionDigits: 0 });
const cart = new Map();        // id -> cantidad (solo en memoria)
const slideIndex = new Map();  // id -> foto que se ve en la tarjeta
let filter = "all";
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const $ = (id) => document.getElementById(id);
const productById = (id) => CONFIG.products.find((p) => p.id === id);
const total = () => [...cart].reduce((sum, [id, qty]) => sum + productById(id).price * qty, 0);
const itemCount = () => [...cart.values()].reduce((a, b) => a + b, 0);
const waLink = (text) => `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(text)}`;
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const minPrice = () => Math.min(...CONFIG.products.map((p) => p.price));

// Si una foto no carga, se quita; si no queda ninguna, se oculta el bloque completo (sin espacios vacíos).
function imgFail(el) {
  const slides = el.closest(".slides");
  el.remove();
  if (!slides) return;
  const left = slides.querySelectorAll("img");
  if (!left.length) slides.closest(".card-img")?.remove();
  else if (left.length === 1) slides.querySelectorAll(".dot").forEach((d) => (d.hidden = true));
}

// ===== Carrusel de fotos =====
function slideshowHTML(p) {
  const start = slideIndex.get(p.id) || 0;
  const slides = p.images
    .map((src, i) => `<img src="${src}" alt="${esc(p.name)}, foto ${i + 1}" loading="lazy" class="${i === start ? "on" : ""}" onerror="imgFail(this)">`)
    .join("");
  const dots = p.images.length > 1
    ? `<div class="dots">${p.images.map((_, i) => `<button class="dot ${i === start ? "on" : ""}" data-i="${i}" aria-label="Ver foto ${i + 1}"></button>`).join("")}</div>`
    : "";
  return `<div class="slides" data-id="${p.id}">${slides}${dots}</div>`;
}

function showSlide(el, i) {
  if (!el) return;
  const imgs = el.querySelectorAll("img");
  if (!imgs.length) return;
  const n = imgs.length;
  const idx = ((i % n) + n) % n;
  imgs.forEach((img, k) => img.classList.toggle("on", k === idx));
  // Fondo borroso con la misma foto: la imagen nítida se ve completa sin recortes
  const frame = el.closest(".card-img");
  if (frame) frame.style.setProperty("--bg", `url("${new URL(imgs[idx].getAttribute("src"), document.baseURI).href}")`);
  el.querySelectorAll(".dot").forEach((d, k) => d.classList.toggle("on", k === idx));
  slideIndex.set(el.dataset.id, idx);
}

const stepSlide = (el, dir) => showSlide(el, (slideIndex.get(el.dataset.id) || 0) + dir);

// Cambio automático cada 4 s, salvo que el usuario tenga "reducir movimiento"
setInterval(() => {
  if (reduceMotion || document.hidden) return;
  document.querySelectorAll(".slides:not(.paused)").forEach((el) => stepSlide(el, 1));
}, 4000);

// ===== Render =====
function renderFilters() {
  const tags = ["all", ...new Set(CONFIG.products.map((p) => p.tag))];
  $("filters").innerHTML = tags
    .map((t) => `<button class="chip" data-key="${esc(t)}" aria-pressed="${t === filter}">${t === "all" ? "Todos" : esc(t)}</button>`)
    .join("");
}

function renderGrid() {
  const items = CONFIG.products.filter((p) => filter === "all" || p.tag === filter);
  $("grid").innerHTML = items
    .map((p) => `
      <article class="card">
        ${(p.images || []).length ? `<div class="card-img">${slideshowHTML(p)}</div>` : ""}
        <p class="tag">${esc(p.tag)} · Calidad OEM Premium</p>
        <h3><a href="producto.html?id=${p.id}">${esc(p.name)}</a></h3>
        <p>${esc(p.desc)}</p>
        <div class="card-foot">
          <span class="price">${fmt.format(p.price)}</span>
          <button class="add ${cart.has(p.id) ? "done" : ""}" data-add="${p.id}">${cart.has(p.id) ? "En tu pedido ✓" : "Agregar"}</button>
        </div>
        <div class="card-links">
          <a class="details-link" href="producto.html?id=${p.id}">Ver detalles →</a>
          <a class="details-link" href="${waLink(`Hola, quiero el ${p.name} (${fmt.format(p.price)}). ¿Hay disponibilidad?`)}" target="_blank" rel="noopener">Consultar por WhatsApp</a>
        </div>
      </article>`)
    .join("");
}

// Inicia el fondo borroso de cada tarjeta con su primera foto
function initBackdrops() {
  document.querySelectorAll("#grid .slides").forEach((el) => showSlide(el, slideIndex.get(el.dataset.id) || 0));
}

function renderCompare() {
  $("compareBody").innerHTML = CONFIG.products
    .map((p) => `
      <tr>
        <th scope="row"><a href="producto.html?id=${p.id}">${esc(p.name)}</a></th>
        <td>${fmt.format(p.price)}</td>
        <td>Calidad OEM Premium</td>
        <td>${CONFIG.warrantyDays} días</td>
      </tr>`)
    .join("");
}

function renderRefs() {
  $("refGrid").innerHTML = CONFIG.reviews.length
    ? CONFIG.reviews.map((r) => `
      <figure class="shot">
        <img src="${r.src}" alt="Mensaje de un comprador con calificación de ${r.rating} de 5" loading="lazy" onerror="this.closest('.shot').remove()">
        <figcaption class="rating"><span class="stars" aria-hidden="true">★★★★★</span> <strong>${r.rating}</strong> de 5</figcaption>
      </figure>`).join("")
    : `<figure class="empty-slot"><p>Pronto publicaremos mensajes de compradores.</p></figure>`;
}

function renderCart() {
  $("cartCount").textContent = itemCount();
  const lines = [...cart].map(([id, qty]) => {
    const p = productById(id);
    return `
      <div class="line">
        <div>
          <strong>${esc(p.name)}</strong>
          <small>${fmt.format(p.price)} c/u</small>
          <div class="qty">
            <button data-dec="${id}" aria-label="Quitar uno">−</button>
            <span>${qty}</span>
            <button data-inc="${id}" aria-label="Agregar uno">+</button>
          </div>
        </div>
        <strong class="num">${fmt.format(p.price * qty)}</strong>
      </div>`;
  });
  $("lines").innerHTML = lines.length ? lines.join("") : `<p class="empty">Tu pedido está vacío.<br>Agrega AirPods desde el catálogo.</p>`;
  $("total").textContent = fmt.format(total());
  $("sendWa").setAttribute("aria-disabled", String(itemCount() === 0));
  $("sendWa").href = waLink(orderText());
}

// Mensaje de pedido: producto, modelo, cantidad, precio unitario, total, zona y nota
function orderText() {
  const name = $("name").value.trim();
  const zoneNote = $("note").value.trim();
  let text = "Hola, quiero hacer este pedido:\n\n";
  cart.forEach((qty, id) => {
    const p = productById(id);
    text += `• ${p.name}\n   Cantidad: ${qty}\n   Precio unitario: ${fmt.format(p.price)}\n   Subtotal: ${fmt.format(p.price * qty)}\n`;
  });
  text += `\nTotal: ${fmt.format(total())}`;
  if (name) text += `\nNombre: ${name}`;
  if (zoneNote) text += `\nZona de entrega y nota: ${zoneNote}`;
  text += "\n\n¿Hay disponibilidad?";
  return text;
}

function toast(msg) {
  const t = $("toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => t.classList.remove("show"), 2200);
}

function openCart(open) {
  $("drawer").classList.toggle("open", open);
  $("scrim").classList.toggle("open", open);
  if (open) {
    renderCart();
    $("closeCart").focus();
  } else {
    $("openCart").focus();
  }
}

function refreshAll() {
  renderFilters();
  renderGrid();
  initBackdrops();
  renderCart();
}

// ===== Recomendador =====
// Usa las tres respuestas a la vez. Solo usa datos de config.js (fit, newest, precio).
// No atribuye funciones a los modelos.
const styleLabel = {
  almohadilla: "con almohadilla (ajuste sellado)",
  clasico: "sin almohadilla (estilo clásico)",
  nuevo: "de los más nuevos",
};
function recommend(device, style, modelId) {
  const deviceName = device === "android" ? "Android" : "iPhone";
  const compat = device === "android"
    ? "Como usas Android, confirmamos la compatibilidad de la unidad por WhatsApp antes de pagar."
    : "Confirmamos la compatibilidad de la unidad por WhatsApp antes de pagar.";
  const wantFit = style === "almohadilla" ? "almohadilla" : style === "clasico" ? "sin almohadilla" : null;
  const chosen = modelId ? productById(modelId) : null;

  // 1) Qué modelo recomendar
  let pick;
  if (chosen) pick = chosen;
  else if (style === "nuevo") pick = CONFIG.products.find((p) => p.newest) || CONFIG.products[0];
  else pick = CONFIG.products.find((p) => p.fit === wantFit) || CONFIG.products[0];

  // 2) Texto con todas las respuestas
  let text = `Para tu ${deviceName} te recomendamos el ${pick.name} (${fmt.format(pick.price)}).`;
  if (chosen) text += " Es el modelo que elegiste.";
  else text += ` Lo elegimos por tu preferencia ${styleLabel[style]}.`;

  // 3) Si el modelo elegido no coincide con el ajuste que prefieren, avisamos y sugerimos
  if (chosen && wantFit && chosen.fit !== wantFit) {
    const alt = CONFIG.products.find((p) => p.fit === wantFit && p.id !== chosen.id);
    text += ` Ojo: el ${chosen.name} no es ${styleLabel[style]}.`;
    if (alt) text += ` Si ese ajuste es el que buscas, el ${alt.name} (${fmt.format(alt.price)}) sí lo es.`;
  }

  return `${text} ${compat}`;
}

// ===== Eventos =====
$("filters").addEventListener("click", (e) => {
  const b = e.target.closest("[data-key]");
  if (!b) return;
  filter = b.dataset.key;
  refreshAll();
});

$("grid").addEventListener("click", (e) => {
  const dot = e.target.closest(".dot");
  if (dot) return showSlide(dot.closest(".slides"), Number(dot.dataset.i));
  const add = e.target.closest("[data-add]");
  if (!add) return;
  const id = add.dataset.add;
  cart.set(id, (cart.get(id) || 0) + 1);
  refreshAll();
  toast(`${productById(id).name} agregado al pedido`);
});

// Pausa el carrusel mientras el cursor está encima
$("grid").addEventListener("mouseover", (e) => {
  const s = e.target.closest(".slides");
  if (s) s.classList.add("paused");
});
$("grid").addEventListener("mouseout", (e) => {
  const s = e.target.closest(".slides");
  if (s && !s.contains(e.relatedTarget)) s.classList.remove("paused");
});

// Deslizar en celular
let swipe = null;
$("grid").addEventListener("touchstart", (e) => {
  const s = e.target.closest(".slides");
  swipe = s ? { el: s, x: e.touches[0].clientX } : null;
}, { passive: true });
$("grid").addEventListener("touchend", (e) => {
  if (!swipe) return;
  const dx = e.changedTouches[0].clientX - swipe.x;
  if (Math.abs(dx) > 40) stepSlide(swipe.el, dx < 0 ? 1 : -1);
  swipe = null;
});

$("lines").addEventListener("click", (e) => {
  const inc = e.target.closest("[data-inc]");
  const dec = e.target.closest("[data-dec]");
  if (inc) cart.set(inc.dataset.inc, cart.get(inc.dataset.inc) + 1);
  if (dec) {
    const id = dec.dataset.dec;
    const qty = cart.get(id) - 1;
    if (qty > 0) cart.set(id, qty);
    else cart.delete(id);
  }
  if (inc || dec) refreshAll();
});

$("openCart").addEventListener("click", () => openCart(true));
$("closeCart").addEventListener("click", () => openCart(false));
$("scrim").addEventListener("click", () => openCart(false));
document.addEventListener("keydown", (e) => { if (e.key === "Escape") openCart(false); });
["name", "note"].forEach((id) => $(id).addEventListener("input", renderCart));
$("sendWa").addEventListener("click", (e) => {
  if (itemCount() === 0) {
    e.preventDefault();
    toast("Agrega al menos un producto");
  }
});

$("verRecomendacion").addEventListener("click", () => {
  const device = $("q-device").value;
  const style = $("q-style").value;
  const model = $("q-model").value;
  if (!device || !style) {
    $("assistResult").textContent = "Elige tu celular y tu preferencia de ajuste para recomendarte.";
    return;
  }
  $("assistResult").textContent = recommend(device, style, model);
});

// ===== Datos fijos y pie de página =====
const phone = "+" + CONFIG.whatsapp.replace(/^(\d{2})(\d{2})(\d{4})(\d{4})$/, "$1 $2 $3 $4");
const waDefault = waLink("Hola, tengo una duda sobre los AirPods.");
document.querySelectorAll("[data-phone]").forEach((el) => (el.textContent = phone));
document.querySelectorAll("[data-wa]").forEach((el) => (el.href = waDefault));
document.querySelectorAll("[data-min-price]").forEach((el) => (el.textContent = fmt.format(minPrice())));
$("year").textContent = new Date().getFullYear();

document.querySelectorAll("[data-social]").forEach((el) => {
  const url = CONFIG.social[el.dataset.social];
  el.hidden = !url;
  if (url) el.href = url;
});
document.querySelectorAll("[data-email]").forEach((el) => {
  el.hidden = !CONFIG.email;
  if (CONFIG.email) {
    el.href = `mailto:${CONFIG.email}`;
    el.textContent = CONFIG.email;
  }
});

// Menú hamburguesa en celular
document.querySelectorAll(".menu-btn").forEach((btn) => {
  const header = btn.closest("header");
  const setOpen = (open) => {
    header.classList.toggle("menu-open", open);
    btn.setAttribute("aria-expanded", String(open));
    btn.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
  };
  btn.addEventListener("click", () => setOpen(!header.classList.contains("menu-open")));
  header.querySelectorAll(".links a").forEach((a) => a.addEventListener("click", () => setOpen(false)));
});

renderCompare();
renderRefs();
refreshAll();

// Aviso flotante de entregas: se cierra con la X
const notice = $("notice");
if (notice) $("noticeClose").addEventListener("click", () => (notice.hidden = true));

// Apartado de mejoras: arma el mensaje y lo envía por WhatsApp
const fbForm = $("mejorasForm");
if (fbForm) {
  fbForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const like = $("fb-like").value.trim();
    const dislike = $("fb-dislike").value.trim();
    const improve = $("fb-improve").value.trim();
    if (!like && !dislike && !improve) {
      $("fbResult").textContent = "Escribe al menos una opinión para enviarla.";
      return;
    }
    const name = $("fb-name").value.trim();
    let text = "Hola, quiero compartir una opinión sobre la web:\n";
    if (like) text += `\nMe gusta: ${like}`;
    if (dislike) text += `\nNo me gusta: ${dislike}`;
    if (improve) text += `\nCómo mejorar: ${improve}`;
    if (name) text += `\n\nNombre: ${name}`;
    window.open(waLink(text), "_blank", "noopener");
    $("fbResult").textContent = "Abrimos WhatsApp con tu mensaje listo para enviar.";
  });
}
