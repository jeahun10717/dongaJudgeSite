const Router = require('koa-router');
const score = new Router();
const scoreCtrl = require('./score.ctrl');
const { auth } = require('../../lib');

const multer = require('@koa/multer')
const path = require('path');
const storage = multer.diskStorage({
    destination: function(ctx, file, cb){
        cb(null, `./src/multerFileTest/`);
    },
    filename: function(ctx, file, cb) {
        cb(null, file.originalname); // 업로드 할 파일 원래 이름으로 저장
    }
})
const upload = multer({
    storage: storage
});

score.get('/test', scoreCtrl.test);
score.post('/multerTest', upload.fields([{name: 'file'}]),scoreCtrl.multerTest);

module.exports = score;