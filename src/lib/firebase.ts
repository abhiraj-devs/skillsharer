import { initializeApp, getApps, FirebaseOptions } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig: FirebaseOptions = {
  projectId: "studenthub-yfnf9",
  appId: "1:230995809521:web:38b60a169495a454158550",
  storageBucket: "studenthub-yfnf9.appspot.com",
  apiKey: "AIzaSyCdzPvOrXV_ZsIVqCQZNrDCyOonYBAoyxs",
  authDomain: "studenthub-yfnf9.firebaseapp.com",
  messagingSenderId: "230995809521",
};

// Initialize Firebase
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
