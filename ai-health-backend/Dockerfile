FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev
COPY src ./src
COPY service-account-key.json ./
EXPOSE 3001
ENV NODE_ENV=production
CMD ["node", "src/server.js"]
