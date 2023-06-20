# syntax=docker/dockerfile:1

FROM node as stalkcd_characteristics


COPY tsconfig.json ./
COPY package*.json ./
COPY run.sh ./
COPY . .

RUN npm install typescript -g
RUN npm install
RUN tsc

EXPOSE 6060
CMD [ "node", "dist/server.js" ]
