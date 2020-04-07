FROM node:lts-alpine

RUN apk add --no-cache tini

WORKDIR /usr/src/app

COPY . .

# Currently, this project does not require extra dependencies
#RUN apk add --no-cache --virtual .builddeps python make g++ git \
#    && npm ci \
#    && apk del .builddeps
RUN npm ci

ENTRYPOINT [ "/sbin/tini", "--" ]
CMD [ "node", "dist/app.js" ]
