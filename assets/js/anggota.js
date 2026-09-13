(async function () {
  const grid = document.getElementById('anggotaGrid');
  const empty = document.getElementById('emptyState');
  const search = document.getElementById('searchInput');
  const filter = document.getElementById('filterRole');
  if (!grid) return;

  const BADGE_COLORS = {
    cyan:    'bg-cyan-100 text-cyan-800 dark:bg-cyan-500/20 dark:text-cyan-300 border-cyan-300 dark:border-cyan-500/40',
    amber:   'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300 border-amber-300 dark:border-amber-500/40',
    rose:    'bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-300 border-rose-300 dark:border-rose-500/40',
    emerald: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 border-emerald-300 dark:border-emerald-500/40',
    violet:  'bg-violet-100 text-violet-800 dark:bg-violet-500/20 dark:text-violet-300 border-violet-300 dark:border-violet-500/40',
    slate:   'bg-slate-200 text-slate-800 dark:bg-slate-500/20 dark:text-slate-300 border-slate-300 dark:border-slate-500/40'
  };

  let data = [];
  let badges = {};
  try { badges = JSON.parse(localStorage.getItem('class_badges') || '{}'); } catch {}

  async function bootstrap() {
    const overrides = localStorage.getItem('class_siswa_overrides');
    if (overrides) {
      data = JSON.parse(overrides);
    } else {
      try {
        const res = await fetch('data/anggota.json');
        data = await res.json();
      } catch {
        grid.innerHTML = '<p class="col-span-full text-center text-red-500">Gagal memuat data anggota.</p>';
        return;
      }
    }
    render();
  }

  function render() {
    const q = search.value.toLowerCase().trim();
    const role = filter.value;
    const filtered = data.filter((a) => {
      const matchQ = a.nama.toLowerCase().includes(q);
      const matchRole = !role || a.jabatan === role;
      return matchQ && matchRole;
    });

    grid.innerHTML = '';
    if (!filtered.length) {
      empty.classList.remove('hidden');
      return;
    }
    empty.classList.add('hidden');

    filtered.forEach((a) => {
      const badgeDef = a.badge ? badges[a.badge] : null;
      const badgeHtml = (a.badge && badgeDef)
        ? `<span class="inline-flex items-center gap-1 px-3 py-1 rounded-full border text-xs font-semibold badge-pop ${BADGE_COLORS[badgeDef.color] || BADGE_COLORS.cyan}">${a.badge}</span>`
        : '';

      const card = document.createElement('div');
      card.className = 'p-5 rounded-2xl bg-white dark:bg-navy-800 border border-slate-200 dark:border-navy-700 hover:shadow-xl hover:-translate-y-1 transition relative';
      card.innerHTML = `
        ${badgeHtml ? `<div class="absolute -top-3 right-4 badge-float">${badgeHtml}</div>` : ''}
        <div class="flex items-center gap-4">
          <div class="w-14 h-14 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold text-lg">${a.nama.charAt(0)}</div>
          <div>
            <h3 class="font-bold">${a.nama}</h3>
            <p class="text-xs text-slate-500 dark:text-slate-400">${a.jabatan}</p>
          </div>
        </div>
        <p class="mt-4 text-sm text-slate-600 dark:text-slate-400">${a.deskripsi || ''}</p>
        <div class="mt-4 flex gap-2 text-xs">
          <span class="px-3 py-1 rounded-full bg-slate-100 dark:bg-navy-700">${a.kelas || ''}</span>
          <span class="px-3 py-1 rounded-full bg-slate-100 dark:bg-navy-700">${a.hobi || ''}</span>
        </div>
      `;
      grid.appendChild(card);
    });
  }

  search.addEventListener('input', render);
  filter.addEventListener('change', render);

  await bootstrap();

  if (window.FirebaseSync && window.FirebaseSync.ready()) {
    window.FirebaseSync.listen(FIREBASE_PATHS.siswa, (firebaseSiswa) => {
      if (Array.isArray(firebaseSiswa)) {
        data = firebaseSiswa;
        localStorage.setItem('class_siswa_overrides', JSON.stringify(data));
        render();
      }
    });
    window.FirebaseSync.listen(FIREBASE_PATHS.badges, (firebaseBadges) => {
      if (firebaseBadges && typeof firebaseBadges === 'object') {
        badges = firebaseBadges;
        localStorage.setItem('class_badges', JSON.stringify(badges));
        render();
      }
    });
  }
})();