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

// Función para obtener coordenadas de una ciudad usando Nominatim (OpenStreetMap)
async function obtenerCoordenadas(ciudad) {
   
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(ciudad)}&format=json`;
    try {
        const response = await axios.get(url, {
            headers: isNode ? { "User-Agent": "MiAplicacion/1.0" } : {}
        });
        if (response.data.length > 0) {
            return { lat: response.data[0].lat, lon: response.data[0].lon };
        } else {
            throw new Error("No se encontraron coordenadas para la ciudad especificada.");
        }
    } catch (error) {
        console.error(`Error al obtener coordenadas: ${error.message}`);
        return null; // En caso de error, devolver nulo
    }
   
}

// Función para buscar lugares cercanos usando la API de MediaWiki
async function buscarLugaresCercanos(lat, lon, radio = 5000) {
   
    const url = `https://es.wikipedia.org/w/api.php?action=query&list=geosearch&gscoord=${lat}|${lon}&gsradius=${radio}&gslimit=100&format=json&origin=*`;
    try {
        const response = await axios.get(url);
        return response.data.query.geosearch || [];
    } catch (error) {
        console.error(`Error al buscar lugares cercanos: ${error.message}`);
        return [];
    }
   
}

// Función para obtener extracto e imagen de Wikipedia
async function obtenerExtractoWikipedia(titulo) {
   
    const url = `https://es.wikipedia.org/w/api.php?action=query&format=json&titles=${encodeURIComponent(titulo)}&prop=extracts|pageimages&exintro=true&explaintext=true&piprop=original|thumbnail&pithumbsize=640&origin=*`;
    try {
        const response = await axios.get(url);
        const pageId = Object.keys(response.data.query.pages)[0];
        if (pageId !== "-1") {
            const page = response.data.query.pages[pageId];
            return {
                extracto: page.extract || 'No hay información disponible.',
                miniatura: page.thumbnail ? page.thumbnail.source : 'https://via.placeholder.com/640x480?text=No+Image+Available'
            };
        } else {
            return { extracto: "No se encontró información en Wikipedia.", miniatura: 'https://via.placeholder.com/640x480?text=No+Image+Available' };
        }
    } catch (error) {
        console.error(`Error al obtener información de Wikipedia: ${error.message}`);
        return { extracto: "Error al obtener información.", miniatura: 'https://via.placeholder.com/640x480?text=No+Image+Available' };
    }
   
}

// Función para obtener la geolocalización del usuario
async function getGeolocalizacion() {
   
    if ('geolocation' in navigator) {
        try {
            // Uso de una promesa para manejar adecuadamente la geolocalización
            const position = await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, {
                    enableHighAccuracy: true, // Solicita la mejor precisión posible
                    timeout: 10000, // Aumenta el tiempo de espera a 10 segundos
                    maximumAge: 8000 // Acepta una posición almacenada en caché de hasta 8 segundos
                });
            });
            console.log(`Geolocalización obtenida: Latitud: ${position.coords.latitude}, Longitud: ${position.coords.longitude}`);
            return { lat: position.coords.latitude, lon: position.coords.longitude };
        } catch (error) {
            console.warn(`Error al obtener la geolocalización del usuario: ${error.message}`);
            console.warn('Intentando obtener ubicación aproximada por IP...');
            return await obtenerUbicacionPorIP(); // Espera y devuelve la ubicación por IP
        }
    } else {
        console.warn('Geolocalización no es compatible con este navegador. Intentando ubicación por IP...');
        return await obtenerUbicacionPorIP(); // Uso de await para esperar la respuesta de IP
    }
   
}

// Función para obtener la ubicación por IP si falla la geolocalización
async function obtenerUbicacionPorIP() {
   
    try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        return { lat: data.latitude, lon: data.longitude };
    } catch (error) {
        console.error('La geolocalización basada en IP ha fallado:', error);
        return { lat: 0, lon: 0 }; // Devolver coordenadas neutrales en caso de error
    }
   
}

// Función para mostrar lugares cercanos en la interfaz de usuario
async function mostrarLugaresCercanos(ciudad = "") {
   
    let lat, lon;

    if (ciudad) {
        const coordenadas = await obtenerCoordenadas(ciudad);
        lat = coordenadas.lat;
        lon = coordenadas.lon;
    } else {
        const posicion = await getGeolocalizacion();
        lat = posicion.lat;
        lon = posicion.lon;
    }

    if (lat && lon) {
        const lugares = await buscarLugaresCercanos(lat, lon);
        const resultadosDiv = document.getElementById('resultados');
        resultadosDiv.innerHTML = '';

        for (const lugar of lugares) {
            const titulo = lugar.title || 'Desconocido';
            const { extracto, miniatura } = await obtenerExtractoWikipedia(titulo);
            const urlArticulo = `https://es.wikipedia.org/wiki/${encodeURIComponent(titulo)}`;
            const lugarCard = document.createElement('a');
            lugarCard.href = urlArticulo;
            lugarCard.target = '_blank';
            lugarCard.className = 'card';
            lugarCard.innerHTML = `
                <img src="${miniatura}" alt="${titulo}">
                <div class="card-content">
                    <h2 class="card-title">${titulo}</h2>
                    <p class="card-text">${extracto.split(' ').slice(0, 50).join(' ')}...</p>
                </div>
            `;
            resultadosDiv.appendChild(lugarCard);
        }
    } else {
        console.error("No se pudo obtener la ubicación para buscar lugares cercanos.");
    }
   
}

// Función para inicializar los eventos de la interfaz de usuario
function inicializarEventosUI() {
    mostrarLoader();
    const btnObtenerUbicacion = document.getElementById('obtenerUbicacion');
    if (btnObtenerUbicacion) {
        btnObtenerUbicacion.addEventListener('click', () => mostrarLugaresCercanos());
    }

    document.addEventListener('DOMContentLoaded', () => mostrarLugaresCercanos()); // Mostrar lugares cercanos al cargar la página sin necesidad de una ciudad específica
    ocultarLoader();
}

// Exportar funciones según el entorno
if (!isNode) {
    window.obtenerCoordenadas = obtenerCoordenadas;
    window.buscarLugaresCercanos = buscarLugaresCercanos;
    window.obtenerExtractoWikipedia = obtenerExtractoWikipedia;
    window.mostrarLugaresCercanos = mostrarLugaresCercanos;
    window.inicializarEventosUI = inicializarEventosUI;
}

// Inicializar eventos UI cuando el script se carga en un navegador
if (typeof window !== 'undefined') {
    inicializarEventosUI();
}



// Función para mostrar el loader
function mostrarLoader() {
    document.getElementById('loader').style.display = 'flex';
}

// Función para ocultar el loader
function ocultarLoader() {
    document.getElementById('loader').style.display = 'none';
}