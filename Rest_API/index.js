// dependencies section
const http = require('http');

const { handleReqRes } = require('./helpers/handleReqRes');
const environment = require('./helpers/environment');
const data = require('./lib/data');
const { sendTwilioSms } = require('./helpers/notification');

// test data
// data.delete('test', 'newfile', (err) => {
//     console.log(err);
// });

// module scaffolding
const app = {};

sendTwilioSms('01609472976', 'hello world', (err) => {
  console.log(`This is error:${err}`);
});
// create server
app.createServer = () => {
  const server = http.createServer(app.handleReqRes);
  server.listen(environment.port, () => {
    console.log(`Listening to port ${environment.port}`);
  });
};

// handling server req and res
app.handleReqRes = handleReqRes;

// start the server

app.createServer();
