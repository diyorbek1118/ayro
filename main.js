(() => {
  const PROJECTS = [];

  const NS = 'ayro-dx0dqzbxkl';
  const API = 'https://abacus.jasoncameron.dev';
  const SOURCES = ['banner', 'qr', 'telegram', 'instagram', 'facebook', 'flyer'];
  const LEAD_ENDPOINT = 'api/lead';
  const loadedAt = Date.now();

  const root = document.documentElement;
  root.classList.add('js');
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const store = (area, key, value) => {
    try {
      const s = area === 'session' ? sessionStorage : localStorage;
      if (value === undefined) return s.getItem(key);
      s.setItem(key, value);
    } catch (e) {
      return null;
    }
    return null;
  };

  const header = document.getElementById('header');
  const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 12);
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const toggle = document.querySelector('.nav-toggle');
  const setMenu = open => {
    header.classList.toggle('nav-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Menyuni yopish' : 'Menyuni ochish');
    document.body.classList.toggle('lock', open);
  };
  toggle.addEventListener('click', () => setMenu(!header.classList.contains('nav-open')));
  document.querySelectorAll('.mnav a').forEach(a => a.addEventListener('click', () => setMenu(false)));
  addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });
  matchMedia('(min-width: 960px)').addEventListener('change', e => { if (e.matches) setMenu(false); });

  const reveals = document.querySelectorAll('.reveal');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    reveals.forEach(el => el.classList.add('in'));
  } else {
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.06 });
    reveals.forEach(el => io.observe(el));
  }

  const mbar = document.querySelector('.mbar');
  const hero = document.querySelector('.hero');
  const contact = document.getElementById('aloqa');
  if (mbar && 'IntersectionObserver' in window) {
    let heroVisible = true;
    let contactVisible = false;
    const update = () => mbar.classList.toggle('show', !heroVisible && !contactVisible);
    new IntersectionObserver(([e]) => { heroVisible = e.isIntersecting; update(); }).observe(hero);
    new IntersectionObserver(([e]) => { contactVisible = e.isIntersecting; update(); }, { threshold: 0.15 }).observe(contact);
  }

  document.querySelectorAll('[data-year]').forEach(el => { el.textContent = String(new Date().getFullYear()); });

  const tashkentDay = (date = new Date()) => new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Tashkent', year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(date).replace(/-/g, '');

  const isLocal = ['localhost', '127.0.0.1', '0.0.0.0', ''].includes(location.hostname);
  const isBot = navigator.webdriver === true || /bot|crawl|spider|slurp|headless|lighthouse|preview|facebookexternalhit|embedly|quora/i.test(navigator.userAgent);
  const isOwner = store('local', 'ayro_owner') === '1';
  const counting = !isLocal && !isBot && !isOwner;

  const hit = key => {
    if (!counting) return;
    try {
      fetch(`${API}/hit/${NS}/${key}`, { keepalive: true, mode: 'cors', credentials: 'omit' }).catch(() => {});
    } catch (e) {}
  };

  if (counting) {
    const day = tashkentDay();
    hit('views');
    hit(`v${day}`);
    if (!store('local', 'ayro_u')) {
      hit('uniq');
      store('local', 'ayro_u', '1');
    }
    if (store('local', 'ayro_ud') !== day) {
      hit(`u${day}`);
      store('local', 'ayro_ud', day);
    }
    const src = (new URLSearchParams(location.search).get('src') || '').toLowerCase();
    if (SOURCES.includes(src) && !store('session', 'ayro_src')) {
      hit(`s-${src}`);
      store('session', 'ayro_src', src);
    }
  }

  document.addEventListener('click', e => {
    const el = e.target.closest('[data-track]');
    if (el) hit(`c-${el.dataset.track}`);
  });

  const form = document.getElementById('lead-form');
  if (form) {
    const done = document.querySelector('.form-done');
    const status = form.querySelector('.form-status');
    const button = form.querySelector('button[type="submit"]');
    const label = button.querySelector('.btn-label');

    const setError = (name, message) => {
      const input = form.elements[name];
      const box = document.getElementById(`e-${name}`);
      if (!input || !box) return;
      input.setAttribute('aria-invalid', message ? 'true' : 'false');
      box.textContent = message || '';
    };

    const validate = data => {
      const errors = {};
      const name = data.name.trim();
      const contactValue = data.contact.trim();
      const digits = contactValue.replace(/\D/g, '');
      if (name.length < 2) errors.name = 'Ismingizni kiriting.';
      if (!(digits.length >= 9 && digits.length <= 15) && !/^@?[A-Za-z][A-Za-z0-9_]{4,31}$/.test(contactValue)) {
        errors.contact = 'Telefon raqam yoki Telegram username kiriting.';
      }
      if (data.message.trim().length < 10) errors.message = 'Loyiha haqida bir-ikki gap yozing.';
      return errors;
    };

    ['name', 'contact', 'message'].forEach(name => {
      form.elements[name].addEventListener('input', () => {
        if (form.elements[name].getAttribute('aria-invalid') === 'true') setError(name, '');
      });
    });

    const showFailure = text => {
      status.textContent = '';
      status.append(document.createTextNode(`${text} Iltimos, Telegram orqali yozing: `));
      const link = document.createElement('a');
      link.href = 'https://t.me/ddddfffz';
      link.target = '_blank';
      link.rel = 'noopener';
      link.dataset.track = 'telegram';
      link.textContent = '@ddddfffz';
      status.append(link);
    };

    form.addEventListener('submit', async e => {
      e.preventDefault();
      status.textContent = '';
      const raw = Object.fromEntries(new FormData(form));
      const data = {
        name: String(raw.name || ''),
        contact: String(raw.contact || ''),
        service: String(raw.service || ''),
        message: String(raw.message || ''),
        honey: String(raw._honey || ''),
      };

      const errors = validate(data);
      ['name', 'contact', 'message'].forEach(name => setError(name, errors[name]));
      const firstInvalid = ['name', 'contact', 'message'].find(name => errors[name]);
      if (firstInvalid) {
        form.elements[firstInvalid].focus();
        return;
      }

      if (data.honey) {
        form.hidden = true;
        done.hidden = false;
        return;
      }

      const lastSent = Number(store('local', 'ayro_sent') || 0);
      if (Date.now() - lastSent < 60000) {
        status.textContent = 'Arizangiz allaqachon yuborilgan. Qayta yuborish uchun bir daqiqa kuting.';
        return;
      }

      button.classList.add('loading');
      button.disabled = true;
      label.textContent = 'Yuborilmoqda…';
      const source = (new URLSearchParams(location.search).get('src') || store('session', 'ayro_src') || '').toLowerCase();
      const sendTelegram = async () => {
        const response = await fetch(LEAD_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: data.name.trim(),
            contact: data.contact.trim(),
            service: data.service,
            message: data.message.trim(),
            source: SOURCES.includes(source) ? source : '',
            elapsed: Date.now() - loadedAt,
          }),
        });
        const json = await response.json().catch(() => ({}));
        return response.ok && json.ok === true;
      };
      try {
        const delivered = await sendTelegram();
        if (!delivered) throw new Error('rejected');
        store('local', 'ayro_sent', String(Date.now()));
        hit('c-form');
        form.reset();
        form.hidden = true;
        done.hidden = false;
        done.querySelector('h3').setAttribute('tabindex', '-1');
        done.querySelector('h3').focus();
      } catch (err) {
        showFailure('Ariza yuborilmadi.');
      } finally {
        button.classList.remove('loading');
        button.disabled = false;
        label.textContent = 'Ariza yuborish';
      }
    });
  }

  if (PROJECTS.length) {
    const section = document.getElementById('loyihalar');
    const list = document.getElementById('proj-list');
    const el = (tag, cls, text) => {
      const node = document.createElement(tag);
      if (cls) node.className = cls;
      if (text) node.textContent = text;
      return node;
    };
    PROJECTS.forEach(p => {
      const card = el('article', 'proj');
      if (p.image) {
        const img = el('img', 'proj-img');
        img.src = p.image;
        img.alt = p.name;
        img.loading = 'lazy';
        img.decoding = 'async';
        card.append(img);
      }
      const body = el('div', 'proj-body');
      body.append(el('p', 'eyebrow', p.category), el('h3', 'proj-name', p.name));
      [['Vazifa', p.challenge], ['Yechim', p.solution], ['Natija', p.result]].forEach(([title, text]) => {
        if (!text) return;
        const row = el('p', 'proj-row');
        row.append(el('b', '', `${title}: `), document.createTextNode(text));
        body.append(row);
      });
      if (p.features && p.features.length) {
        const ul = el('ul', 'ticks');
        p.features.forEach(f => ul.append(el('li', '', f)));
        body.append(ul);
      }
      if (p.tech && p.tech.length) {
        const tags = el('ul', 'tags');
        p.tech.forEach(t => tags.append(el('li', '', t)));
        body.append(tags);
      }
      card.append(body);
      list.append(card);
    });
    section.hidden = false;
  }
})();
