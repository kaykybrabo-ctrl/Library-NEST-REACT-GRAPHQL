FROM node:20-alpine
WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY src/ ./src/
COPY tsconfig.json ./
COPY tsconfig.backend.json ./
COPY nest-cli.json ./
COPY prisma/ ./prisma/
COPY index.html ./
COPY vite.config.ts ./

ENV DB_HOST=db
ENV DB_PORT=3306
ENV DB_USER=root
ENV DB_PASSWORD=12345678
ENV DB_NAME=library1
ENV PORT=8082
ENV SESSION_SECRET=docker-secret-key
ENV DATABASE_URL=mysql://root:12345678@db:3306/library1

COPY FRONTEND/ ./FRONTEND/

RUN npx prisma generate

RUN npm run react-build

RUN npm run build

RUN mkdir -p dist/FRONTEND/ && cp -R FRONTEND/ dist/
RUN mkdir -p dist/infrastructure/mail/templates \
 && cp -R src/infrastructure/mail/templates/* dist/infrastructure/mail/templates/ || true

EXPOSE 8082
CMD ["node", "dist/main.js"]