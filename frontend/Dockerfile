FROM node:18-alpine

WORKDIR /app

COPY output/frontend/package.json ./
COPY output/frontend/package-lock.json ./
RUN npm install

COPY output/frontend/ ./
RUN npm run build

# Install serve and run the app
RUN npm install -g serve
CMD ["serve", "-s", "dist", "-l", "3000"]