FROM node:16.17.1-alpine AS base

ENV NODE_ENV=production

WORKDIR /app

COPY [ "package.json", "package-lock.json*", "./" ]

RUN npm install --production

COPY . .

EXPOSE 8080
CMD [ "npm", "run", "server" ]