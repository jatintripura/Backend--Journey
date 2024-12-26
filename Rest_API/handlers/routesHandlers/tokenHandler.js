//dependencis
const data = require('../../lib/data');
const { hash } = require('../../helpers/utilities');
const { createRandomString } = require('../../helpers/utilities');
const { parseJSON } = require('../../helpers/utilities');
const eslintPluginPrettier = require('eslint-plugin-prettier');
//module scalffolding
const handler = {};
handler.tokenHandler = (reqProperty, callback) => {
  const acceptedMethod = ['get', 'post', 'put', 'delete '];
  if (acceptedMethod.indexOf(reqProperty.method) > -1) {
    handler._token[reqProperty.method](reqProperty, callback);
  } else {
    callback(405);
  }
};
// eslint-disable-next-line no-underscore-dangle
handler._token = {};
// eslint-disable-next-line no-underscore-dangle
handler._token.post = (reqProperty, callback) => {
  const phone =
    typeof reqProperty.body.phone === 'string' &&
    reqProperty.body.phone.trim().length == 11
      ? reqProperty.body.phone
      : false;
  const password =
    typeof reqProperty.body.password === 'string' &&
    reqProperty.body.password.trim().length > 0
      ? reqProperty.body.password
      : false;

  if (phone && password) {
    data.read('users', phone, (err, userData) => {
      let hashedPassword = hash(password);
      if (hashedPassword === parseJSON(userData).password) {
        let tokenID = createRandomString(20);
        let expire = Date.now() + 60 * 60 * 1000;
        let tokenObject = {
          phone: phone,
          id: tokenID,
          expire,
        };
        //store the token in to db
        data.create('tokens', tokenID, tokenObject, (err) => {
          if (!err) {
            callback(200, tokenObject);
          } else {
            callback(500, { error: 'Server side problem' });
          }
        });
      } else {
        callback(400, { error: 'Password is not valid' });
      }
    });
  } else {
    callback(400, { error: 'There was a problem in your request' });
  }
};
handler._token.get = (reqProperty, callback) => {
  const id =
    typeof reqProperty.queryStringObject.id === 'string' &&
    reqProperty.queryStringObject.id.trim().length == 20
      ? reqProperty.queryStringObject.id
      : false;
  if (id) {
    //lookup the token
    data.read('tokens', id, (err, tokenData) => {
      const token = { ...parseJSON(tokenData) };
      if (!err && token) {
        callback(200, token);
      } else {
        callback(404, { error: 'Requested token was not found' });
      }
    });
  } else {
    callback(404, { error: 'Requested token was not found' });
  }
};
handler._token.put = (reqProperty, callback) => {
  const id =
    typeof reqProperty.body.id === 'string' &&
    reqProperty.body.id.trim().length == 20
      ? reqProperty.body.id
      : false;
  const extend =
    typeof reqProperty.body.extend === 'boolean' &&
    reqProperty.body.extend === true
      ? true
      : false;
  if (id && extend) {
    data.read('tokens', id, (err, tokenData) => {
      let tokenObject = parseJSON(tokenData);
      if (tokenObject.expire > Date.now()) {
        tokenObject.expire = Date.now() + 60 * 60 * 1000;
        //store the updated token
        data.updade('tokens', id, tokenObject, (err) => {
          if (!err) {
            callback(200);
          } else {
            callback(500, { error: 'There was a server side error' });
          }
        });
      } else {
        callback(400, { error: 'Token already expired' });
      }
    });
  } else {
    callback(400, { error: 'There was a problem in your request' });
  }
};
handler._token.delete = (reqProperty, callback) => {
  const id =
    typeof reqProperty.queryStringObject.id === 'string' &&
    reqProperty.queryStringObject.id.trim().length == 20
      ? reqProperty.queryStringObject.id
      : false;
  if (id) {
    //lookup the user
    data.read('tokens', id, (err, tokenData) => {
      if (!err && tokenData) {
        data.delete('tokens', id, (err) => {
          if (!err) {
            callback(200, { message: 'Token was successfully deleted' });
          } else {
            callback(500, { error: 'There was a server side problem' });
          }
        });
      } else {
        callback(500, { error: 'There was a server side problem' });
      }
    });
  } else {
    callback(400, { error: 'There was a problem in your request' });
  }
};
handler._token.verify = (id, phone, callback) => {
  data.read('tokens', id, (err, tokenData) => {
    if (!err && tokenData) {
      if (
        parseJSON(tokenData).phone === phone &&
        parseJSON(tokenData).expire > Date.now()
      ) {
        callback(true);
      } else {
        callback(false);
      }
    } else {
      callback(false);
    }
  });
};
module.exports = handler;
