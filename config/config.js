var path = require('path'),
    rootPath = path.normalize(__dirname + '/..'),
    env = process.env.NODE_ENV || 'development';

var config = {
  development: {
    root: rootPath,
    app: {
      name: 'server'
    },
    port: 3000,
    db: 'mongodb://localhost/server-development',
    waitTime: 60000,
    sauceAuth: {
      username: 'zhawtof',
      password: 'F593D327-D621-45DB-9962-FD3CEB1F1A27'
    },
    placeholderImage: 'http://img1.wikia.nocookie.net/__cb20111214222745/southpark/images/archive/9/9e/20140414233457!Eric_cartman.png',
    imagesPath: './public/img/',
    equalityThreshold: .0005
  },

  test: {
    root: rootPath,
    app: {
      name: 'server'
    },
    port: 3000,
    db: 'mongodb://localhost/server-test'
    
  },

  production: {
    root: rootPath,
    app: {
      name: 'server'
    },
    port: 3000,
    db: 'mongodb://localhost/server-production',
    waitTime: 300000,

  }
};

module.exports = config[env];
