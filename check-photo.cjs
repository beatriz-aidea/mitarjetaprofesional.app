const { initializeApp } = require('firebase/app');
const { getFirestore, doc, getDoc } = require('firebase/firestore');
const fs = require('fs');

const firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function checkPhoto() {
  const docSnap = await getDoc(doc(db, "perfiles", "gdow4rsx5ztj"));
  if (docSnap.exists()) {
    const data = docSnap.data();
    if (data.photo) {
      console.log("Photo size:", data.photo.length);
    } else {
      console.log("No photo");
    }
  }
}

checkPhoto();
