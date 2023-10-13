FROM node:18-alpine
RUN mkdir -p /usr/src/app
COPY . /usr/src/app
WORKDIR /usr/src/app
RUN npm install
RUN npm run tsc
RUN npm run build
CMD ["node", "index.js"]
EXPOSE 4000
