(function () {
  const form = document.getElementById('kontakForm');
  if (!form) return;
  const status = document.getElementById('formStatus');

  function showError(field, show) {
    const el = document.querySelector(`[data-error="${field}"]`);
    if (el) el.classList.toggle('hidden', !show);
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const nama = form.nama.value.trim();
    const email = form.email.value.trim();
    const pesan = form.pesan.value.trim();

    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const namaOk = nama.length >= 3;
    const pesanOk = pesan.length >= 10;

    showError('nama', !namaOk);
    showError('email', !emailOk);
    showError('pesan', !pesanOk);

    if (namaOk && emailOk && pesanOk) {
      status.textContent = 'Pesan berhasil dikirim. Terima kasih, ' + nama + '!';
      status.className = 'text-sm text-center text-green-600 dark:text-green-400';
      status.classList.remove('hidden');
      form.reset();
      setTimeout(() => status.classList.add('hidden'), 4000);
    } else {
      status.textContent = 'Periksa kembali form kamu.';
      status.className = 'text-sm text-center text-red-500';
      status.classList.remove('hidden');
    }
  });
})();