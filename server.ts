import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { customAlphabet } from "nanoid";
import dotenv from "dotenv";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import fs from "fs";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const generatePublicId = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 12);

// Initialize Firebase Client SDK
let db: any;
try {
  const configPath = path.join(__dirname, 'firebase-applet-config.json');
  if (fs.existsSync(configPath)) {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    const app = initializeApp(config);
    
    db = getFirestore(app, config.firestoreDatabaseId);
    
    console.log("Firebase Client SDK initialized successfully.");
  } else {
    console.error("firebase-applet-config.json not found.");
  }
} catch (error) {
  console.error("Failed to initialize Firebase Client SDK:", error);
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", env: process.env.NODE_ENV });
  });

  // API endpoint to create or update a profile
  app.post("/api/perfil", async (req, res) => {
    try {
      if (!db) throw new Error("Database not initialized");
      
      const formData = req.body;
      const { public_id: existingPublicId, ...profileData } = formData;
      
      // Clean formData to remove empty strings and undefined values
      const cleanFormData = Object.fromEntries(
        Object.entries(profileData).filter(([k, v]) => v !== '' && v !== null && v !== undefined)
      );

      let public_id = existingPublicId;

      if (public_id) {
        // Update existing
        const docRef = doc(db, 'perfiles', public_id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          await updateDoc(docRef, cleanFormData);
        } else {
          // If it doesn't exist, create it with this ID
          await setDoc(docRef, { ...cleanFormData, public_id });
        }
      } else {
        // Create new
        public_id = generatePublicId();
        const docRef = doc(db, 'perfiles', public_id);
        await setDoc(docRef, { ...cleanFormData, public_id });
      }

      // Construct final URL
      const baseUrl = process.env.APP_URL || process.env.PUBLIC_BASE_URL || `${req.protocol}://${req.get('host')}`;
      const landing_url = `${baseUrl}/${public_id}`;

      // Return response
      res.json({
        public_id,
        landing_url
      });
    } catch (error: any) {
      console.error("Error creating profile in Firebase:", error);
      res.status(500).json({ error: "Failed to create profile", details: error.message || error });
    }
  });

  // API endpoint to get a profile by public_id
  app.get("/api/perfil/:public_id", async (req, res) => {
    try {
      if (!db) throw new Error("Database not initialized");
      
      const { public_id } = req.params;
      const docRef = doc(db, 'perfiles', public_id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return res.status(404).json({ error: "Profile not found" });
      }

      res.json(docSnap.data());
    } catch (error) {
      console.error("Error fetching profile from Firebase:", error);
      res.status(500).json({ error: "Failed to fetch profile" });
    }
  });

  // API endpoint to download vCard directly
  app.get("/api/perfil/:public_id/vcard", async (req, res) => {
    try {
      if (!db) throw new Error("Database not initialized");
      
      const { public_id } = req.params;
      const docRef = doc(db, 'perfiles', public_id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return res.status(404).json({ error: "Profile not found" });
      }

      const data: any = docSnap.data();

      // Generate vCard string
      const relationshipContext = data.relationship ? `Conocido por: ${data.relationship}` : '';
      const userNoteContext = data.customNote ? `Recuérdame: ${data.customNote}` : '';
      const combinedNotes = [relationshipContext, userNoteContext].filter(Boolean).join(' | ');

      const fullPhoneWork = data.phoneWork ? `${data.phoneWorkPrefix || ''}${data.phoneWork.replace(/\\s+/g, '')}` : '';
      const fullPhoneMobile = data.phoneMobile ? `${data.phoneMobilePrefix || ''}${data.phoneMobile.replace(/\\s+/g, '')}` : '';

      const addressParts = [data.street, data.city, data.state, data.zip, data.country].filter(Boolean);
      const addressString = addressParts.join(', ');
      const mapsUrl = addressString ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressString)}` : '';

      const escapeVCardText = (text: string) => {
        if (!text) return '';
        return text.replace(/,/g, '\\,').replace(/;/g, '\\;').replace(/\n/g, '\\n');
      };

      const formatUrl = (url: string) => {
        if (!url) return '';
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
          return `https://${url}`;
        }
        return url;
      };

      const lines = [
        'BEGIN:VCARD',
        'VERSION:3.0',
        `N:${escapeVCardText(data.lastName || '')};${escapeVCardText(data.firstName || '')};;;`,
        `FN:${escapeVCardText(data.firstName || '')} ${escapeVCardText(data.lastName || '')}`,
        data.organization ? `ORG:${escapeVCardText(data.organization)}` : '',
        data.title ? `TITLE:${escapeVCardText(data.title)}` : '',
        data.email ? `EMAIL;TYPE=INTERNET,WORK:${data.email}` : '',
        data.url ? `URL;TYPE=WORK:${formatUrl(data.url)}` : '',
        fullPhoneWork ? `TEL;TYPE=WORK,VOICE:${fullPhoneWork}` : '',
        fullPhoneMobile ? `TEL;TYPE=CELL,VOICE:${fullPhoneMobile}` : '',
        data.street || data.city || data.state || data.zip || data.country ? `ADR;TYPE=WORK:;;${escapeVCardText(data.street || '')};${escapeVCardText(data.city || '')};${escapeVCardText(data.state || '')};${escapeVCardText(data.zip || '')};${escapeVCardText(data.country || '')}` : '',
        mapsUrl ? `item1.URL:${mapsUrl}` : '',
        mapsUrl ? `item1.X-ABLabel:Como llegar` : '',
        data.linkedin ? `X-SOCIALPROFILE;TYPE=linkedin:${formatUrl(data.linkedin)}` : '',
        data.instagram ? `X-SOCIALPROFILE;TYPE=instagram:${formatUrl(data.instagram)}` : '',
        data.x ? `X-SOCIALPROFILE;TYPE=twitter:${formatUrl(data.x)}` : '',
        data.tiktok ? `X-SOCIALPROFILE;TYPE=tiktok:${formatUrl(data.tiktok)}` : '',
        data.photo ? `PHOTO;VALUE=URI:${data.photo}` : '',
        data.public_id ? `UID:${data.public_id}` : '',
        combinedNotes ? `NOTE:${escapeVCardText(combinedNotes)}` : '',
        'END:VCARD'
      ];

      const foldLine = (line: string) => {
        if (line.length <= 75) return line;
        let folded = '';
        let currentLine = line;
        while (currentLine.length > 75) {
          folded += currentLine.substring(0, 75) + '\r\n ';
          currentLine = currentLine.substring(75);
        }
        folded += currentLine;
        return folded;
      };

      const vCardString = lines.filter(line => line !== '').map(foldLine).join('\r\n');

      res.setHeader('Content-Type', 'text/vcard;charset=utf-8');
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.setHeader('Content-Disposition', `attachment; filename="${data.firstName || 'contacto'}_${data.lastName || ''}.vcf"`);
      res.send(vCardString);
    } catch (error) {
      console.error("Error generating vCard from Firebase:", error);
      res.status(500).json({ error: "Failed to generate vCard" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    
    app.use(async (req, res, next) => {
      try {
        const url = req.originalUrl;
        let template = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.use((req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
