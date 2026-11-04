const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");
const app = express();

const PORT = process.env.PORT || 3000;
const { API_TOKEN } = process.env;
const PDV_ENDPOINT_URL = "https://botai.smartdataautomation.com/api_backend_ai/dinamic-db/report/119/pdv_nutrefrios";

if (!API_TOKEN) {
    console.error("❌ Falta la variable de entorno API_TOKEN");
    process.exit(1);
}

const AUTH_HEADERS = {
    Authorization: `Token ${API_TOKEN}`,
    "Content-Type": "application/json",
};

app.use(cors());

app.get("/api/nutrefrios/pdv", async (req, res) => {
    try {
        const response = await fetch(PDV_ENDPOINT_URL, { headers: AUTH_HEADERS });

        if (!response.ok) {
            const text = await response.text();
            console.error(`❌ Error HTTP ${response.status}:`, text);
            return res.status(response.status).json({ error: `Error ${response.status}: ${text.substring(0, 200)}` });
        }

        const data = await response.json();
        res.json(data);
    } catch (err) {
        console.error("❌ Error en el proxy:", err);
        res.status(500).json({ error: "Error al obtener datos del PDV", details: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor proxy escuchando en http://localhost:${PORT}`);
});
