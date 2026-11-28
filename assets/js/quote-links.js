/* Each catalog item's "Request a quote" link opens the home quote form with that item's category and name already chosen.
   Built from the card itself, so items added to the catalog later work without any extra markup. */
document.querySelectorAll('.catalog-card').forEach(function (card) {
  var link = card.querySelector('.cc-link'), cat = card.querySelector('.cc-cat'), title = card.querySelector('h3');
  if (!link || !cat || !title) return;
  link.href = '/?category=' + encodeURIComponent(cat.textContent.trim()) + '&product=' + encodeURIComponent(title.textContent.trim()) + '#quote';
});
