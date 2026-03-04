# development Dockerfile for client
# Use Node LTS Alpine image
FROM node:18-alpine

# set working directory
WORKDIR /app

# install dependencies
# copy package files; package-lock.json may not exist in workspace
COPY package*.json ./
RUN npm install

# copy source
COPY . ./

# expose dev port
EXPOSE 5173

# use environment variables if provided
ARG CLIENT_PORT
ENV PORT=${CLIENT_PORT:-5173}

# default command: start Vite dev server
CMD ["npm", "run", "dev"]
