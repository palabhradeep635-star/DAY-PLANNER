import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Serve static files from the Vite build output directory
app.use(express.static(path.join(__dirname, "dist")));

// Catch-all route to serve index.html for Client-Side Routing (SPA)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`APEX Engine Server ignited on port ${PORT}`);
});