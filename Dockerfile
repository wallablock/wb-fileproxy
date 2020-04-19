FROM node:lts-alpine

RUN apk add --no-cache tini

WORKDIR /usr/src/app

COPY . .

# Currently, this project does not require extra dependencies
#RUN apk add --no-cache --virtual .builddeps python make g++ git \
#    && npm ci \
#    && apk del .builddeps
RUN npm ci
# npm ci fails to run build script for some reason
RUN npm run build

ENV PORT 80
ENTRYPOINT [ "/sbin/tini", "--" ]
CMD [ "npm", "start" ]
EXPOSE 80
