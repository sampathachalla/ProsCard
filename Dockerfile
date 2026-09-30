FROM node:22-alpine

WORKDIR /app

COPY api/package.json api/package-lock.json ./
RUN npm ci

COPY api/ .

ENV NODE_ENV=development
EXPOSE 3000

CMD ["npm", "start"]
