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
    //configure the request details
    const requestDetailsObject = {
      hostNmae: 'api.twilio.com',
      method: 'POST',
      path: `/2010-04-01/Accounts/${twilio.accountSid}/Messages.json`,
      auth: `${twilio.accountSid}:${twilio.authToken}`,
      headers: {
        'Content-type': 'application/x-www-form-urlencoded',
      },
    };
    //instans the request object
    const req = https.request(requestDetailsObject, (res) => {
      //get the status of the send request
      const status = res.statusCode;
      if (status === 200 || status === 2001) {
        callback(false);
      } else {
        callback(`Status code return was ${status}`);
      }
    });
    req.on('error', (e) => {
      callback(e);
    });
    req.write(stringifyPayload);
    req.end();
  } else {
    callback('Given parameters were missing or invalid');
  }
};
module.exports = notification;
