FROM node:20-alpine

WORKDIR /app

# Copy only backend files
COPY backend/package.json backend/package-lock.json ./
RUN npm ci

COPY backend/tsconfig.json ./
COPY backend/src ./src

RUN npm run build

EXPOSE 3001

CMD ["node", "dist/index.js"]
