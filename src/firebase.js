import { initializeApp } from 'firebase/app'
// import { getFirestore } from 'firebase/firestore'
import { getDatabase } from 'firebase/database'
import { ref as dbRef } from "firebase/database";
// import * as firebase from "firebase/app";

export const firebaseApp = initializeApp({
  apiKey: "AIzaSyArmaIMqQveUnRimtLUb8nFZNNvzqVjFfk",
  authDomain: "college-counselo-1692637185845.firebaseapp.com",
  projectId: "college-counselo-1692637185845",
  storageBucket: "college-counselo-1692637185845.appspot.com",
  messagingSenderId: "304990071110",
  appId: "1:304990071110:web:837f224817c85feb7d5d47",
  measurementId: "G-N15EGVJW30"
})

// used for the databas refs
const db = getDatabase(firebaseApp)

// here we can export reusable database references
export const institutionsRef = dbRef(db, 'institutions')