# syntax=docker/dockerfile:1

FROM node:18-alpine
ENV NODE_ENV=production

WORKDIR /dist

COPY ["package.json", "package-lock.json*", "./"]

RUN npm install --production
EXPOSE 80
COPY . .

CMD ["node", "dist/server.js"]