document.getElementById('messageForm').addEventListener('submit', function(event) {
    event.preventDefault();  

    const message = document.getElementById('messageInput').value;
    const latitude = document.getElementById('latitudeInput').value || 0;
    const longitude = document.getElementById('longitudeInput').value || 0;

    fetch('http://localhost:8000/create/', {  
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: message, latitude: parseFloat(latitude), longitude: parseFloat(longitude) })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Network response was not ok: ${response.statusText}`);
        }
        return response.json();
    })
    .then(data => {
        document.getElementById('responseMessage').innerText = 'Mensaje enviado correctamente!';
        console.log('Success:', data);
    })
    .catch((error) => {
        document.getElementById('responseMessage').innerText = 'Error al enviar el mensaje.';
        console.error('Error:', error);
    });
});