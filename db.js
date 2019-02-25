import firebase from 'firebase'
import 'firebase/firestore'
var config = {
  apiKey: "AIzaSyCH08S-lqPkekz42LtKKFJPTrKIfyJ0QTk",
  authDomain: "cp4210-221812.firebaseapp.com",
  databaseURL: "https://cp4210-221812.firebaseio.com",
  projectId: "cp4210-221812",
  storageBucket: "cp4210-221812.appspot.com",
  messagingSenderId: "665113206146"
};
firebase.initializeApp(config);

// Initialize Cloud Firestore through Firebase
var db = firebase.firestore();

// Disable deprecated features
db.settings({
  timestampsInSnapshots: true
});

export default db