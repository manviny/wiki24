// api.js

// Detectar el entorno de ejecución
const isNode = typeof window === 'undefined';

// Importar Axios según el entorno
let axios;
if (isNode) {
    axios = require('axios');
} else {
    axios = window.axios;
}

// Paso 1: Obtener coordenadas de una ciudad usando Nominatim (OpenStreetMap)
async function obtenerCoordenadas(ciudad) {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(ciudad)}&format=json`;
    try {
        const response = await axios.get(url, {
            headers: isNode ? { "User-Agent": "MiAplicacion/1.0" } : {}
        });
        if (response.data.length > 0) {
            const { lat, lon } = response.data[0];
            return { lat, lon };
        } else {
            throw new Error("No se encontraron coordenadas para la ciudad especificada.");
        }
    } catch (error) {
        throw new Error(`Error al obtener coordenadas: ${error.message}`);
    }
}

// Paso 2: Buscar lugares cercanos usando la API de MediaWiki
async function buscarLugaresCercanos(lat, lon, radio = 5000) {
    const url = `https://es.wikipedia.org/w/api.php?action=query&list=geosearch&gscoord=${lat}|${lon}&gsradius=${radio}&gslimit=100&format=json&origin=*`;
    try {
        const response = await axios.get(url);
        return response.data.query.geosearch || [];
    } catch (error) {
        throw new Error(`Error al buscar lugares cercanos: ${error.message}`);
    }
}

// Paso 3: Obtener extracto de Wikipedia
async function obtenerExtractoWikipedia(titulo) {
    // const url = `https://es.wikipedia.org/w/api.php?action=query&format=json&titles=${encodeURIComponent(titulo)}&prop=extracts|pageimages&exintro=true&explaintext=true&piprop=thumbnail&pithumbsize=100&origin=*`;
    const url = `https://es.wikipedia.org/w/api.php?action=query&format=json&titles=${encodeURIComponent(titulo)}&prop=extracts|pageimages&exintro=true&explaintext=true&piprop=original|thumbnail&pithumbsize=640&origin=*`;

    try {
        const response = await axios.get(url);
        const pageId = Object.keys(response.data.query.pages)[0];
        if (pageId !== "-1") {
            const page = response.data.query.pages[pageId];
            const extracto = page.extract || 'No hay información disponible.';
            const miniatura = page.thumbnail ? page.thumbnail.source : 'No hay miniatura disponible.';
            return { extracto, miniatura };
        } else {
            return { extracto: "No se encontró información en Wikipedia.", miniatura: null };
        }
    } catch (error) {
        throw new Error(`Error al obtener información de Wikipedia: ${error.message}`);
    }
}


// Paso 3: Obtener extracto de Wikipedia
async function getGeolocalizacion() {
    if ('geolocation' in navigator) {
        try {
            const position = await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, {
                    enableHighAccuracy: true,
                    timeout: 15000,
                    maximumAge: 0
                });
            });
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            console.log(`Latitud: ${lat}, Longitud: ${lon}`);
            return { lat, lon };
        } catch (error) {
            switch (error.code) {
                case error.PERMISSION_DENIED:
                    console.warn('Permiso denegado. Obteniendo ubicación aproximada...');
                    break;
                case error.POSITION_UNAVAILABLE:
                    console.warn('La información de ubicación no está disponible. Obteniendo ubicación aproximada...');
                    break;
                case error.TIMEOUT:
                    console.warn('La solicitud para obtener la ubicación ha caducado. Obteniendo ubicación aproximada...');
                    break;
                default:
                    console.warn('Se ha producido un error desconocido. Obteniendo ubicación aproximada...');
                    break;
            }
            return obtenerUbicacionPorIP();
        }
    } else {
        console.warn('Geolocalización no es compatible con este navegador. Obteniendo ubicación aproximada...');
        return obtenerUbicacionPorIP();
    }
}


async function obtenerUbicacionPorIP() {
    try {
        const response = await fetch('http://ip-api.com/json/');
        const data = await response.json();
        const lat = data.lat;
        const lon = data.lon;
        console.log(`Latitud aproximada: ${lat}, Longitud: ${lon}`);
        return { lat, lon };
    } catch (ipError) {
        console.error('La geolocalización basada en IP ha fallado:', ipError);
        throw ipError;
    }
}


// Exportar funciones según el entorno
if (isNode) {
    module.exports = {
        obtenerCoordenadas,
        buscarLugaresCercanos,
        obtenerExtractoWikipedia
    };
} else {
    window.obtenerCoordenadas = obtenerCoordenadas;
    window.buscarLugaresCercanos = buscarLugaresCercanos;
    window.obtenerExtractoWikipedia = obtenerExtractoWikipedia;
}

// Función principal para Node.js
async function main() {
    const ciudad = "Jávea";
    try {
        const { lat, lon } = await obtenerCoordenadas(ciudad);
        console.log(`Coordenadas de ${ciudad}: Latitud = ${lat}, Longitud = ${lon}`);

        const lugares = await buscarLugaresCercanos(lat, lon);
        if (lugares.length > 0) {
            console.log(`Lugares cercanos a ${ciudad}:`);
            for (const lugar of lugares) {
                const titulo = lugar.title || 'Desconocido';
                console.log(`Lugar: ${titulo}`);
                const { extracto, miniatura } = await obtenerExtractoWikipedia(titulo);
                console.log(`Extracto: ${extracto}`);
                console.log(`Miniatura: ${miniatura}`);
                console.log("-".repeat(40));
            }
        } else {
            console.log("No se encontraron lugares cercanos.");
        }
    } catch (error) {
        console.error(`Error: ${error.message}`);
    }
}

// Ejecutar la función principal en Node.js
if (isNode) {
    main();
}
