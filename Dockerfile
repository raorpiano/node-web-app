FROM node:14

# app directory
WORKDIR /usr/src/app

# install app dependencies
COPY package*.json ./

RUN npm install
# RUN npm ci --only=production

# Bundle app source
COPY . .

EXPOSE 8080
CMD [ "node", "server.js" ]
