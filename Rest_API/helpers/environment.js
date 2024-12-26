const environments = {};
environments.staging = {
  port: 3000,
  envName: 'staging',
  secretKey: 'riyanalina',
};
environments.production = {
  port: 4000,
  envName: 'production',
  secretKey: 'alinariyan',
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
