FROM node:16.19.1 AS builder
WORKDIR /app

COPY ./package*.json .


RUN npm ci

COPY . .
RUN npx nx run backend:build:production --verbose

# ====================================================

FROM docker.io/node:lts-alpine

ENV HOST=0.0.0.0
ENV EXPRESS_PORT=3333

WORKDIR /app


COPY --from=builder /app/dist/apps/backend .
COPY ./package*.json .

RUN addgroup --system backend && \
  adduser --system -G backend backend
RUN chown -R backend:backend .


RUN npm ci --omit=dev

HEALTHCHECK CMD curl --fail http://localhost:${EXPRESS_PORT} || exit 1

CMD [ "node", "main.js" ]
