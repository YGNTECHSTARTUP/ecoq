// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  "projectId": "studio-4138116741-823dc",
  "appId": "1:10602876888:web:e4d0a201e6b6067c93ecad",
  "storageBucket": "studio-4138116741-823dc.firebasestorage.app",
  "apiKey": "AIzaSyAJIs68xfSeokOJJKYXtwS3Y64Tzxi3ITY",
  "authDomain": "studio-4138116741-823dc.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "10602876888"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);