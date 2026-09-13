(function () {
  let db = null;
  let initialized = false;

  function init() {
    if (initialized) return db;

    if (typeof window.FIREBASE_CONFIG === 'undefined') {
      console.warn('[Firebase] config belum ke-load');
      return null;
    }

    if (typeof window.FIREBASE_ENABLED !== 'undefined' && !window.FIREBASE_ENABLED) {
      console.info('[Firebase] nonaktif (config placeholder). Pakai localStorage.');
      return null;
    }

    if (typeof firebase === 'undefined') {
      console.warn('[Firebase] SDK belum ke-load');
      return null;
    }

    try {
      if (!firebase.apps.length) {
        firebase.initializeApp(window.FIREBASE_CONFIG);
      }
      db = firebase.database();
      initialized = true;
      console.info('[Firebase] siap.');
      return db;
    } catch (err) {
      console.error('[Firebase] init error:', err);
      return null;
    }
  }

  window.FirebaseSync = {
    ready: function () {
      return !!init();
    },
    listen: function (path, callback) {
      const database = init();
      if (!database) return function () {};
      const ref = database.ref(path);
      const handler = function (snapshot) {
        callback(snapshot.val());
      };
      ref.on('value', handler, function (err) {
        console.warn('[Firebase] listen error:', err);
      });
      return function () { ref.off('value', handler); };
    },
    write: function (path, data) {
      const database = init();
      if (!database) return Promise.reject('Firebase belum siap');
      return database.ref(path).set(data);
    },
    remove: function (path) {
      const database = init();
      if (!database) return Promise.reject('Firebase belum siap');
      return database.ref(path).remove();
    }
  };

  console.info('[FirebaseSync] loaded.');
})();