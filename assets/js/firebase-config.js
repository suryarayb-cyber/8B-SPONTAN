const FIREBASE_CONFIG = {
  apiKey: "AIzaSyA76soOK3KI09FLJKBO8RfILNZa4vUEapI",
  authDomain: "kelas-viib.firebaseapp.com",
  databaseURL: "https://kelas-viib-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "kelas-viib",
  storageBucket: "kelas-viib.firebasestorage.app",
  messagingSenderId: "334129678338",
  appId: "1:334129678338:web:a2da92c2497544d7363f1b",
  measurementId: "G-R7SY8QF1J4"
};

const FIREBASE_PATHS = {
  badges: 'kelas/badges',
  projects: 'kelas/projects',
  siswa: 'kelas/siswa',
  walikelas: 'kelas/walikelas',
  jadwal: 'kelas/jadwal'
};

const FIREBASE_ENABLED = true;

window.FIREBASE_CONFIG = FIREBASE_CONFIG;
window.FIREBASE_PATHS = FIREBASE_PATHS;
window.FIREBASE_ENABLED = FIREBASE_ENABLED;