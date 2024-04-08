# Dockerfile para Node.js con Nodemon en modo desarrollo adaptado para el 
# despliegue en el examen de la asignatura de Desarrollo de Aplicaciones Web
# y Despliegue de Aplicaciones Web

# Use una imagen oficial de Node.js como base
FROM node:19

# Configura la variable de entorno si no esta configurada
ARG NODE_ENV
ENV NODE_ENV=${NODE_ENV}
CMD echo "NODE_ENV: $NODE_ENV"


# Establece el directorio de trabajo
WORKDIR /app

# Copia los archivos de tu proyecto en el directorio de trabajo
# COPY ./src .

# Instala las dependencias de npm
# RUN npm install 

RUN if [ "$NODE_ENV" = "development" ]; then npm install nodemon -g; fi;

# Ejecuta el código Node.js
CMD [ "npm", "start" ]