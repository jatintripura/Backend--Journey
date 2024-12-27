const environments = {};
environments.staging = {
  port: 3000,
  envName: 'staging',
  secretKey: 'riyanalina',
  maxChecks: 5,
  twilio: {
    fromPhone: '+15005550006',
    accountSid: 'ACfe32202f8e81bf2830d8cdb435284f4c',
    authToken: '23cec7e690dbc35152a767eecea286b4',
  },
};
environments.production = {
  port: 4000,
  envName: 'production',
  secretKey: 'alinariyan',
  maxChecks: 5,
  twilio: {
    fromPhone: '+15005550006',
    accountSid: 'ACfe32202f8e81bf2830d8cdb435284f4c',
    authToken: '23cec7e690dbc35152a767eecea286b4',
  },
};
// determine which environment was passed
const currentEnvironment =
  typeof process.env.NODE_ENV === 'string' ? process.env.NODE_ENV : 'staging';

// export environment
const exportEnvironmnet =
  typeof environments[currentEnvironment] === 'object'
    ? environments[currentEnvironment]
    : environments.staging;
// export module
module.exports = exportEnvironmnet;
