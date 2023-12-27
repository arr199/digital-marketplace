FROM node:lts

WORKDIR /app

COPY  package*.json ./

RUN npm install

COPY . .

ENV PORT=3400

EXPOSE 3400

RUN ["npm" ,"run" ,"build"]

CMD [ "npm" , "start" ]
