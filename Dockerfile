# Etapa 1: Construir la aplicación
FROM node:18 AS build
WORKDIR /app

# Copiamos archivos de dependencias
COPY package*.json package-lock.json* ./
RUN npm install

# Copiamos todo el código y construimos
COPY . .
RUN npm run build

# Etapa 2: Preparar entorno de producción
FROM node:18-slim
WORKDIR /app

# Copiamos solo lo necesario para producción
COPY --from=build /app/package*.json ./
COPY --from=build /app/dist ./dist
# Si server.ts está en la raíz, lo copiamos también
COPY --from=build /app/server.ts ./
# Instalamos solo dependencias de producción (para que tsx esté disponible)
RUN npm install --only=production

EXPOSE 8080

# Usamos el script "start" de tu package.json
CMD ["npm", "start"]
