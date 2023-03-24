FROM node:16.19.1 AS builder
WORKDIR /app

COPY ./package*.json .
RUN npm ci

COPY . .
RUN npx nx run frontend:build:production --verbose

# ====================================================

FROM docker.io/node:lts-alpine

ENV HOST=0.0.0.0
ENV PORT=3000

WORKDIR /app

COPY --from=builder /app/dist/apps/frontend .
COPY ./package*.json .

RUN addgroup --system frontend && \
  adduser --system -G frontend frontend
RUN chown -R frontend:frontend .

RUN npm ci --omit=dev

CMD [ "node", "frontend" ]
