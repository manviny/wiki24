const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";

// Si estás en local, usa localhost con el puerto 8000
// Si estás en producción, usa la misma URL del frontend pero con el subdirectorio /api
const API_URL = isLocal
    ? "http://localhost:8000"  
    : `${window.location.origin.replace(/^https?:\/\//, '')}:8000`;

console.log("API_URL:", API_URL);

document.addEventListener("DOMContentLoaded", function() {
    loadMessages(); // Cargar mensajes al cargar la página

    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
            function(position) {
                document.getElementById('latitude').value = position.coords.latitude;
                document.getElementById('longitude').value = position.coords.longitude;
            },
            function(error) {
                console.error("Error obteniendo la geolocalización:", error);
                document.getElementById('latitude').value = 0;
                document.getElementById('longitude').value = 0;
            }
        );
    }

    document.getElementById('messageForm').addEventListener('submit', function(event) {
        event.preventDefault();

        const message = document.getElementById('messageInput').value;
        const latitude = document.getElementById('latitude').value || 0;
        const longitude = document.getElementById('longitude').value || 0;

        fetch(`${API_URL}/create/`, {  
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: message, latitude: parseFloat(latitude), longitude: parseFloat(longitude) })
        })
        .then(response => response.json())
        .then(data => {
            document.getElementById('responseMessage').innerText = 'Mensaje enviado correctamente!';
            document.getElementById('messageInput').value = "";
            loadMessages(); // Recargar la lista de mensajes
        })
        .catch(error => {
            document.getElementById('responseMessage').innerText = 'Error al enviar el mensaje.';
            console.error('Error:', error);
        });
    });
});

// Función para cargar los mensajes desde la API y mostrarlos en la lista
function loadMessages() {
    fetch(`${API_URL}/messages/`)  
    .then(response => response.json())
    .then(data => {
        const messageList = document.getElementById('messageList');
        messageList.innerHTML = ''; // Limpiar la lista antes de agregar nuevos elementos

        data.messages.forEach(message => {
            const li = document.createElement('li');
            li.textContent = `${message.message} (ID: ${message.id}) ${message.location}`;

            const deleteButton = document.createElement('button');
            deleteButton.textContent = "🗑️";
            deleteButton.style.marginLeft = "10px";
            deleteButton.onclick = function() {
                deleteMessage(message.id);
            };

            li.appendChild(deleteButton);
            messageList.appendChild(li);
        });
    })
    .catch(error => console.error('Error cargando mensajes:', error));
}

// Función para eliminar un mensaje por ID
function deleteMessage(messageId) {
    fetch(`${API_URL}/delete/${messageId}`, {  
        method: 'DELETE'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Error al eliminar: ${response.statusText}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('Mensaje eliminado:', data);
        loadMessages(); // Recargar la lista después de la eliminación
    })
    .catch(error => console.error('Error eliminando mensaje:', error));
}