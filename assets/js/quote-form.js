(function () {
  var form = document.getElementById('quote-form');
  var select = document.getElementById('q-product');
  var catSel = document.getElementById('q-category');
  var pbtn = document.getElementById('q-product-btn'), plist = document.getElementById('q-product-list');
  var pitems = document.getElementById('q-product-items'), psearch = document.getElementById('q-product-search');
  var CATALOG_URL = '/products/', data = null, dataP = null, item = '';
  function setValue() {
    var c = catSel.value;
    select.value = !c ? '' : (item && c !== 'Mixed / not sure yet') ? item + ' (' + c + ')' : c;
  }
  function setCur(text, thumb) {
    var cur = pbtn.querySelector('.pick-cur'); cur.textContent = text;
    var old = pbtn.querySelector('img'); if (old) old.remove();
    if (thumb) { var im = thumb.cloneNode(); im.removeAttribute('loading'); pbtn.insertBefore(im, cur); }
  }
  function closeList() { plist.hidden = true; pbtn.setAttribute('aria-expanded', 'false'); }
  // The categories and items come from the Products page, so anything added to the catalog shows up here automatically.
  function getData() {
    if (dataP) return dataP;
    dataP = fetch(CATALOG_URL).then(function (r) { if (!r.ok) throw 0; return r.text(); }).then(function (t) {
      var doc = new DOMParser().parseFromString(t, 'text/html'), base = new URL(CATALOG_URL, location.href), order = [], by = {};
      doc.querySelectorAll('.catalog-card').forEach(function (card) {
        var h3 = card.querySelector('h3'), im = card.querySelector('img'), cat = card.querySelector('.cc-cat');
        if (!h3 || !im || !cat) return;
        var c = cat.textContent.trim();
        if (!by[c]) { by[c] = []; order.push(c); }
        by[c].push({ title: h3.textContent.trim(), src: new URL(im.getAttribute('src'), base).href });
      });
      if (!order.length) throw 0;
      data = by;
      var keep = catSel.value;
      catSel.textContent = '';
      [['', 'Choose a category']].concat(order.map(function (c) { return [c, c]; }), [['Mixed / not sure yet', 'Mixed / not sure yet']]).forEach(function (p) {
        var o = document.createElement('option'); o.value = p[0]; o.textContent = p[1]; catSel.appendChild(o);
      });
      catSel.value = keep; return by;
    }).catch(function () { dataP = null; return null; });
    return dataP;
  }
  function choose(it, img) { item = it.title; setCur(it.title, img); setValue(); }
  function renderItems(c) {
    pitems.textContent = ''; psearch.value = ''; item = ''; setCur('Choose a product', null);
    var list = (data && data[c]) || [];
    list.forEach(function (it) {
      var li = document.createElement('li'), b = document.createElement('button'), img = document.createElement('img'), s = document.createElement('span');
      b.type = 'button'; b.className = 'pick-opt';
      img.src = it.src; img.alt = ''; img.width = 44; img.height = 44; img.loading = 'lazy';
      s.textContent = it.title; b.appendChild(img); b.appendChild(s); li.appendChild(b); pitems.appendChild(li);
      b.addEventListener('click', function () { choose(it, img); closeList(); pbtn.focus(); });
    });
    psearch.hidden = list.length < 10;
    pbtn.disabled = !list.length;
    if (!list.length) setCur(c && c !== 'Mixed / not sure yet' ? 'Products load when you are online' : (c ? 'Not needed, we will help you choose' : 'Choose a category first'), null);
  }
  // Arriving from a catalog item's quote link (?category=...&product=...): pre-select both fields.
  (function () {
    var qp = new URLSearchParams(location.search), c = qp.get('category'), p = qp.get('product');
    if (!c) return;
    getData().then(function () {
      var opt = Array.prototype.filter.call(catSel.options, function (o) { return o.value === c; })[0];
      if (!opt) return;
      catSel.value = c; setValue();
      if (data && data[c]) {
        renderItems(c);
        data[c].forEach(function (it, i) {
          if (it.title === p) choose(it, pitems.children[i].querySelector('img'));
        });
      }
      catSel.scrollIntoView({ block: 'center' });
    });
  })();
  catSel.addEventListener('focus', getData);
  catSel.addEventListener('pointerdown', getData);
  catSel.addEventListener('change', function () {
    closeList(); setValue();
    var c = catSel.value;
    if (!c || c === 'Mixed / not sure yet') { renderItems(c); return; }
    pbtn.disabled = true; setCur('Loading products...', null);
    getData().then(function () { if (catSel.value === c) { renderItems(c); setValue(); } });
  });
  psearch.addEventListener('input', function () {
    var q = psearch.value.trim().toLowerCase();
    Array.prototype.forEach.call(pitems.children, function (li) { li.hidden = !!q && li.textContent.toLowerCase().indexOf(q) < 0; });
  });
  pbtn.addEventListener('click', function () {
    var open = plist.hidden; plist.hidden = !open; pbtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (open && !psearch.hidden) psearch.focus({ preventScroll: true });
  });
  document.addEventListener('click', function (e) { if (!e.target.closest('.picker')) closeList(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !plist.hidden) { closeList(); pbtn.focus(); } });
  document.querySelectorAll('[data-product]').forEach(function (a) {
    a.addEventListener('click', function () { var v = a.getAttribute('data-product'); catSel.value = v; setValue(); });
  });
  if (!form) return;
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var f = form.elements, err = document.getElementById('q-error');
    var qty = parseInt(f.qty.value, 10);
    if (!f.category.value || !(qty >= 100)) {
      err.textContent = !f.category.value ? 'Please choose a category.' : 'The minimum order quantity is 100 units.';
      err.hidden = false; return;
    }
    err.hidden = true;
    var lines = ['Quote request for INZON',
      'Product: ' + (f.product.value || 'Not chosen'), 'Quantity: ' + qty,
      f.date.value ? 'Needed by: ' + f.date.value : ''].filter(Boolean);
    window.open('https://wa.me/919746203482?text=' + encodeURIComponent(lines.join('\n')), '_blank', 'noopener');
  });
})();
