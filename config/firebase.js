
import AsyncStorage from "@react-native-async-storage/async-storage";
import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_APIKEY,
  authDomain:process.env.EXPO_PUBLIC_AUTHDOMAIN,
  databaseURL:process.env.EXPO_PUBLIC_DATABASEURL,
  projectId: process.env.EXPO_PUBLIC_PROJECTID,
  storageBucket:process.env.EXPO_PUBLIC_STORAGEBUCKET,
  messagingSenderId:process.env.EXPO_PUBLIC_MESSAGINGSENDERID,
  appId: process.env.EXPO_PUBLIC_APPID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app,{persistence:getReactNativePersistence(AsyncStorage)});

export const db = getFirestore(app); 