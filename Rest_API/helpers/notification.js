const https = require('https');
const queryString = require('querystring');
const { twilio } = require('./environment');
//module scaffolding
const notification = {};
notification.sendTwilioSms = (phone, msg, callback) => {
  //input validation
  const userPhone =
    typeof phone === 'string' && phone.trim().length === 11
      ? phone.trim()
      : false;
  const userMsg =
    typeof msg === 'string' &&
    msg.trim().length > 0 &&
    msg.trim().length <= 1600
      ? msg.trim()
      : false;
  if (userPhone && userMsg) {
    //cofigure the required payload
    const payload = {
      From: twilio.fromPhone,
      To: `+88${userPhone}`,
      Body: userMsg,
    };
    //stringify the payload
    const stringifyPayload = queryString.stringify(payload);
  } else {
    callback('Given parameters were missing or invalid');
  }
};
module.exports = notification;
