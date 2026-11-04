let debounceTimer;
let fuse = null;
let allData = [];

// Endpoint de Railway (proxy Nutrefrios)
const DATA_URL = 'https://pdvnutrefrios-production.up.railway.app/api/nutrefrios/pdv';

async function loadData() {
    try {
        if (!allData.length) {
            const response = await fetch(DATA_URL);
            const json = await response.json();
            allData = json.result || [];
            initializeFuse();

            const searchInput = document.getElementById('searchInput');
            searchInput.disabled = false;
            searchInput.placeholder = 'Ingresa SAP, nombre, ciudad o dirección del PDV';
        }
    } catch (error) {
        console.error("Error al cargar datos:", error);
        document.getElementById('searchInput').placeholder = 'No disponible';
        document.getElementById('results').innerHTML = `
            <p style="color:red;"> No se pudo cargar la información.
            Es posible que los permisos de CORS o el servidor estén bloqueando la conexión.</p>`;
    }
}

function initializeFuse() {
    const options = {
        keys: ['SAP', 'PDV', 'CIUDAD', 'DIRECCION'],
        threshold: 0.3,
    };
    fuse = new Fuse(allData, options);
}

function handleInput() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        const searchInput = document.getElementById('searchInput').value.toLowerCase();
        if (searchInput.trim()) {
            performSearch(searchInput);
        } else {
            document.getElementById('results').innerHTML = '';
        }
    }, 300);
}

function performSearch(query) {
    if (!fuse) return;
    const results = fuse.search(query).map(result => result.item);
    renderResults(results);
}

// Devuelve el link de Google Maps solo si LATITUD/LONGITUD son coordenadas válidas (no "Sin Geo")
function getMapUrl(result) {
    const lat = parseFloat(result.LATITUD);
    const lng = parseFloat(result.LONGITUD);
    if (isNaN(lat) || isNaN(lng)) return null;
    return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
}

function renderResults(results) {
    let output = `<h2>Resultados (${results.length} encontrados):</h2>`;

    if (results.length > 0) {
        results.forEach(result => {
            const nombre = result.PDV || 'Sin nombre';
            const mapUrl = getMapUrl(result);

            output += `
                <div class="result-item pdv" role="region" aria-label="${nombre}">
                    <h3>
                        <i class="material-icons icon-tipo">store</i>
                        ${nombre}
                    </h3>
                    <div class="tags">
                        ${result.CIUDAD ? `<span class="tag ciudad">${result.CIUDAD}</span>` : ''}
                    </div>
                    <ul>
                        <li><strong>SAP:</strong> ${result.SAP}
                            <i class="material-icons copy-icon" role="button" tabindex="0" aria-label="Copiar SAP" onclick="copyToClipboard('${result.SAP}')">content_copy</i>
                        </li>
                        <li><strong>Dirección:</strong> ${result.DIRECCION || 'N/A'}</li>
                        <li><strong>Ubicación:</strong> ${mapUrl
                            ? `<a class="map-link" href="${mapUrl}" target="_blank" rel="noopener"><i class="material-icons">place</i>Ver en mapa</a>`
                            : 'Sin Geo'}
                        </li>
                    </ul>
                </div>
            `;
        });
    } else {
        output += '<p>No se encontraron resultados.</p>';
    }

    document.getElementById('results').innerHTML = output;
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text)
        .then(() => {
            alert('SAP copiado al portapapeles');
        })
        .catch(err => {
            alert('Error al copiar el SAP');
            console.error('Error:', err);
        });
}

function toggleDarkMode() {
    const isDark = document.getElementById('darkModeToggle').checked;
    document.body.classList.toggle('dark-mode', isDark);
    document.getElementById('darkModeLabel').textContent = isDark ? '☀️ Modo claro' : '🌙 Modo oscuro';
    localStorage.setItem('darkMode', isDark ? 'enabled' : 'disabled');
}

window.onload = () => {
    const darkModeSetting = localStorage.getItem('darkMode');
    const isDark = darkModeSetting === 'enabled';
    document.body.classList.toggle('dark-mode', isDark);
    document.getElementById('darkModeToggle').checked = isDark;
    document.getElementById('darkModeLabel').textContent = isDark ? '☀️ Modo claro' : '🌙 Modo oscuro';
};

loadData();
