FROM buildkite/puppeteer

WORKDIR /usr/src/app
ENV PUPPETEER_EXECUTABLE_PATH="/usr/bin/google-chrome-stable"

COPY package.json .
RUN npm install

EXPOSE 8080
CMD [ "npm", "start" ]

COPY . .