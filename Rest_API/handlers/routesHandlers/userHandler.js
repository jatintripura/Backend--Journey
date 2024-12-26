//dependencis
const data = require('../../lib/data');
const { hash } = require('../../helpers/utilities');
const { parseJSON } = require('../../helpers/utilities');
const tokenHandler = require('./tokenHandler');
//module scalffolding
const handler = {};
handler.userHandler = (reqProperty, callback) => {
  const acceptedMethod = ['get', 'post', 'put', 'delete '];
  if (acceptedMethod.indexOf(reqProperty.method) > -1) {
    handler._user[reqProperty.method](reqProperty, callback);
  } else {
    callback(405);
  }
};
// eslint-disable-next-line no-underscore-dangle
handler._user = {};
// eslint-disable-next-line no-underscore-dangle
handler._user.post = (reqProperty, callback) => {
  const firstName =
    typeof reqProperty.body.firstName === 'string' &&
    reqProperty.body.firstName.trim().length > 0
      ? reqProperty.body.firstName
      : false;
  const lastName =
    typeof reqProperty.body.lastName === 'string' &&
    reqProperty.body.lastName.trim().length > 0
      ? reqProperty.body.lastName
      : false;
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
  const tosAgreement =
    typeof reqProperty.body.tosAgreement === 'boolean'
      ? reqProperty.body.tosAgreement
      : false;
  if (firstName && lastName && phone && password && tosAgreement) {
    //make sure that the user doesn't already exists
    data.read('users', phone, (err, user) => {
      if (err) {
        let userObject = {
          firstName,
          lastName,
          phone,
          password: hash(password),
          tosAgreement,
        };
        //store the user to db
        data.create('users', phone, userObject, (err) => {
          if (!err) {
            callback(200, { message: 'User was created successfully' });
          } else {
            callback(500, { error: 'Could not create user' });
          }
        });
      } else {
        callback(500, {
          error: 'There was a problem in server side',
        });
      }
    });
  } else {
    callback(500, { error: 'You have a problem in your request' });
  }
};
handler._user.get = (reqProperty, callback) => {
  //check the phone number is valid
  const phone =
    typeof reqProperty.queryStringObject.phone === 'string' &&
    reqProperty.queryStringObject.phone.trim().length == 11
      ? reqProperty.queryStringObject.phone
      : false;
  if (phone) {
    //verify token
    let token =
      typeof reqProperty.headersObject.token === 'string'
        ? reqProperty.headersObject.token
        : false;
    tokenHandler._token.verify(token, phone, (tokenId) => {
      if (tokenId) {
        //lookup the user
        data.read('users', phone, (err, u) => {
          const user = { ...parseJSON(u) };
          if (!err && user) {
            delete user.password;
            callback(200, user);
          } else {
            callback(404, { error: 'Requested user was not found' });
          }
        });
      } else {
        callback(403, { error: 'Authentication failure' });
      }
    });
  } else {
    callback(404, { error: 'Requested user was not found' });
  }
};
handler._user.put = (reqProperty, callback) => {
  const phone =
    typeof reqProperty.body.phone === 'string' &&
    reqProperty.body.phone.trim().length == 11
      ? reqProperty.body.phone
      : false;
  const firstName =
    typeof reqProperty.body.firstName === 'string' &&
    reqProperty.body.firstName.trim().length > 0
      ? reqProperty.body.firstName
      : false;
  const lastName =
    typeof reqProperty.body.lastName === 'string' &&
    reqProperty.body.lastName.trim().length > 0
      ? reqProperty.body.lastName
      : false;

  const password =
    typeof reqProperty.body.password === 'string' &&
    reqProperty.body.password.trim().length > 0
      ? reqProperty.body.password
      : false;
  if (phone) {
    if (firstName || lastName || password) {
      //verify token
      let token =
        typeof reqProperty.headersObject.token === 'string'
          ? reqProperty.headersObject.token
          : false;
      tokenHandler._token.verify(token, phone, (tokenId) => {
        if (tokenId) {
          // lookup the user
          data.read('users', phone, (err, uData) => {
            const userData = { ...parseJSON(uData) };
            if (!err && userData) {
              if (firstName) {
                userData.firstName = firstName;
              }
              if (lastName) {
                userData.lastName = lastName;
              }
              if (password) {
                userData.password = hash(password);
              }
              //update to db
              data.updade('users', phone, userData, (err) => {
                if (!err) {
                  callback(200, { message: 'User was upadated successfully' });
                } else {
                  callback(500, {
                    error: 'There was a problem in server side',
                  });
                }
              });
            } else {
              callback(400, { error: 'You have a problem in your request' });
            }
          });
        } else {
          callback(403, { error: 'Authentication failure' });
        }
      });
    } else {
      callback(400, { error: 'You have a problem in your request' });
    }
  } else {
    callback(400, { error: 'Invalid phone number' });
  }
};
handler._user.delete = (reqProperty, callback) => {
  const phone =
    typeof reqProperty.queryStringObject.phone === 'string' &&
    reqProperty.queryStringObject.phone.trim().length == 11
      ? reqProperty.queryStringObject.phone
      : false;
  if (phone) {
    //verify token
    let token =
      typeof reqProperty.headersObject.token === 'string'
        ? reqProperty.headersObject.token
        : false;
    tokenHandler._token.verify(token, phone, (tokenId) => {
      if (tokenId) {
        //lookup the user
        data.read('users', phone, (err, userData) => {
          if (!err && userData) {
            data.delete('users', phone, (err) => {
              if (!err) {
                callback(200, { message: 'User was successfully deleted' });
              } else {
                callback(500, { error: 'There was a server side problem' });
              }
            });
          } else {
            callback(500, { error: 'There was a server side problem' });
          }
        });
      } else {
        callback(403, { error: 'Authentication failure' });
      }
    });
  } else {
    callback(400, { error: 'There was a problem in your request' });
  }
};
module.exports = handler;
