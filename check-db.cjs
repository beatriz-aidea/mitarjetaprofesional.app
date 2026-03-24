const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, getDoc } = require('firebase/firestore');
const fs = require('fs');

const firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function checkDb() {
  const querySnapshot = await getDocs(collection(db, "perfiles"));
  console.log("Total profiles:", querySnapshot.size);
  querySnapshot.forEach((doc) => {
    console.log(doc.id, " => ", Object.keys(doc.data()));
  });
}

checkDb();
