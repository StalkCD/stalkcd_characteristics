FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:20-alpine AS server
WORKDIR /app
COPY package* ./
RUN npm install
COPY --from=builder ./app/public ./public
COPY --from=builder ./app/dist ./dist
EXPOSE 8082
CMD ["npm", "start"]