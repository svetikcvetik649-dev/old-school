(function () {
  var TG = 'https://t.me/Old_School_shinka';
  var WA = 'https://wa.me/79914011534';
  var $ = function (id) { return document.getElementById(id); };
  var rub = function (n) { return n.toLocaleString('ru-RU').replace(/ | /g, ' ') + ' ₽'; };

  /* дата в заказ-наряде и статус «открыто» считаем по московскому времени */
  function moscow() {
    try {
      var p = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Moscow', weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(new Date());
      var o = {}; p.forEach(function (x) { o[x.type] = x.value; });
      var day = { Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 0 }[o.weekday];
      return { day: day, h: parseInt(o.hour, 10) % 24, m: parseInt(o.minute, 10) };
    } catch (e) { return null; }
  }
  var dateEl = $('blank-date');
  if (dateEl) {
    try { dateEl.textContent = new Date().toLocaleDateString('ru-RU', { timeZone: 'Europe/Moscow', day: 'numeric', month: 'long', year: 'numeric' }); } catch (e) {}
  }
  var openNow = $('open-now'), openNote = $('open-note');
  var t = moscow();
  if (t && openNow && openNote) {
    var weekend = t.day === 0 || t.day === 6;
    var from = weekend ? 10 : 7, to = 22, cur = t.h + t.m / 60;
    if (cur >= from && cur < to) { openNow.textContent = 'Открыто сейчас'; openNote.textContent = 'до 22:00'; }
    else {
      var nextWeekend = cur >= to ? (t.day === 5 || t.day === 6) : weekend;
      openNow.textContent = 'Сейчас закрыто'; openNote.textContent = 'откроется в ' + (nextWeekend ? '10:00' : '7:00');
    }
  }

  /* заказ-наряд: отмеченные строки, сумма и текст сообщения */
  var form = $('blank');
  if (!form) return;
  var inputs = Array.prototype.slice.call(form.querySelectorAll('input[type=checkbox]'));
  var list = $('sum-list'), total = $('sum-total'), bubble = $('bubble');
  var pill = $('pill'), pillN = $('pill-n'), pillT = $('pill-t');
  var sumEl = $('sum'), copied = $('copied');
  var empty = 'Здравствуйте! Хочу записаться в Old School. Подскажите, когда можно подъехать?';
  var message = empty;

  function update() {
    var picked = inputs.filter(function (i) { return i.checked; });
    var sum = 0, anyFrom = false, lines = [];
    list.innerHTML = '';
    picked.forEach(function (i) {
      var p = +i.dataset.price, from = !!i.dataset.from;
      sum += p; anyFrom = anyFrom || from;
      var li = document.createElement('li');
      var a = document.createElement('span'); a.textContent = i.dataset.name;
      var b = document.createElement('span'); b.textContent = (from ? 'от ' : '') + rub(p);
      li.appendChild(a); li.appendChild(b); list.appendChild(li);
      lines.push('- ' + i.dataset.name + ': ' + (from ? 'от ' : '') + rub(p));
    });
    if (!picked.length) {
      list.innerHTML = '<li class="sum__empty">Пока ничего. Отметьте строки слева.</li>';
      message = empty;
    } else {
      message = 'Здравствуйте! Хочу записаться в Old School:\n' + lines.join('\n') + '\nПо прайсу выходит ' + (anyFrom ? 'от ' : 'около ') + rub(sum) + '. Подскажите, когда можно подъехать? Машина: ';
    }
    total.textContent = (anyFrom ? 'от ' : '') + rub(sum);
    bubble.textContent = message;
    $('send-wa').href = WA + '?text=' + encodeURIComponent(message);
    pillN.textContent = picked.length;
    pillT.textContent = (anyFrom ? 'от ' : '') + rub(sum);
    togglePill(picked.length);
    copied.hidden = true;
  }

  /* плашка внизу экрана, пока сам итог не виден */
  var sumVisible = false, hasPicked = 0;
  function togglePill(n) { if (typeof n === 'number') hasPicked = n; pill.hidden = !(hasPicked && !sumVisible); }
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (e) { sumVisible = e[0].isIntersecting; togglePill(); }, { threshold: 0.2 }).observe(sumEl);
  }

  form.addEventListener('change', update);
  $('send-tg').addEventListener('click', function () {
    /* Telegram не принимает готовый текст по ссылке: копируем его и открываем чат */
    if (message === empty) return;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(message).then(function () { copied.hidden = false; setTimeout(function () { copied.hidden = true; }, 5000); }, function () {});
    }
  });
  update();
})();
