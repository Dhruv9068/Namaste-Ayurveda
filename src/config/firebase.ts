import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyDrPQXB08fRqc1Gx_iDHSzKxnasH-5yU6c",
  authDomain: "namaste-ayurveda.firebaseapp.com",
  projectId: "namaste-ayurveda",
  storageBucket: "namaste-ayurveda.firebasestorage.app",
  messagingSenderId: "330546716430",
  appId: "1:330546716430:web:4b948e67dd873c30a8415f",
  measurementId: "G-JJ07QE82TY"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const analytics = getAnalytics(app);
export default app;
