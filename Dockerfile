FROM node:20-alpine

WORKDIR /app

# Install dependencies first for better layer caching.
COPY package.json package-lock.json ./
COPY backend/package.json ./backend/
COPY dashboard/package.json ./dashboard/
COPY bot/package.json ./bot/
RUN npm install

COPY . .

# 3001 = backend + Socket.IO, 5173 = dashboard.
EXPOSE 3001 5173

CMD ["npm", "run", "dev:all"]
