# syntax=docker/dockerfile:1

FROM node


COPY tsconfig.json ./
COPY package*.json ./
COPY . .

RUN npm install typescript -g
RUN npm install
RUN tsc

EXPOSE 6060
CMD [ "node", "dist/server.js" ]
