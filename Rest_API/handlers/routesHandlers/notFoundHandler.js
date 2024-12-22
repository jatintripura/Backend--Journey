const handler = {};

handler.notFoundHandler = (reqProperty, callback) => {
    callback(404, { message: 'Not Found' });
};

module.exports = handler;
