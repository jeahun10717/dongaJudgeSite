const Router = require('koa-router');
const problem = new Router();
const problemCtrl = require('./problem.ctrl');
const { auth } = require('../../lib');

const multer = require('@koa/multer');
const path = require('path');
const { test } = require('../users/users.ctrl');

const storage = multer.diskStorage({
    destination: async function (ctx, file, cb) {
        const storePath = path.join(__dirname, `../../public/temp`);
        // if(!fs.exist(storePath)){
        //     fs.mkdir(storePath);
        // }
        cb(null, storePath);
    },
    filename: function(ctx, file, cb){
        cb(null, file.originalname);
    }
});

const upload = multer({ storage })


problem.use(auth.login);
problem.use(auth.level1); // 일반 로그인 유저가 접근 가능함

// problem 전체 보여주는 api
// query : {
//     orderForm: [desc or asc],
//     pageNum: [number of page],
//     contentsNum: [number of contents that display on 1 page]
// }
problem.get('/', problemCtrl.showProblem); 

problem.use(auth.level2); // 관리자만 접근 가능함
problem.post('/', problemCtrl.createProblem); // problem create

problem.post('/pdf',upload.single('pdf'), problemCtrl.upPdf); // pdf file upload api
problem.post('/inp',upload.array('inp'),  problemCtrl.upInp); // inp files upload api
problem.post('/out',upload.array('out'), problemCtrl.upOut); // pdf files upload api

problem.delete('/:probNum', problemCtrl.delProb);

problem.get('/maxProbNum', problemCtrl.showMaxProbNum);

module.exports = problem;