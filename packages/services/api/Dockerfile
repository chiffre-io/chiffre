# Note: build context is root of monorepo

FROM mhart/alpine-node:12 AS builder

WORKDIR /app

COPY package.json yarn.lock     ./
COPY packages/lib/crypto-client ./packages/lib/crypto-client
COPY packages/services/api      ./packages/services/api

RUN yarn --pure-lockfile
RUN yarn workspace @chiffre/crypto-client run build
RUN yarn workspace @chiffre/api           run build:self
RUN rm -rf node_modules/
RUN yarn --production --pure-lockfile

# ---

FROM mhart/alpine-node:slim-12 AS final

WORKDIR /app
COPY --from=builder /app .

EXPOSE 3000

CMD node ./packages/services/api/dist/main.js
