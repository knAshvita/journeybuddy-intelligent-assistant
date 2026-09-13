import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCFPiXD85Gy4PkrJ4QrCwmCfVmBhMyztSE",
  authDomain: "journeybuddy-app.firebaseapp.com",
  projectId: "journeybuddy-app",
  storageBucket: "journeybuddy-app.firebasestorage.app",
  messagingSenderId: "394460372790",
  appId: "1:394460372790:web:2c940837acbd1bb0815d97",
};

// Initialize Firebase App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export default app;