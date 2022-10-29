const Joi = require('joi');
const multer = require('@koa/multer');
const path = require('path')
const fs = require('fs');
const { problem, user } = require('../../databases');

exports.saveFiles = async(ctx) => {
    const savePath = path.join(__dirname, `../public/problem/${probNum}/pdf`);
    fs.mkdir(path.join());

    const storage = multer.diskStorage({
        destination: async function (ctx, file, cb) {
            const storePath = path.join(__dirname, `../public/problem/${probNum}/pdf`);
            if(!fs.existsSync(storePath)){
                fs.mkdirSync(storePath);
            }
            cb(null, storePath);
        },
        filename: function(ctx, file, cb){
            cb(null, file.originalname);
        }
    });
}

