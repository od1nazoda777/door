/* =====================================================================
   PalitraDoors — HTML-КОМПОНЕНТ  <product-card>
   Карточка товара, которую можно вставить одной строкой в любую страницу.

   ПРИМЕР:
   <product-card
     category="interior"
     image="img/products/classic.jpg"
     model="Дверь «Classic»"
     price="1850">
   </product-card>

   ВСЕ АТРИБУТЫ
   ───────────
   model        — название модели (обязательно)
   price        — цена, только число: 1850 (обязательно)
   image        — путь к фото, например img/products/door-1.jpg
                  (нет фото или неверный путь — покажется заглушка)
   category     — interior | entrance | handles | locks
   old-price    — старая цена (зачёркнутая), необязательно
   badge        — надпись на фото: «Хит», «Новинка», «-15%»
   description  — короткое описание, необязательно
   href         — своя ссылка для кнопки (по умолчанию — настройка ниже)

   Подключение на странице:  <script src="product-card.js"></script>
   ===================================================================== */


/* ---------- НАСТРОЙКИ (меняются в одном месте) ---------- */
const PRODUCT_CARD_SETTINGS = {
  currency: 'смн',                      // валюта после цены
  buttonText: 'Заказать',               // текст кнопки
  buttonLink: 'contacts.html#callback'  // куда ведёт кнопка
};

// Подписи категорий над названием товара
const PRODUCT_CATEGORY_NAMES = {
  interior: 'Межкомнатные двери',
  entrance: 'Входные двери',
  handles:  'Дверные ручки',
  locks:    'Замки и петли'
};


/* ---------- Сам компонент ---------- */
class ProductCard extends HTMLElement {

  // Атрибуты, за изменением которых компонент следит
  static get observedAttributes() {
    return ['category', 'image', 'model', 'price', 'old-price', 'badge', 'description', 'href'];
  }

  connectedCallback() { this.scheduleRender(); }
  attributeChangedCallback() { if (this.isConnected) this.scheduleRender(); }

  // Перерисовываем один раз, даже если сразу изменилось несколько атрибутов
  scheduleRender() {
    if (this._pending) return;
    this._pending = true;
    queueMicrotask(() => { this._pending = false; this.render(); });
  }

  // Цена: 1850 → «1 850 смн»
  formatPrice(value) {
    const n = Number(value);
    return (isFinite(n) ? n.toLocaleString('ru-RU') : value) + ' ' + PRODUCT_CARD_SETTINGS.currency;
  }

  render() {
    const model       = this.getAttribute('model') || 'Без названия';
    const price       = this.getAttribute('price');
    const oldPrice    = this.getAttribute('old-price');
    const image       = this.getAttribute('image');
    const category    = this.getAttribute('category');
    const badgeText   = this.getAttribute('badge');
    const description = this.getAttribute('description');
    const href        = this.getAttribute('href') || PRODUCT_CARD_SETTINGS.buttonLink;

    const card = document.createElement('article');
    card.className = 'product-card';

    // --- Фото (если нет или не загрузилось — заглушка) ---
    const media = document.createElement('div');
    media.className = 'product-card__media';
    if (image) {
      const img = document.createElement('img');
      img.addEventListener('error', () => { img.remove(); media.classList.add('is-empty'); });
      img.src = image;
      img.alt = model;
      img.loading = 'lazy';
      media.appendChild(img);
    } else {
      media.classList.add('is-empty');
    }
    if (badgeText) {
      const badge = document.createElement('span');
      badge.className = 'product-card__badge';
      badge.textContent = badgeText;
      media.appendChild(badge);
    }

    // --- Текст ---
    const body = document.createElement('div');
    body.className = 'product-card__body';

    const cat = document.createElement('div');
    cat.className = 'product-card__cat';
    cat.textContent = PRODUCT_CATEGORY_NAMES[category] || '';

    const title = document.createElement('h3');
    title.className = 'product-card__title';
    title.textContent = model;

    const desc = document.createElement('p');
    desc.className = 'product-card__desc';
    desc.textContent = description || '';

    // --- Цена и кнопка ---
    const bottom = document.createElement('div');
    bottom.className = 'product-card__bottom';

    const priceBox = document.createElement('div');
    priceBox.className = 'price';
    const priceNew = document.createElement('span');
    priceNew.className = 'price__new';
    priceNew.textContent = price ? this.formatPrice(price) : 'Цена по запросу';
    priceBox.appendChild(priceNew);
    if (oldPrice) {
      const priceOld = document.createElement('span');
      priceOld.className = 'price__old';
      priceOld.textContent = this.formatPrice(oldPrice);
      priceBox.appendChild(priceOld);
    }

    const btn = document.createElement('a');
    btn.className = 'btn btn--primary btn--sm';
    btn.href = href;
    btn.textContent = PRODUCT_CARD_SETTINGS.buttonText;

    bottom.append(priceBox, btn);
    body.append(cat, title, desc, bottom);
    card.append(media, body);
    this.replaceChildren(card);
  }
}

customElements.define('product-card', ProductCard);