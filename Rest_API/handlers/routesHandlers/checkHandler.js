//dependencis
const data = require('../../lib/data');
const { hash } = require('../../helpers/utilities');
const { parseJSON, createRandomString } = require('../../helpers/utilities');
const tokenHandler = require('./tokenHandler');
const { maxChecks } = require('../../helpers/environment');
//module scalffolding
const handler = {};
handler.checkHandler = (reqProperty, callback) => {
  const acceptedMethod = ['get', 'post', 'put', 'delete'];
  if (acceptedMethod.indexOf(reqProperty.method) > -1) {
    handler._check[reqProperty.method](reqProperty, callback);
  } else {
    callback(400);
  }
};

handler._check = {};

handler._check.post = (reqProperty, callback) => {
  let protocol =
    typeof reqProperty.body.protocol === 'string' &&
    ['http', 'https'].indexOf(reqProperty.body.protocol) > -1
      ? reqProperty.body.protocol
      : false;
  let url =
    typeof reqProperty.body.url === 'string' &&
    reqProperty.body.url.trim().length > 0
      ? reqProperty.body.url
      : false;
  let method =
    typeof reqProperty.body.method === 'string' &&
    ['GET', 'POST', 'PUT', 'DELETE'].indexOf(reqProperty.body.method) > -1
      ? reqProperty.body.method
      : false;
  let successCodes =
    typeof reqProperty.body.successCodes === 'object' &&
    reqProperty.body.successCodes instanceof Array
      ? reqProperty.body.successCodes
      : false;
  let timeOutSeconds =
    typeof reqProperty.body.timeOutSeconds === 'number' &&
    reqProperty.body.timeOutSeconds % 1 === 0 &&
    reqProperty.body.timeOutSeconds >= 1 &&
    reqProperty.body.timeOutSeconds <= maxChecks
      ? reqProperty.body.timeOutSeconds
      : false;
  if (protocol && url && method && successCodes && timeOutSeconds) {
    let token =
      typeof reqProperty.headersObject.token === 'string'
        ? reqProperty.headersObject.token
        : false;
    //lookup the user phone
    data.read('tokens', token, (err, tokenData) => {
      if (!err && tokenData) {
        let userPhone = parseJSON(tokenData).phone;
        //lookup the userData
        data.read('users', userPhone, (err, userData) => {
          if (!err && userData) {
            tokenHandler._token.verify(token, userPhone, (tokenIsValid) => {
              if (tokenIsValid) {
                let userObject = parseJSON(userData);
                let userChecks =
                  typeof userObject.checks === 'object' &&
                  userObject.checks instanceof Array
                    ? userObject.checks
                    : [];
                if (userChecks.length < maxChecks) {
                  let checkId = createRandomString(20);
                  let checkObject = {
                    id: checkId,
                    userPhone,
                    protocol,
                    url,
                    method,
                    successCodes,
                    timeOutSeconds,
                  };
                  //save the object
                  data.create('checks', checkId, checkObject, (err) => {
                    if (!err) {
                      //add check id to userobject
                      userObject.check = userChecks;
                      userObject.check.push(checkId);
                      //save the new user data
                      data.updade('users', userPhone, userObject, (err) => {
                        if (!err) {
                          callback(200, checkObject);
                        } else {
                          callback(500, {
                            error: 'There was a problem in the server side',
                          });
                        }
                      });
                    } else {
                      callback(500, {
                        error: 'There was a problem in the server side',
                      });
                    }
                  });
                } else {
                  callback(401, {
                    error: 'User has already reach max check limit',
                  });
                }
              } else {
                callback(403, { error: 'Token is not valid' });
              }
            });
          } else {
            callback(403, { error: 'User not found' });
          }
        });
      } else {
        callback(403, { error: 'Authentication problem' });
      }
    });
  } else {
    callback(400, { error: 'You have a problem in your request 1' });
  }
};
handler._check.get = (reqProperty, callback) => {
  const id =
    typeof reqProperty.queryStringObject.id === 'string' &&
    reqProperty.queryStringObject.id.trim().length == 20
      ? reqProperty.queryStringObject.id
      : false;
  if (id) {
    //lookup check
    data.read('checks', id, (err, checkData) => {
      if (!err && checkData) {
        let token =
          typeof reqProperty.headersObject.token === 'string'
            ? reqProperty.headersObject.token
            : false;
        tokenHandler._token.verify(
          token,
          parseJSON(checkData).userPhone,
          (tokenIsValid) => {
            if (tokenIsValid) {
              callback(200, parseJSON(checkData));
            } else {
              callback(400, { error: 'Authentication failure' });
            }
          }
        );
      } else {
        callback(400, { error: 'You have a problem in your request' });
      }
    });
  } else {
    callback(400, { error: 'You have a problem in your request' });
  }
};
handler._check.put = (reqProperty, callback) => {
  const id =
    typeof reqProperty.body.id === 'string' &&
    reqProperty.body.id.trim().length === 20
      ? reqProperty.body.id
      : false;
  let protocol =
    typeof reqProperty.body.protocol === 'string' &&
    ['http', 'https'].indexOf(reqProperty.body.protocol) > -1
      ? reqProperty.body.protocol
      : false;
  let url =
    typeof reqProperty.body.url === 'string' &&
    reqProperty.body.url.trim().length > 0
      ? reqProperty.body.url
      : false;
  let method =
    typeof reqProperty.body.method === 'string' &&
    ['GET', 'POST', 'PUT', 'DELETE'].indexOf(reqProperty.body.method) > -1
      ? reqProperty.body.method
      : false;
  let successCodes =
    typeof reqProperty.body.successCodes === 'object' &&
    reqProperty.body.successCodes instanceof Array
      ? reqProperty.body.successCodes
      : false;
  let timeOutSeconds =
    typeof reqProperty.body.timeOutSeconds === 'number' &&
    reqProperty.body.timeOutSeconds % 1 === 0 &&
    reqProperty.body.timeOutSeconds >= 1 &&
    reqProperty.body.timeOutSeconds <= maxChecks
      ? reqProperty.body.timeOutSeconds
      : false;
  if (id) {
    if (protocol || url || method || successCodes || timeOutSeconds) {
      data.read('checks', id, (err, checkData) => {
        if (!err && checkData) {
          let checkObject = parseJSON(checkData);
          let token =
            typeof reqProperty.headersObject.token === 'string'
              ? reqProperty.headersObject.token
              : false;
          tokenHandler._token.verify(
            token,
            checkObject.userPhone,
            (tokenIsValid) => {
              if (tokenIsValid) {
                if (protocol) {
                  checkObject.protocol = protocol;
                }
                if (url) {
                  checkObject.url = url;
                }
                if (method) {
                  checkObject.method = method;
                }
                if (successCodes) {
                  checkObject.successCodes = successCodes;
                }
                if (timeOutSeconds) {
                  checkObject.timeOutSeconds = timeOutSeconds;
                }
                //store the check object
                data.updade('checks', id, checkObject, (err) => {
                  if (!err) {
                    callback(200, checkObject);
                  } else {
                    callback(400, { error: 'There was a server side problem' });
                  }
                });
              } else {
                callback(400, { error: 'Authentication failure' });
              }
            }
          );
        } else {
          callback(500, { error: 'There was a server side problem' });
        }
      });
    } else {
      callback(400, { error: 'You must provide at least one field to update' });
    }
  } else {
    callback(400, { error: 'You have a problem in your request' });
  }
};
handler._check.delete = (reqProperty, callback) => {
  const id =
    typeof reqProperty.queryStringObject.id === 'string' &&
    reqProperty.queryStringObject.id.trim().length == 20
      ? reqProperty.queryStringObject.id
      : false;
  if (id) {
    //lookup check
    data.read('checks', id, (err, checkData) => {
      if (!err && checkData) {
        let token =
          typeof reqProperty.headersObject.token === 'string'
            ? reqProperty.headersObject.token
            : false;
        tokenHandler._token.verify(
          token,
          parseJSON(checkData).userPhone,
          (tokenIsValid) => {
            if (tokenIsValid) {
              //delete the check data
              data.delete('checks', id, (err) => {
                if (!err) {
                  data.read(
                    'users',
                    parseJSON(checkData).userPhone,
                    (err, userData) => {
                      let userObject = parseJSON(userData);
                      if (!err && userData) {
                        let userChecks =
                          typeof userObject.check === 'object' &&
                          userObject.check instanceof Array
                            ? userObject.check
                            : [];
                        //remove the deleted check id
                        let checkPossition = userChecks.indexOf(id);
                        if (checkPossition > -1) {
                          userChecks.splice(checkPossition, 1);
                          //reset the userdata
                          userObject.check = userChecks;
                          data.updade(
                            'users',
                            userObject.phone,
                            userObject,
                            (err) => {
                              if (!err) {
                                callback(200);
                              } else {
                                callback(500, { error: 'Server side problem' });
                              }
                            }
                          );
                        } else {
                          callback(500, {
                            error:
                              'The check id that yor are trying to remove is not found in user',
                          });
                        }
                      } else {
                        callback(500, { error: 'Server side problem' });
                      }
                    }
                  );
                } else {
                  callback(500, { error: 'Server side problem' });
                }
              });
            } else {
              callback(400, { error: 'Authentication failure' });
            }
          }
        );
      } else {
        callback(400, { error: 'You have a problem in your request' });
      }
    });
  } else {
    callback(400, { error: 'You have a problem in your request' });
  }
};
module.exports = handler;
