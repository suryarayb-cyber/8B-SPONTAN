(function () {
  const grid = document.getElementById('projectsGrid');
  const empty = document.getElementById('projectsEmpty');
  if (!grid) return;

  const KEY = 'class_projects';

  const fallback = [
    { id: 'p1', judul: 'Website Kelas', deskripsi: 'Website profil kelas yang kamu lihat sekarang.', gambar: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&q=80', tag: 'Web Development', tanggal: '2025' },
    { id: 'p2', judul: 'Mading Digital', deskripsi: 'Majalah dinding kelas versi digital.', gambar: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800&q=80', tag: 'Karya Siswa', tanggal: '2025' },
    { id: 'p3', judul: 'Bank Soal', deskripsi: 'Kumpulan soal latihan lintas mapel.', gambar: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&q=80', tag: 'Edukasi', tanggal: '2024' }
  ];

  function render(projects) {
    grid.innerHTML = '';
    if (!projects || !projects.length) {
      empty.classList.remove('hidden');
      return;
    }
    empty.classList.add('hidden');
    projects.slice(0, 3).forEach((p) => {
      const card = document.createElement('a');
      card.href = `project.html?id=${encodeURIComponent(p.id)}`;
      card.className = 'project-card group rounded-2xl overflow-hidden bg-white dark:bg-navy-800 border border-slate-200 dark:border-navy-700 card-hover flex flex-col no-underline text-inherit';
      card.innerHTML = `
        <div class="relative aspect-[4/3] overflow-hidden bg-slate-200 dark:bg-navy-700">
          <img src="${p.gambar}" alt="${p.judul}" loading="lazy" class="w-full h-full object-cover" onerror="this.src='https://via.placeholder.com/800x600/0f172a/22d3ee?text=Project'" />
          ${p.tag ? `<span class="absolute top-3 left-3 px-3 py-1 rounded-full bg-navy-900/80 backdrop-blur text-accent text-xs font-semibold">${p.tag}</span>` : ''}
        </div>
        <div class="p-6 flex flex-col flex-1">
          <span class="text-xs text-slate-400 uppercase tracking-wider mb-2">${p.tanggal || ''}</span>
          <h3 class="text-lg font-bold mb-2 group-hover:text-accent transition">${p.judul}</h3>
          <p class="text-sm text-slate-600 dark:text-slate-400 line-clamp-3 flex-1">${p.deskripsi}</p>
        </div>
      `;
      grid.appendChild(card);
    });
  }

  let localData = fallback;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) localData = JSON.parse(raw);
  } catch {}

  render(localData);

  if (window.FirebaseSync && window.FirebaseSync.ready()) {
    window.FirebaseSync.listen(FIREBASE_PATHS.projects, (data) => {
      if (Array.isArray(data)) {
        localStorage.setItem(KEY, JSON.stringify(data));
        render(data);
      }
    });
  }
})();