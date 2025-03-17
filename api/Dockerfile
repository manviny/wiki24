FROM python:3.9-slim

# Instalar dependencias necesarias
RUN apt-get update \
    && apt-get -y install libpq-dev gcc \
    && apt-get clean

# Establecer el directorio de trabajo
WORKDIR /app

# Copiar y instalar las dependencias de Python
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar el resto de la aplicación
COPY . .

# Comando por defecto
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]

