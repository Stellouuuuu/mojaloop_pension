const express = require("express");
const cors = require("cors");
require("dotenv").config();
const apiRoutes = require("./routes/api");

const app = express();
const PORT = process.env.PORT || 3001;

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL,
  methods: ["GET","POST","PUT","DELETE"],
  credentials: true
}));

app.use(express.json());

// Routes API
app.use("/api", apiRoutes);

app.listen(PORT, () => {
  console.log(`Backend démarré sur le port ${PORT}`);
});
