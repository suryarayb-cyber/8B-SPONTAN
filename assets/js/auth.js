(function () {
  const OWNER = { nama: 'Avara', pw: 'AVARA123AA' };
  const KEY = 'owner_session';

  window.Auth = {
    login(nama, pw) {
      if (nama === OWNER.nama && pw === OWNER.pw) {
        const session = {
          nama: OWNER.nama,
          token: btoa(OWNER.nama + ':' + Date.now()),
          loginAt: Date.now()
        };
        localStorage.setItem(KEY, JSON.stringify(session));
        return true;
      }
      return false;
    },
    logout() {
      localStorage.removeItem(KEY);
    },
    session() {
      try {
        return JSON.parse(localStorage.getItem(KEY) || 'null');
      } catch {
        return null;
      }
    },
    isOwner() {
      const s = this.session();
      if (!s) return false;
      const maxAge = 1000 * 60 * 60 * 8;
      if (Date.now() - s.loginAt > maxAge) {
        this.logout();
        return false;
      }
      return true;
    },
    guard() {
      if (!this.isOwner()) {
        window.location.href = 'login.html';
        return false;
      }
      return true;
    }
  };
})();