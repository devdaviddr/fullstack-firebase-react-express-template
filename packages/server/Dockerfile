# development Dockerfile for server
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . ./

EXPOSE 3001

ARG SERVER_PORT
ENV PORT=${SERVER_PORT:-3001}

CMD ["npm", "run", "dev"]
