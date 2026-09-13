(async function () {
  if (!Auth.guard()) return;

  const session = Auth.session();
  const ownerNameEl = document.getElementById('ownerName');
  if (ownerNameEl && session) ownerNameEl.textContent = session.nama;

  document.getElementById('logoutBtn').addEventListener('click', () => {
    Auth.logout();
    window.location.href = 'login.html';
  });

  const KEYS = {
    badges: 'class_badges',
    projects: 'class_projects',
    siswa: 'class_siswa_overrides',
    walikelas: 'class_walikelas',
    jadwal: 'class_jadwal'
  };

  const WK_DEFAULT = {
    nama: 'Ibu Siti Rahayu, S.Pd.',
    jabatan: 'Wali Kelas 8B',
    foto: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&q=80',
    quote: 'Anak-anakku, kalian bukan cuma nomor absen di buku. Kalian adalah cerita yang sedang ditulis, halaman demi halaman.',
    tandaTangan: 'Siti Rahayu'
  };

  const JADWAL_DEFAULT = [
    { jam: '07:00 - 08:30', senin: 'Matematika', selasa: 'Fisika', rabu: 'Kimia', kamis: 'Biologi', jumat: 'B. Inggris', sabtu: 'Olahraga' },
    { jam: '08:30 - 10:00', senin: 'B. Indonesia', selasa: 'Matematika', rabu: 'Fisika', kamis: 'Kimia', jumat: 'Biologi', sabtu: 'Seni' },
    { jam: '10:15 - 11:45', senin: 'Sejarah', selasa: 'B. Inggris', rabu: 'Matematika', kamis: 'B. Indonesia', jumat: 'PKN', sabtu: 'Informatika' },
    { jam: '12:30 - 14:00', senin: 'Informatika', selasa: 'PKN', rabu: 'Sejarah', kamis: 'Olahraga', jumat: 'Agama', sabtu: '—' }
  ];

  const BADGE_COLORS = {
    cyan:    'bg-cyan-100 text-cyan-800 dark:bg-cyan-500/20 dark:text-cyan-300 border-cyan-300 dark:border-cyan-500/40',
    amber:   'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300 border-amber-300 dark:border-amber-500/40',
    rose:    'bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-300 border-rose-300 dark:border-rose-500/40',
    emerald: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 border-emerald-300 dark:border-emerald-500/40',
    violet:  'bg-violet-100 text-violet-800 dark:bg-violet-500/20 dark:text-violet-300 border-violet-300 dark:border-violet-500/40',
    slate:   'bg-slate-200 text-slate-800 dark:bg-slate-500/20 dark:text-slate-300 border-slate-300 dark:border-slate-500/40'
  };

  const PATH_MAP = {
    'class_badges': 'badges',
    'class_projects': 'projects',
    'class_siswa_overrides': 'siswa',
    'class_walikelas': 'walikelas',
    'class_jadwal': 'jadwal'
  };

  function load(key, fallback = {}) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) { return fallback; }
  }

  function save(key, val) {
    localStorage.setItem(key, JSON.stringify(val));
    const pathKey = PATH_MAP[key];
    if (pathKey && window.FirebaseSync && window.FirebaseSync.ready()) {
      window.FirebaseSync.write(FIREBASE_PATHS[pathKey], val).catch(function (err) {
        console.error('Firebase write error:', err);
        toast('Gagal sync ke server', 'error');
      });
    }
  }

  function removeKey(key) {
    localStorage.removeItem(key);
    const pathKey = PATH_MAP[key];
    if (pathKey && window.FirebaseSync && window.FirebaseSync.ready()) {
      window.FirebaseSync.remove(FIREBASE_PATHS[pathKey]).catch(function () {});
    }
  }

  let badges = load(KEYS.badges, {});
  let projects = load(KEYS.projects, []);
  let siswa = [];
  let jadwalData = load(KEYS.jadwal, []);
  if (!Array.isArray(jadwalData) || !jadwalData.length) jadwalData = JADWAL_DEFAULT.slice();

  let wkData = (function () {
    try {
      const raw = localStorage.getItem(KEYS.walikelas);
      return raw ? Object.assign({}, WK_DEFAULT, JSON.parse(raw)) : Object.assign({}, WK_DEFAULT);
    } catch (e) { return Object.assign({}, WK_DEFAULT); }
  })();

  function toast(msg, type = 'info') {
    const el = document.getElementById('toast');
    el.textContent = msg;
    const colors = { error: 'bg-red-600', success: 'bg-emerald-600', info: 'bg-navy-800' };
    el.className = 'fixed bottom-6 right-6 px-5 py-3 rounded-xl shadow-2xl transition-all duration-300 z-50 text-white ' + (colors[type] || colors.info) + ' opacity-0 translate-y-4';
    requestAnimationFrame(function () { el.classList.remove('opacity-0', 'translate-y-4'); });
    setTimeout(function () { el.classList.add('opacity-0', 'translate-y-4'); }, 2200);
  }

  try {
    const overrides = localStorage.getItem(KEYS.siswa);
    if (overrides) {
      siswa = JSON.parse(overrides);
    } else {
      const res = await fetch('data/anggota.json');
      siswa = await res.json();
    }
  } catch (e) {
    toast('Gagal memuat data siswa', 'error');
  }

  function persistSiswa() { save(KEYS.siswa, siswa); }

  function updateStats() {
    document.getElementById('statSiswa').textContent = siswa.length;
    document.getElementById('statBadge').textContent = Object.keys(badges).length;
    document.getElementById('statAssigned').textContent = siswa.filter(function (s) { return s.badge; }).length;
    document.getElementById('statProject').textContent = projects.length;
  }

  const tabBtns = document.querySelectorAll('.tab-btn');
  const panels = {
    badges: document.getElementById('tab-badges'),
    projects: document.getElementById('tab-projects'),
    siswa: document.getElementById('tab-siswa'),
    jadwal: document.getElementById('tab-jadwal'),
    walikelas: document.getElementById('tab-walikelas'),
    data: document.getElementById('tab-data')
  };

  function activateTab(name) {
    Object.values(panels).forEach(function (p) { p.classList.add('hidden'); });
    panels[name].classList.remove('hidden');
    tabBtns.forEach(function (b) { b.classList.toggle('tab-active', b.dataset.tab === name); });
  }
  tabBtns.forEach(function (b) { b.addEventListener('click', function () { activateTab(b.dataset.tab); }); });
  activateTab('badges');

  function renderBadgePalette() {
    const palette = document.getElementById('badgePalette');
    palette.innerHTML = '';
    const keys = Object.keys(badges);
    if (!keys.length) {
      palette.innerHTML = '<p class="text-sm text-slate-400">Belum ada badge. Buat yang pertama di atas.</p>';
      return;
    }
    keys.forEach(function (label) {
      const b = badges[label];
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'group inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium transition hover:scale-105 ' + (BADGE_COLORS[b.color] || BADGE_COLORS.cyan);
      chip.innerHTML = '<span>' + label + '</span><span class="text-xs opacity-60 group-hover:opacity-100">×</span>';
      chip.title = 'Klik untuk hapus dari semua siswa';
      chip.addEventListener('click', function () {
        if (!confirm('Hapus badge "' + label + '" dari semua siswa?')) return;
        delete badges[label];
        siswa.forEach(function (s) { if (s.badge === label) delete s.badge; });
        save(KEYS.badges, badges);
        persistSiswa();
        renderBadgePalette();
        renderSiswaBadge();
        updateStats();
        toast('Badge "' + label + '" dihapus', 'success');
      });
      palette.appendChild(chip);
    });
  }

  document.getElementById('addBadgeBtn').addEventListener('click', function () {
    const input = document.getElementById('badgeLabel');
    const colorSel = document.getElementById('badgeColor');
    const label = input.value.trim();
    if (!label) return toast('Nama badge tidak boleh kosong', 'error');
    if (badges[label]) return toast('Badge itu sudah ada', 'error');
    badges[label] = { color: colorSel.value };
    save(KEYS.badges, badges);
    input.value = '';
    renderBadgePalette();
    renderSiswaBadge();
    updateStats();
    toast('Badge "' + label + '" dibuat', 'success');
  });

  const searchBadge = document.getElementById('searchSiswaBadge');
  const listBadge = document.getElementById('siswaListBadge');

  function renderSiswaBadge() {
    const q = searchBadge.value.toLowerCase().trim();
    const filtered = siswa.filter(function (s) { return s.nama.toLowerCase().includes(q); });
    listBadge.innerHTML = '';
    if (!filtered.length) {
      listBadge.innerHTML = '<p class="text-center text-slate-400 py-10">Tidak ada siswa.</p>';
      return;
    }
    filtered.forEach(function (s) {
      const badgeDef = s.badge ? badges[s.badge] : null;
      const activeHtml = (s.badge && badgeDef)
        ? '<span class="inline-flex items-center gap-1 px-3 py-1 rounded-full border text-xs font-medium badge-pop ' + (BADGE_COLORS[badgeDef.color] || BADGE_COLORS.cyan) + '">' + s.badge + '</span>'
        : '<span class="text-xs text-slate-400 italic">Belum punya badge</span>';

      const paletteHtml = Object.keys(badges).map(function (label) {
        const b = badges[label];
        const isActive = s.badge === label;
        return '<button data-siswa="' + s.nama + '" data-badge="' + label + '" class="badge-toggle px-3 py-1 rounded-full border text-xs font-medium transition hover:scale-105 ' + (BADGE_COLORS[b.color] || BADGE_COLORS.cyan) + ' ' + (isActive ? 'ring-2 ring-offset-2 ring-accent dark:ring-offset-navy-800' : 'opacity-70') + '">' + label + '</button>';
      }).join('');

      const card = document.createElement('div');
      card.className = 'p-5 rounded-2xl bg-white dark:bg-navy-800 border border-slate-200 dark:border-navy-700';
      card.innerHTML =
        '<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">' +
          '<div class="flex items-center gap-4">' +
            '<div class="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold">' + s.nama.charAt(0) + '</div>' +
            '<div>' +
              '<h3 class="font-bold">' + s.nama + '</h3>' +
              '<p class="text-xs text-slate-500 dark:text-slate-400">' + s.jabatan + '</p>' +
            '</div>' +
          '</div>' +
          '<div class="flex flex-wrap gap-2">' + activeHtml + '</div>' +
        '</div>' +
        '<div class="mt-4 pt-4 border-t border-slate-200 dark:border-navy-700">' +
          '<p class="text-xs uppercase tracking-wider text-slate-400 mb-2">Pasang badge</p>' +
          '<div class="flex flex-wrap gap-2">' + (paletteHtml || '<span class="text-xs text-slate-400">Belum ada badge.</span>') + '</div>' +
        '</div>';
      listBadge.appendChild(card);
    });

    listBadge.querySelectorAll('.badge-toggle').forEach(function (btn) {
      btn.addEventListener('click', function () {
        const nama = btn.dataset.siswa;
        const label = btn.dataset.badge;
        const s = siswa.find(function (x) { return x.nama === nama; });
        if (!s) return;
        if (s.badge === label) {
          delete s.badge;
          toast('Badge "' + label + '" dilepas dari ' + nama, 'info');
        } else {
          s.badge = label;
          toast('Badge "' + label + '" → ' + nama, 'success');
        }
        persistSiswa();
        renderSiswaBadge();
        renderSiswaEdit();
        updateStats();
      });
    });
  }
  searchBadge.addEventListener('input', renderSiswaBadge);

  const projJudul = document.getElementById('projJudul');
  const projTag = document.getElementById('projTag');
  const projTanggal = document.getElementById('projTanggal');
  const projGambar = document.getElementById('projGambar');
  const projDeskripsi = document.getElementById('projDeskripsi');
  const projFile = document.getElementById('projFile');
  const projPreview = document.getElementById('projPreview');
  const projPreviewImg = document.getElementById('projPreviewImg');
  const projectsList = document.getElementById('projectsList');

  projGambar.addEventListener('input', function () {
    if (projGambar.value.trim()) {
      projPreviewImg.src = projGambar.value.trim();
      projPreview.classList.remove('hidden');
    } else {
      projPreview.classList.add('hidden');
    }
  });

  projFile.addEventListener('change', function () {
    const file = projFile.files[0];
    if (!file) return;
    if (file.size > 800 * 1024) {
      toast('Gambar terlalu besar (maks 800KB)', 'error');
      projFile.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = function (e) {
      projGambar.value = e.target.result;
      projPreviewImg.src = e.target.result;
      projPreview.classList.remove('hidden');
    };
    reader.readAsDataURL(file);
  });

  document.getElementById('addProjectBtn').addEventListener('click', function () {
    const judul = projJudul.value.trim();
    const deskripsi = projDeskripsi.value.trim();
    const gambar = projGambar.value.trim();
    if (!judul || !deskripsi || !gambar) return toast('Judul, deskripsi, gambar wajib diisi', 'error');
    if (projects.length >= 3) return toast('Maksimal 3 project', 'error');
    projects.push({
      id: 'p' + Date.now(),
      judul: judul, deskripsi: deskripsi, gambar: gambar,
      tag: projTag.value.trim(),
      tanggal: projTanggal.value.trim()
    });
    save(KEYS.projects, projects);
    projJudul.value = projTag.value = projTanggal.value = projGambar.value = projDeskripsi.value = '';
    projFile.value = '';
    projPreview.classList.add('hidden');
    renderProjects();
    updateStats();
    toast('Project ditambahkan', 'success');
  });

  function renderProjects() {
    projectsList.innerHTML = '';
    if (!projects.length) {
      projectsList.innerHTML = '<p class="text-center text-slate-400 py-10 col-span-full">Belum ada project.</p>';
      return;
    }
    projects.forEach(function (p) {
      const card = document.createElement('div');
      card.className = 'rounded-2xl overflow-hidden bg-white dark:bg-navy-800 border border-slate-200 dark:border-navy-700 flex flex-col';
      card.innerHTML =
        '<div class="aspect-[4/3] bg-slate-200 dark:bg-navy-700 overflow-hidden">' +
          '<img src="' + p.gambar + '" alt="' + p.judul + '" class="w-full h-full object-cover" onerror="this.src=\'https://via.placeholder.com/800x600/0f172a/22d3ee?text=Project\'" />' +
        '</div>' +
        '<div class="p-4 flex flex-col flex-1">' +
          (p.tag ? '<span class="text-xs text-accent font-semibold mb-1">' + p.tag + '</span>' : '') +
          '<h3 class="font-bold mb-1">' + p.judul + '</h3>' +
          '<p class="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 flex-1">' + p.deskripsi + '</p>' +
          '<button data-id="' + p.id + '" class="delete-proj mt-3 px-3 py-1.5 rounded-lg border border-red-300 dark:border-red-900/50 text-red-500 text-xs font-semibold hover:bg-red-500 hover:text-white transition self-start">Hapus</button>' +
        '</div>';
      projectsList.appendChild(card);
    });
    projectsList.querySelectorAll('.delete-proj').forEach(function (btn) {
      btn.addEventListener('click', function () {
        const id = btn.dataset.id;
        projects = projects.filter(function (p) { return p.id !== id; });
        save(KEYS.projects, projects);
        renderProjects();
        updateStats();
        toast('Project dihapus', 'info');
      });
    });
  }

  const searchEdit = document.getElementById('searchSiswaEdit');
  const listEdit = document.getElementById('siswaListEdit');

  function renderSiswaEdit() {
    const q = searchEdit.value.toLowerCase().trim();
    const filtered = siswa.filter(function (s) { return s.nama.toLowerCase().includes(q); });
    listEdit.innerHTML = '';
    if (!filtered.length) {
      listEdit.innerHTML = '<p class="text-center text-slate-400 py-10">Tidak ada siswa.</p>';
      return;
    }
    filtered.forEach(function (s) {
      const realIdx = siswa.indexOf(s);
      const card = document.createElement('div');
      card.className = 'p-5 rounded-2xl bg-white dark:bg-navy-800 border border-slate-200 dark:border-navy-700';
      card.innerHTML =
        '<div class="grid sm:grid-cols-2 gap-3">' +
          '<input data-idx="' + realIdx + '" data-field="nama" value="' + s.nama + '" class="edit-field px-4 py-2.5 rounded-xl border border-slate-300 dark:border-navy-700 bg-white dark:bg-navy-900 text-sm focus:outline-none focus:ring-2 focus:ring-accent" />' +
          '<input data-idx="' + realIdx + '" data-field="jabatan" value="' + s.jabatan + '" class="edit-field px-4 py-2.5 rounded-xl border border-slate-300 dark:border-navy-700 bg-white dark:bg-navy-900 text-sm focus:outline-none focus:ring-2 focus:ring-accent" />' +
          '<input data-idx="' + realIdx + '" data-field="kelas" value="' + (s.kelas || '') + '" class="edit-field px-4 py-2.5 rounded-xl border border-slate-300 dark:border-navy-700 bg-white dark:bg-navy-900 text-sm focus:outline-none focus:ring-2 focus:ring-accent" />' +
          '<input data-idx="' + realIdx + '" data-field="hobi" value="' + (s.hobi || '') + '" class="edit-field px-4 py-2.5 rounded-xl border border-slate-300 dark:border-navy-700 bg-white dark:bg-navy-900 text-sm focus:outline-none focus:ring-2 focus:ring-accent" />' +
          '<textarea data-idx="' + realIdx + '" data-field="deskripsi" rows="2" class="edit-field sm:col-span-2 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-navy-700 bg-white dark:bg-navy-900 text-sm focus:outline-none focus:ring-2 focus:ring-accent">' + (s.deskripsi || '') + '</textarea>' +
        '</div>';
      listEdit.appendChild(card);
    });
    listEdit.querySelectorAll('.edit-field').forEach(function (el) {
      el.addEventListener('change', function () {
        const idx = Number(el.dataset.idx);
        const field = el.dataset.field;
        siswa[idx][field] = el.value;
        persistSiswa();
        toast('Perubahan disimpan', 'success');
      });
    });
  }
  searchEdit.addEventListener('input', renderSiswaEdit);

  function renderJadwalEdit() {
    const tbody = document.getElementById('jadwalEditBody');
    if (!tbody) return;
    tbody.innerHTML = '';
    if (!jadwalData.length) {
      tbody.innerHTML = '<tr><td colspan="8" class="p-4 text-center text-slate-400">Belum ada jadwal. Klik "+ Baris Baru".</td></tr>';
      return;
    }
    const fields = ['jam', 'senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu'];
    jadwalData.forEach(function (row, i) {
      const tr = document.createElement('tr');
      tr.className = i % 2 === 0 ? 'bg-white dark:bg-navy-800' : 'bg-slate-50 dark:bg-navy-900/60';
      tr.innerHTML = fields.map(function (f) {
        return '<td class="p-1"><input data-idx="' + i + '" data-field="' + f + '" value="' + (row[f] || '') + '" class="jadwal-input w-full px-2 py-1.5 rounded-lg border border-slate-300 dark:border-navy-700 bg-white dark:bg-navy-900 text-xs focus:outline-none focus:ring-2 focus:ring-accent" /></td>';
      }).join('') + '<td class="p-1"><button data-idx="' + i + '" class="jadwal-del px-2 py-1 rounded-lg border border-red-300 dark:border-red-900/50 text-red-500 text-xs hover:bg-red-500 hover:text-white transition">×</button></td>';
      tbody.appendChild(tr);
    });

    tbody.querySelectorAll('.jadwal-input').forEach(function (inp) {
      inp.addEventListener('change', function () {
        const idx = Number(inp.dataset.idx);
        const field = inp.dataset.field;
        jadwalData[idx][field] = inp.value.trim();
        save(KEYS.jadwal, jadwalData);
        toast('Jadwal disimpan', 'success');
      });
    });

    tbody.querySelectorAll('.jadwal-del').forEach(function (btn) {
      btn.addEventListener('click', function () {
        const idx = Number(btn.dataset.idx);
        jadwalData.splice(idx, 1);
        save(KEYS.jadwal, jadwalData);
        renderJadwalEdit();
        toast('Baris dihapus', 'info');
      });
    });
  }

  document.getElementById('jadwalAddBtn').addEventListener('click', function () {
    jadwalData.push({ jam: '', senin: '', selasa: '', rabu: '', kamis: '', jumat: '', sabtu: '' });
    save(KEYS.jadwal, jadwalData);
    renderJadwalEdit();
    toast('Baris baru ditambahkan', 'success');
  });

  document.getElementById('jadwalResetBtn').addEventListener('click', function () {
    if (!confirm('Reset jadwal ke default?')) return;
    jadwalData = JADWAL_DEFAULT.slice();
    save(KEYS.jadwal, jadwalData);
    renderJadwalEdit();
    toast('Jadwal direset', 'info');
  });

  function renderWK() {
    document.getElementById('wkNamaInput').value = wkData.nama;
    document.getElementById('wkJabatanInput').value = wkData.jabatan;
    document.getElementById('wkQuoteInput').value = wkData.quote;
    document.getElementById('wkTtdInput').value = wkData.tandaTangan;
    document.getElementById('wkFotoUrl').value = wkData.foto.startsWith('data:') ? '' : wkData.foto;
    document.getElementById('wkPreview').src = wkData.foto;
  }

  document.getElementById('wkFotoUrl').addEventListener('input', function (e) {
    if (e.target.value.trim()) document.getElementById('wkPreview').src = e.target.value.trim();
  });

  document.getElementById('wkFotoFile').addEventListener('change', function (e) {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 800 * 1024) {
      toast('Foto terlalu besar (maks 800KB)', 'error');
      e.target.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = function (ev) {
      wkData.foto = ev.target.result;
      document.getElementById('wkPreview').src = ev.target.result;
      document.getElementById('wkFotoUrl').value = '';
    };
    reader.readAsDataURL(file);
  });

  document.getElementById('wkSaveBtn').addEventListener('click', function () {
    const urlVal = document.getElementById('wkFotoUrl').value.trim();
    if (urlVal) wkData.foto = urlVal;
    wkData.nama = document.getElementById('wkNamaInput').value.trim() || WK_DEFAULT.nama;
    wkData.jabatan = document.getElementById('wkJabatanInput').value.trim() || WK_DEFAULT.jabatan;
    wkData.quote = document.getElementById('wkQuoteInput').value.trim() || WK_DEFAULT.quote;
    wkData.tandaTangan = document.getElementById('wkTtdInput').value.trim() || WK_DEFAULT.tandaTangan;
    save(KEYS.walikelas, wkData);
    toast('Profil wali kelas disimpan', 'success');
  });

  document.getElementById('wkResetBtn').addEventListener('click', function () {
    if (!confirm('Reset profil wali kelas ke default?')) return;
    wkData = Object.assign({}, WK_DEFAULT);
    save(KEYS.walikelas, wkData);
    renderWK();
    toast('Profil wali kelas direset', 'info');
  });

  document.getElementById('exportBtn').addEventListener('click', function () {
    const payload = {
      exportedAt: new Date().toISOString(),
      badges: badges,
      projects: projects,
      siswa: siswa,
      walikelas: wkData,
      jadwal: jadwalData
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'kelas-8b-data-' + Date.now() + '.json';
    a.click();
    URL.revokeObjectURL(url);
    toast('Data diexport', 'success');
  });

  document.getElementById('importFile').addEventListener('change', function (e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function (ev) {
      try {
        const data = JSON.parse(ev.target.result);
        if (data.badges) { badges = data.badges; save(KEYS.badges, badges); }
        if (data.projects) { projects = data.projects; save(KEYS.projects, projects); }
        if (data.siswa) { siswa = data.siswa; persistSiswa(); }
        if (data.walikelas) { wkData = Object.assign({}, WK_DEFAULT, data.walikelas); save(KEYS.walikelas, wkData); }
        if (data.jadwal) { jadwalData = data.jadwal; save(KEYS.jadwal, jadwalData); }
        renderBadgePalette();
        renderSiswaBadge();
        renderProjects();
        renderSiswaEdit();
        renderJadwalEdit();
        renderWK();
        updateStats();
        toast('Data diimport', 'success');
      } catch (err) {
        toast('File JSON tidak valid', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  });

  document.getElementById('resetBtn').addEventListener('click', function () {
    if (!confirm('Yakin reset semua data? Tidak bisa dibatalkan.')) return;
    removeKey(KEYS.badges);
    removeKey(KEYS.projects);
    removeKey(KEYS.siswa);
    removeKey(KEYS.walikelas);
    removeKey(KEYS.jadwal);
    badges = {};
    projects = [];
    siswa = [];
    wkData = Object.assign({}, WK_DEFAULT);
    jadwalData = JADWAL_DEFAULT.slice();
    renderBadgePalette();
    renderSiswaBadge();
    renderProjects();
    renderSiswaEdit();
    renderJadwalEdit();
    renderWK();
    updateStats();
    toast('Semua data direset', 'info');
  });

  renderBadgePalette();
  renderSiswaBadge();
  renderProjects();
  renderSiswaEdit();
  renderJadwalEdit();
  renderWK();
  updateStats();

  if (window.FirebaseSync && window.FirebaseSync.ready()) {
    window.FirebaseSync.listen(FIREBASE_PATHS.badges, function (data) {
      if (data) { badges = data; localStorage.setItem(KEYS.badges, JSON.stringify(data)); renderBadgePalette(); renderSiswaBadge(); updateStats(); }
    });
    window.FirebaseSync.listen(FIREBASE_PATHS.projects, function (data) {
      if (Array.isArray(data)) { projects = data; localStorage.setItem(KEYS.projects, JSON.stringify(data)); renderProjects(); updateStats(); }
    });
    window.FirebaseSync.listen(FIREBASE_PATHS.siswa, function (data) {
      if (Array.isArray(data)) { siswa = data; localStorage.setItem(KEYS.siswa, JSON.stringify(data)); renderSiswaBadge(); renderSiswaEdit(); updateStats(); }
    });
    window.FirebaseSync.listen(FIREBASE_PATHS.jadwal, function (data) {
      if (Array.isArray(data)) { jadwalData = data; localStorage.setItem(KEYS.jadwal, JSON.stringify(data)); renderJadwalEdit(); }
    });
    window.FirebaseSync.listen(FIREBASE_PATHS.walikelas, function (data) {
      if (data) { wkData = Object.assign({}, WK_DEFAULT, data); localStorage.setItem(KEYS.walikelas, JSON.stringify(wkData)); renderWK(); }
    });
  }
})();