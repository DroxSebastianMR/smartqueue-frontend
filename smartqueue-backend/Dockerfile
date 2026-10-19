FROM node:22-alpine AS build

WORKDIR /app

RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile --config.dangerouslyAllowAllBuilds=true

COPY tsconfig.json tsconfig.build.json nest-cli.json ./
COPY prisma ./prisma
COPY src ./src

RUN pnpm prisma:generate && pnpm build

FROM node:22-alpine

WORKDIR /app

ENV NODE_ENV=production

RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile --prod=false --config.dangerouslyAllowAllBuilds=true

COPY --from=build /app/prisma ./prisma
RUN pnpm prisma:generate
COPY --from=build /app/dist ./dist

EXPOSE 3001

CMD ["sh", "-c", "pnpm exec prisma migrate deploy && node prisma/seed.mjs && node dist/main.js"]
