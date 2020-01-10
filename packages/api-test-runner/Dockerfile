# Note: build context is root of monorepo

FROM mhart/alpine-node:12

WORKDIR /app

ENV DOCKERIZE_VERSION v0.6.0
RUN wget https://github.com/jwilder/dockerize/releases/download/$DOCKERIZE_VERSION/dockerize-alpine-linux-amd64-$DOCKERIZE_VERSION.tar.gz \
  && tar -C /usr/local/bin -xzvf dockerize-alpine-linux-amd64-$DOCKERIZE_VERSION.tar.gz \
  && rm dockerize-alpine-linux-amd64-$DOCKERIZE_VERSION.tar.gz

CMD dockerize -wait tcp://db:5432 -wait tcp://api:3000 -timeout 1m \
  yarn workspace @chiffre/api run migrate:up && \
  yarn workspace @chiffre/api-test-runner run test
