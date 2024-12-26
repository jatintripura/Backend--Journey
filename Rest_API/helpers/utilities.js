const crypto = require('crypto');
const environment = require('./environment');
const utilities = {};

// parse string to object
utilities.parseJSON = (jsonString) => {
  let output = {};
  try {
    output = JSON.parse(jsonString);
  } catch {
    output = {};
  }

  return output;
};
// hash string
utilities.hash = (str) => {
  if (typeof str === 'string' && str.length > 0) {
    let hash = crypto
      .createHmac('sha256', environment.secretKey)
      .update(str)
      .digest('hex');
    return hash;
  } else {
    return false;
  }
};

// created random string
utilities.createRandomString = (strlength) => {
  let length = strlength;
  length = typeof strlength === 'number' && strlength > 0 ? strlength : false;
  if (length) {
    let possibleCharacters = 'abcdefghijklmnopqrstuvwxyz123456789';
    let output = '';
    for (let i = 1; i <= length; i += 1) {
      let randomCharacter = possibleCharacters.charAt(
        Math.floor(Math.random() * possibleCharacters.length)
      );
      output += randomCharacter;
    }
    return output;
  } else {
    return false;
  }
};
module.exports = utilities;
