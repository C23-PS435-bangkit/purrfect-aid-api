#instal node
FROM node:16-alpine3.16

#folder
WORKDIR /container_tutorial

#initialize npm package
COPY package.json package.json

#npm install
RUN npm install

ENV PORT = 3000
ENV DBHOST=34.128.73.90
ENV DBUSER=root
ENV DBPASSWORD=eepy
ENV DBDATABASE=purrfect-aid-db
#ENV hakim
ENV CLIENT_ID=893345962600-5ftclvviuc6in842rviblc13bevl5ogk.apps.googleusercontent.com
ENV CLIENT_SECRET=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

EXPOSE 3000

CMD ["NPM"]

