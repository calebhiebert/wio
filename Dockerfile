from node:alpine

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY package.json /usr/src/app
RUN yarn && yarn cache clean

COPY . .
RUN ./node_modules/.bin/tsc

CMD ["yarn", "run", "run"]