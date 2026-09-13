(function () {
  const KEY = 'class_walikelas';

  const fallback = {
    nama: 'Ibu Siti Rahayu, S.Pd.',
    jabatan: 'Wali Kelas XI IPA 2 · Guru Biologi',
    foto: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&q=80',
    quote: 'Anak-anakku, kalian bukan cuma nomor absen di buku. Kalian adalah cerita yang sedang ditulis, halaman demi halaman.',
    tandaTangan: 'Siti Rahayu'
  };

  const fotoEl = document.getElementById('wkFoto');
  const quoteEl = document.getElementById('wkQuote');
  const namaEl = document.getElementById('wkNama');
  const jabatanEl = document.getElementById('wkJabatan');
  const ttdEl = document.getElementById('wkTtd');

  let typedOnce = false;
  let lastQuote = '';

  function renderTypewriter(text) {
    if (!quoteEl) return;
    const caret = quoteEl.querySelector('.wk-quote-caret');
    let i = 0;
    function step() {
      if (i <= text.length) {
        quoteEl.textContent = '"' + text.slice(0, i) + '"';
        if (caret) quoteEl.appendChild(caret);
        i++;
        const ch = text.charAt(i - 1);
        const delay = ch === '.' || ch === ',' ? 180 : ch === ' ' ? 40 : 22;
        setTimeout(step, delay);
      } else if (caret) {
        caret.style.display = 'none';
      }
    }
    step();
  }

  function render(data) {
    if (fotoEl) {
      fotoEl.src = data.foto;
      fotoEl.alt = data.nama;
      fotoEl.onerror = () => { fotoEl.src = 'https://via.placeholder.com/600x600/0f172a/22d3ee?text=Wali+Kelas'; };
    }
    if (namaEl) namaEl.textContent = '— ' + data.nama;
    if (jabatanEl) jabatanEl.textContent = data.jabatan;
    if (ttdEl) ttdEl.textContent = data.tandaTangan;

    if (quoteEl && !typedOnce) {
      lastQuote = data.quote;
      const io = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            typedOnce = true;
            renderTypewriter(data.quote);
            io.unobserve(quoteEl);
          }
        });
      }, { threshold: 0.35 });
      io.observe(quoteEl);
    } else if (quoteEl && typedOnce && data.quote !== lastQuote) {
      lastQuote = data.quote;
      quoteEl.textContent = '"' + data.quote + '"';
    }
  }

  let localData = fallback;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) localData = Object.assign({}, fallback, JSON.parse(raw));
  } catch {}

  render(localData);

  if (window.FirebaseSync && window.FirebaseSync.ready()) {
    window.FirebaseSync.listen(FIREBASE_PATHS.walikelas, (data) => {
      if (data) {
        const merged = Object.assign({}, fallback, data);
        localStorage.setItem(KEY, JSON.stringify(merged));
        render(merged);
      }
    });
  }
})();