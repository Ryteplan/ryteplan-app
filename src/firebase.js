import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

export const firebaseApp = initializeApp({
  apiKey: "AIzaSyArmaIMqQveUnRimtLUb8nFZNNvzqVjFfk",
  authDomain: "college-counselo-1692637185845.firebaseapp.com",
  projectId: "college-counselo-1692637185845",
  storageBucket: "college-counselo-1692637185845.appspot.com",
  messagingSenderId: "304990071110",
  appId: "1:304990071110:web:837f224817c85feb7d5d47",
  measurementId: "G-N15EGVJW30"
})

export const dbFireStore = getFirestore(firebaseApp);
