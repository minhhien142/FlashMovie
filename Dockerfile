FROM node:latest

# Create app directory
RUN mkdir -p /usr/src/app
#RUN npm install -g pm2
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json /usr/src/app/
RUN npm install

# Bundle app source
COPY . /usr/src/app

EXPOSE 3000:3000
CMD [ "npm", "start" ]

