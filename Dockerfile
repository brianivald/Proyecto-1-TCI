FROM node:18-alpine

# Crear el directorio de trabajo
WORKDIR /usr/src/app

# Copiar package.json
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto del código
COPY . .

# Exponer el puerto
EXPOSE 3000

# Comando para iniciar la aplicación
CMD ["node", "servidor.js"]
