const handler = {};
handler.sampleHandler = (reqProperty, callback) => {
  callback(200, { message: 'This is a sample url' });
};
module.exports = handler;
