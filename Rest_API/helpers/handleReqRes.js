// dependencies section
const url = require('url');
const { StringDecoder } = require('string_decoder');

const routes = require('../routes');
const {
  notFoundHandler,
} = require('../handlers/routesHandlers/notFoundHandler');
const { parseJSON } = require('./utilities');
const { buffer } = require('stream/consumers');

// module scaffolding

const handler = {};
handler.handleReqRes = (req, res) => {
  // request handle
  const paresUrl = url.parse(req.url, true);
  const path = paresUrl.pathname;

  const trimmedPath = path.replace(/^\.?\/?/, '');
  const method = req.method.toLowerCase();

  const queryStringObject = paresUrl.query;
  const headersObject = req.headers;

  // All request property
  const reqProperty = {
    path,
    trimmedPath,
    url,
    method,
    queryStringObject,
    headersObject,
  };

  const decoder = new StringDecoder('utf-8');
  let realData = '';
  // check the route

  const chosenHandler = routes[trimmedPath]
    ? routes[trimmedPath]
    : notFoundHandler;

  req.on('data', (buffer) => {
    realData += decoder.write(buffer);
  });
  req.on('end', () => {
    realData += decoder.end();
    reqProperty.body = parseJSON(realData);
    chosenHandler(reqProperty, (statusCode, payload) => {
      statusCode = typeof statusCode === 'number' ? statusCode : 500;
      payload = typeof payload === 'object' ? payload : {};

      const payloadString = JSON.stringify(payload);

      // return the final response
      res.writeHead(statusCode);
      res.end(payloadString);
    });
  });

  req.on('end', () => {
    realData += decoder.end();
  });

  // response handle
};
module.exports = handler;
