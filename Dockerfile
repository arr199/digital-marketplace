FROM node:20-alpine

WORKDIR /app

COPY  package*.json ./

RUN npm install --loglevel verbose

COPY . .

ENV PORT=3400

EXPOSE 3400

RUN ["npm" ,"run" ,"build"]

CMD [ "npm" , "start" ]
