FROM node:20-bullseye

WORKDIR /app

COPY package*.json ./

RUN npm cache clean --force
RUN npm ci --omit=dev

COPY . .

RUN mkdir -p logs

EXPOSE 3001

CMD ["node", "server.js"]