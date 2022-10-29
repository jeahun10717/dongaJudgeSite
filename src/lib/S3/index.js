const multer = require('@koa/multer');
const init = require('./init');

const bucket = 'gusang';
const s3_newsale_folder = 'bindata';

exports.upload = ()=>{
  return multer({
    storage: init.getStorage(bucket, s3_newsale_folder)
  });
}

exports.delete = (key)=>{
  init.delete(bucket, key);
}
