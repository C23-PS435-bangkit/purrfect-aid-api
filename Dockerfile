#instal node
FROM node:16-alpine3.16

#folder
WORKDIR /purrfect-aid-api

#initialize npm package
COPY package.json package.json app.js ./

#npm install
RUN npm install

#copy folder
COPY routes/ /purrfect-aid-api/routes
COPY config /purrfect-aid-api/config

EXPOSE 3000

CMD ["npm", "start"]

