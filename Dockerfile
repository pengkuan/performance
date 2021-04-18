FROM buildkite/puppeteer

WORKDIR /usr/src/app
ENV PUPPETEER_DOWNLOAD_HOST https://npm.taobao.org/mirrors

COPY package.json .
RUN npm install

EXPOSE 8080
CMD [ "npm", "start" ]

COPY . .