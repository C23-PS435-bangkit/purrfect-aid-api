#instal node
FROM node:16-alpine3.16

#folder
WORKDIR /container_tutorial

#initialize npm package
COPY package.json package.json

#npm install
RUN npm install

ENV PORT = 3000
EXPOSE 3000

CMD ["NPM"]

