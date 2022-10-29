const AWS = require('aws-sdk');
const multerS3 = require('multer-s3');
// const multerS3 = require('multer-s3-rotate');
const path = require('path');
const randomString = require('random-string');
const Joi = require('joi')
// const extWhiteList = /\b.avi\b|\b.mp4\b|\b.m4v\b|\b.mov\b|\b.jpg\b|\b.jpeg\b|\b.jpe\b|\b.png\b|\b.gif\b|\b.tiff\b/
const { AWS_S3_KEY, AWS_S3_SECRET, AWS_S3_REGION } = process.env;

const s3 = new AWS.S3({
  accessKeyId: AWS_S3_KEY,
  secretAccessKey: AWS_S3_SECRET,
  region: AWS_S3_REGION,
});

//TODO:밑의 소스에서 extention 으로 확장자 처리하면 됨
exports.getStorage = (bucket, folder)=>{
  return multerS3({
    s3: s3,
    bucket,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: function(req, file, cb){
      let extention = path.extname(file.originalname);
      // const extVer = Joi.string().regex(extWhiteList).validate(extention);
      // if(extVer.error) throw new Error(400);
      cb(null, `${folder}/${randomString({length:16})+Date.now()+extention}`);
    },
    acl: 'public-read-write',
  });
}

exports.delete = (Bucket, Key) =>{
  s3.deleteObject({
    Bucket,
    Key
  }, function(err, data){
    if(err) console.log(err, err.stack);
    // else console.log(data); // {}
  });
}
