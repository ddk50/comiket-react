FROM node:18.12.1

RUN apt-get update -y

RUN mkdir /app
WORKDIR /app

COPY package-lock.json /app
COPY package.json /app

COPY . /app

RUN npm install

EXPOSE 80

CMD npx ts-node /app/src/app.ts
