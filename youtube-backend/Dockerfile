# 🏗️ Build Stage
FROM node:20.12.2-alpine AS builder

WORKDIR /app

COPY package*.json yarn.lock ./

RUN yarn install --frozen-lockfile

COPY . .

RUN yarn build

# 🚀 Runtime Stage
FROM node:20.12.2-alpine AS runtime

WORKDIR /app

COPY --from=builder /app/.next .next
COPY --from=builder /app/node_modules node_modules
COPY --from=builder /app/public public
COPY --from=builder /app/package.json package.json
COPY --from=builder /app/.env .env

ENV NODE_ENV=production
ENV PORT=3000

CMD ["yarn", "start"]
