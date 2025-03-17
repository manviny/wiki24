FROM node:14-alpine

# Establece el directorio de trabajo
WORKDIR /usr/src/app

# Copia el package.json y el package-lock.json (si está disponible)
COPY package*.json ./

# Instala las dependencias del proyecto
RUN npm install

# Copia los archivos del proyecto
COPY . .

# Expone el puerto que usa la aplicación
EXPOSE 5001



# Comando para ejecutar la aplicación
CMD ["npm", "start"]