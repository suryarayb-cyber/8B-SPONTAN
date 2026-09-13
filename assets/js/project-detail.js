(function () {
  const KEY = 'class_projects';
  const loading = document.getElementById('loading');
  const detail = document.getElementById('projectDetail');
  const notFound = document.getElementById('notFound');

  const fallback = [
    { id: 'p1', judul: 'Website Kelas', deskripsi: 'Website profil kelas.', gambar: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=1200&q=80', tag: 'Web Development', tanggal: '2025' },
    { id: 'p2', judul: 'Mading Digital', deskripsi: 'Majalah dinding digital.', gambar: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=1200&q=80', tag: 'Karya Siswa', tanggal: '2025' },
    { id: 'p3', judul: 'Bank Soal', deskripsi: 'Kumpulan soal lintas mapel.', gambar: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=1200&q=80', tag: 'Edukasi', tanggal: '2024' }
  ];

  let projects = fallback;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) projects = JSON.parse(raw);
  } catch {}

  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');

  function render() {
    const project = projects.find((p) => p.id === id);
    if (loading) loading.classList.add('hidden');

    if (!project) {
      if (notFound) notFound.classList.remove('hidden');
      return;
    }

    document.title = project.judul + ' — Kelas XI IPA 2';
    if (detail) detail.classList.remove('hidden');

    const pTag = document.getElementById('pTag');
    if (project.tag) pTag.textContent = project.tag;
    else pTag.style.display = 'none';

    document.getElementById('pJudul').textContent = project.judul;
    document.getElementById('pTanggal').textContent = project.tanggal || '';
    document.getElementById('pGambar').src = project.gambar;
    document.getElementById('pGambar').alt = project.judul;
    document.getElementById('pDeskripsi').textContent = project.deskripsi;
    document.getElementById('pTagBox').textContent = project.tag || '—';
    document.getElementById('pTanggalBox').textContent = project.tanggal || '—';

    const others = projects.filter((p) => p.id !== project.id).slice(0, 2);
    const otherBox = document.getElementById('otherProjects');
    otherBox.innerHTML = '';
    if (!others.length) {
      otherBox.innerHTML = '<p class="text-sm text-slate-400">Belum ada project lain.</p>';
    } else {
      others.forEach((p) => {
        const a = document.createElement('a');
        a.href = `project.html?id=${encodeURIComponent(p.id)}`;
        a.className = 'flex gap-4 p-3 rounded-2xl bg-white dark:bg-navy-800 border border-slate-200 dark:border-navy-700 hover:border-accent transition no-underline text-inherit';
        a.innerHTML = `
          <div class="w-20 h-20 rounded-xl overflow-hidden bg-slate-200 dark:bg-navy-700 shrink-0">
            <img src="${p.gambar}" alt="${p.judul}" class="w-full h-full object-cover" onerror="this.src='https://via.placeholder.com/200x200/0f172a/22d3ee?text=P'" />
          </div>
          <div class="flex flex-col justify-center">
            <p class="text-xs text-slate-400 mb-1">${p.tanggal || ''}</p>
            <p class="font-semibold text-sm leading-snug">${p.judul}</p>
          </div>
        `;
        otherBox.appendChild(a);
      });
    }
  }

  if (window.FirebaseSync && window.FirebaseSync.ready()) {
    window.FirebaseSync.listen(FIREBASE_PATHS.projects, (data) => {
      if (Array.isArray(data)) {
        projects = data;
        localStorage.setItem(KEY, JSON.stringify(data));
        render();
      }
    });
    setTimeout(render, 800);
  } else {
    setTimeout(render, 250);
  }
})();