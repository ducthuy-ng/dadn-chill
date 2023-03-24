FROM node:16.19.1 AS builder
WORKDIR /app

COPY ./package*.json .
RUN npm ci

COPY . .
RUN npx nx run frontend:build:production --verbose

# ====================================================

FROM nginx:1.23.3-alpine-slim

EXPOSE 80

COPY --from=builder /app/dist/apps/frontend /usr/share/nginx/html
