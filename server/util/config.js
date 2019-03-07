module.exports = {
  dbs: 'mongodb://' + (process.env.MONGODB_SERVER || '127.0.0.1') + ':27017/malldbs'
};
