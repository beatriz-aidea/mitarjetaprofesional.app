import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import Airtable from "airtable";
import { customAlphabet } from "nanoid";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const generatePublicId = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 12);
const JWT_SECRET = process.env.JWT_SECRET || 'aidea-vcard-secret-key-2025';

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '10mb' }));

  // Airtable configuration
  const apiKey = process.env.AIRTABLE_API_KEY;
  const baseId = process.env.AIRTABLE_BASE_ID;
  
  if (!apiKey || !baseId) {
    console.error("CRITICAL ERROR: AIRTABLE_API_KEY or AIRTABLE_BASE_ID is not set in the environment.");
  }

  const base = new Airtable({ apiKey: apiKey || 'dummy_key' }).base(baseId || 'dummy_base');
  const tablePerfiles = process.env.AIRTABLE_TABLE_PERFILES || 'Perfiles';
  const tableSistema = process.env.AIRTABLE_TABLE_SISTEMA || 'Perfil_Sistema';
  const tableUsuarios = process.env.AIRTABLE_TABLE_USUARIOS || 'Usuarios';

  // Field mapping between frontend keys and Airtable column names
  const fieldMapping: Record<string, string> = {
    firstName: "Nombre",
    lastName: "Apellidos",
    organization: "Empresa",
    title: "Cargo",
    phoneWork: "Telefono Trabajo",
    phoneWorkPrefix: "Prefijo Trabajo",
    phoneMobile: "Telefono Movil",
    phoneMobilePrefix: "Prefijo Movil",
    email: "Email",
    url: "Sitio Web",
    street: "Calle",
    city: "Ciudad",
    state: "Provincia",
    zip: "Codigo Postal",
    country: "Pais",
    relationship: "Relacion",
    customNote: "Nota Personal",
    observations: "Observaciones",
    linkedin: "LinkedIn",
    instagram: "Instagram",
    twitter: "Twitter",
    tiktok: "TikTok",
    x: "X",
    photo: "Foto",
    mapsUrl: "Maps URL"
  };

  const reverseFieldMapping: Record<string, string> = Object.fromEntries(
    Object.entries(fieldMapping).map(([k, v]) => [v, k])
  );

  // Fields that should not be sent to Airtable during create/update
  const readOnlyFields = ["photo", "mapsUrl", "relationship", "observations", "customNote"];

  // --- AUTHENTICATION ENDPOINTS ---

  app.post("/api/auth/register", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ error: "Email y contraseña son obligatorios" });
      }

      // Check if user exists
      const existingUsers = await base(tableUsuarios).select({
        filterByFormula: `{Email} = '${email}'`,
        maxRecords: 1
      }).firstPage();

      if (existingUsers.length > 0) {
        return res.status(400).json({ error: "Este correo electrónico ya está registrado" });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create user
      const record = await base(tableUsuarios).create([
        {
          fields: {
            Email: email,
            Password: hashedPassword
          }
        }
      ]);

      const token = jwt.sign({ id: record[0].id, email }, JWT_SECRET, { expiresIn: '7d' });

      res.status(201).json({ 
        message: "Usuario registrado con éxito",
        token,
        user: { id: record[0].id, email }
      });
    } catch (error: any) {
      console.error("Error registering user:", error);
      res.status(500).json({ error: "Error interno al registrar usuario" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: "Email y contraseña son obligatorios" });
      }

      // Find user
      const users = await base(tableUsuarios).select({
        filterByFormula: `{Email} = '${email}'`,
        maxRecords: 1
      }).firstPage();

      if (users.length === 0) {
        return res.status(401).json({ error: "Credenciales incorrectas" });
      }

      const userRecord = users[0];
      const storedPassword = userRecord.get('Password') as string;

      if (!storedPassword) {
        return res.status(401).json({ error: "Credenciales incorrectas" });
      }

      // Verify password
      const isMatch = await bcrypt.compare(password, storedPassword);

      if (!isMatch) {
        return res.status(401).json({ error: "Credenciales incorrectas" });
      }

      const token = jwt.sign({ id: userRecord.id, email }, JWT_SECRET, { expiresIn: '7d' });

      res.json({
        message: "Login exitoso",
        token,
        user: { id: userRecord.id, email }
      });
    } catch (error) {
      console.error("Error logging in:", error);
      res.status(500).json({ error: "Error interno al iniciar sesión" });
    }
  });

  // --- VCARD ENDPOINTS ---

  // API endpoint to create or update a profile
  app.post("/api/perfil", async (req, res) => {
    try {
      const formData = req.body;
      const { public_id: existingPublicId, ...profileData } = formData;
      
      // Clean formData to remove empty strings and undefined values
      const cleanFormData = Object.fromEntries(
        Object.entries(profileData).filter(([k, v]) => v !== '' && v !== null && v !== undefined && !readOnlyFields.includes(k))
      );

      // Map to Airtable fields
      const mappedData: any = {};
      for (const [key, value] of Object.entries(cleanFormData)) {
        const airtableField = fieldMapping[key];
        if (airtableField) {
          mappedData[airtableField] = value;
        }
      }

      // If we already have a public_id, try to update the existing record
      if (existingPublicId) {
        const sistemaRecords = await base(tableSistema).select({
          filterByFormula: `{public_id} = '${existingPublicId}'`,
          maxRecords: 1
        }).firstPage();

        if (sistemaRecords.length > 0) {
          const perfilIds = sistemaRecords[0].get('Perfil') as string[];
          if (perfilIds && perfilIds.length > 0) {
            await base(tablePerfiles).update([
              {
                id: perfilIds[0],
                fields: mappedData
              }
            ]);
            
            // Use APP_URL in AI Studio preview, otherwise use PUBLIC_BASE_URL or host
            const baseUrl = process.env.APP_URL || process.env.PUBLIC_BASE_URL || `${req.protocol}://${req.get('host')}`;
            return res.json({
              public_id: existingPublicId,
              landing_url: `${baseUrl}/${existingPublicId}`,
              recordIdPerfil: perfilIds[0]
            });
          }
        }
      }

      // If no existing public_id or record not found, create a new one
      const public_id = generatePublicId();

      // Create record in Perfiles
      const perfilesRecord = await base(tablePerfiles).create([
        {
          fields: mappedData
        }
      ]);
      const recordIdPerfil = perfilesRecord[0].id;

      // Create record in Perfil_Sistema
      await base(tableSistema).create([
        {
          fields: {
            Perfil: [recordIdPerfil],
            public_id: public_id,
            estado_publicacion: "publicado"
          }
        }
      ]);

      // Construct final URL
      // Use APP_URL in AI Studio preview, otherwise use PUBLIC_BASE_URL or host
      const baseUrl = process.env.APP_URL || process.env.PUBLIC_BASE_URL || `${req.protocol}://${req.get('host')}`;
      const landing_url = `${baseUrl}/${public_id}`;

      // Return response
      res.json({
        public_id,
        landing_url,
        recordIdPerfil
      });
    } catch (error: any) {
      console.error("Error creating profile in Airtable:", error);
      console.error("Error details:", JSON.stringify(error, null, 2));
      
      let errorMessage = "Failed to create profile";
      if (error.error === 'NOT_FOUND') {
        errorMessage = "Airtable Base ID or Table Name not found, or API key lacks access.";
      }
      
      res.status(500).json({ error: errorMessage, details: error.message || error });
    }
  });

  // API endpoint to get a profile by public_id
  app.get("/api/perfil/:public_id", async (req, res) => {
    try {
      const { public_id } = req.params;

      // Find in Perfil_Sistema
      const sistemaRecords = await base(tableSistema).select({
        filterByFormula: `{public_id} = '${public_id}'`,
        maxRecords: 1
      }).firstPage();

      if (sistemaRecords.length === 0) {
        return res.status(404).json({ error: "Profile not found" });
      }

      const sistemaRecord = sistemaRecords[0];
      const perfilIds = sistemaRecord.get('Perfil') as string[];

      if (!perfilIds || perfilIds.length === 0) {
        return res.status(404).json({ error: "Linked profile not found" });
      }

      const recordIdPerfil = perfilIds[0];

      // Fetch from Perfiles
      const perfilRecord = await base(tablePerfiles).find(recordIdPerfil);

      // Map Airtable fields back to frontend keys
      const mappedResponse: any = {};
      for (const [key, value] of Object.entries(perfilRecord.fields)) {
        const frontendKey = reverseFieldMapping[key];
        if (frontendKey) {
          if (frontendKey === 'photo' && Array.isArray(value) && value.length > 0) {
            mappedResponse[frontendKey] = value[0].url;
          } else {
            mappedResponse[frontendKey] = value;
          }
        } else {
          mappedResponse[key] = value;
        }
      }

      res.json(mappedResponse);
    } catch (error) {
      console.error("Error fetching profile from Airtable:", error);
      res.status(500).json({ error: "Failed to fetch profile" });
    }
  });

  // API endpoint to download vCard directly
  app.get("/api/perfil/:public_id/vcard", async (req, res) => {
    try {
      const { public_id } = req.params;

      // Find in Perfil_Sistema
      const sistemaRecords = await base(tableSistema).select({
        filterByFormula: `{public_id} = '${public_id}'`,
        maxRecords: 1
      }).firstPage();

      if (sistemaRecords.length === 0) {
        return res.status(404).json({ error: "Profile not found" });
      }

      const sistemaRecord = sistemaRecords[0];
      const perfilIds = sistemaRecord.get('Perfil') as string[];

      if (!perfilIds || perfilIds.length === 0) {
        return res.status(404).json({ error: "Linked profile not found" });
      }

      const recordIdPerfil = perfilIds[0];

      // Fetch from Perfiles
      const perfilRecord = await base(tablePerfiles).find(recordIdPerfil);

      // Map Airtable fields back to frontend keys
      const data: any = {};
      for (const [key, value] of Object.entries(perfilRecord.fields)) {
        const frontendKey = reverseFieldMapping[key];
        if (frontendKey) {
          if (frontendKey === 'photo' && Array.isArray(value) && value.length > 0) {
            data[frontendKey] = value[0].url;
          } else {
            data[frontendKey] = value;
          }
        } else {
          data[key] = value;
        }
      }

      // Generate vCard string
      const relationshipContext = data.relationship ? `Conocido por: ${data.relationship}` : '';
      const userNoteContext = data.customNote ? `Recuérdame: ${data.customNote}` : '';
      const combinedNotes = [relationshipContext, userNoteContext].filter(Boolean).join(' | ');

      const fullPhoneWork = data.phoneWork ? `${data.phoneWorkPrefix || ''}${data.phoneWork.replace(/\\s+/g, '')}` : '';
      const fullPhoneMobile = data.phoneMobile ? `${data.phoneMobilePrefix || ''}${data.phoneMobile.replace(/\\s+/g, '')}` : '';

      const addressParts = [data.street, data.city, data.state, data.zip, data.country].filter(Boolean);
      const addressString = addressParts.join(', ');
      const mapsUrl = addressString ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressString)}` : '';

      const lines = [
        'BEGIN:VCARD',
        'VERSION:3.0',
        `N:${data.lastName || ''};${data.firstName || ''};;;`,
        `FN:${data.firstName || ''} ${data.lastName || ''}`,
        data.organization ? `ORG:${data.organization}` : '',
        data.title ? `TITLE:${data.title}` : '',
        data.email ? `EMAIL;TYPE=INTERNET,WORK:${data.email}` : '',
        data.url ? `URL;TYPE=WORK:${data.url}` : '',
        fullPhoneWork ? `TEL;TYPE=WORK,VOICE:${fullPhoneWork}` : '',
        fullPhoneMobile ? `TEL;TYPE=CELL,VOICE:${fullPhoneMobile}` : '',
        data.street || data.city || data.state || data.zip || data.country ? `ADR;TYPE=WORK:;;${data.street || ''};${data.city || ''};${data.state || ''};${data.zip || ''};${data.country || ''}` : '',
        mapsUrl ? `item1.URL:${mapsUrl}` : '',
        mapsUrl ? `item1.X-ABLabel:Como llegar` : '',
        data.linkedin ? `X-SOCIALPROFILE;TYPE=linkedin:${data.linkedin}` : '',
        data.instagram ? `X-SOCIALPROFILE;TYPE=instagram:${data.instagram}` : '',
        data.x ? `X-SOCIALPROFILE;TYPE=twitter:${data.x}` : '',
        data.tiktok ? `X-SOCIALPROFILE;TYPE=tiktok:${data.tiktok}` : '',
        data.photo ? `PHOTO;ENCODING=b;TYPE=JPEG:${data.photo.split(',')[1]}` : '',
        data.public_id ? `UID:${data.public_id}` : '',
        combinedNotes ? `NOTE:${combinedNotes.replace(/\\n/g, '\\\\n')}` : '',
        'END:VCARD'
      ];

      const vCardString = lines.filter(line => line !== '').join('\\n');

      res.setHeader('Content-Type', 'text/vcard;charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${data.firstName || 'contacto'}_${data.lastName || ''}.vcf"`);
      res.send(vCardString);
    } catch (error) {
      console.error("Error generating vCard from Airtable:", error);
      res.status(500).json({ error: "Failed to generate vCard" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
