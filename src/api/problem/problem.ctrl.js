const Joi = require('joi');
const multer = require('@koa/multer');
const path = require('path')
const fs = require('fs').promises;
// const storage = require('../../lib/multer/index')
const { problem, user } = require('../../databases');

exports.showProblem = async(ctx)=>{
    const { UUID } = ctx.request.user;
    const bufUUID = Buffer.from(UUID, 'hex');

    const result = await user.isExistFromUUID(bufUUID);
    // result.uuid = UUID;
    // console.log(result.auth);
    const userAuthLevel = result.auth; // 1은 일반유저, 2는 관리자 유저
    if(userAuthLevel == 1) { // 일반 유저일 때의 response

    }else if(userAuthLevel == 2){ // 관리자 유저일 떄의 response
        
    }

}

exports.showMaxProbNum = async(ctx, next)=>{
    const maxProbNum = await problem.showMaxProbNum();
    // console.log(maxProbNum[0].MAX_NUM);
    ctx.body = {
        status: 200,
        probNum: maxProbNum[0].MAX_NUM + 1
    }
}

exports.createProblem = async(ctx, next) => {
    //TODO : 사용자가 운영자인지 확인하는 로직 넣어야 함
    
    const bodyData = Joi.object({
        prob_name: Joi.string().required(),
        time_limit: Joi.number().default(1)
    }).validate(ctx.request.body);
    console.log(ctx.request.body);
    if(bodyData.error) {
        // console.log(ctx.request);
        // console.log(ctx);
        // console.log(bodyData.error);
        // console.log(bodyData.value);
        ctx.throw(400);
    }
    
    let createDBret = await problem.create(bodyData.value);
    console.log(createDBret.insertId);
    const probNum = createDBret.insertId;

    fs.mkdir(path.join(__dirname, `../../public/problem/${probNum}`)) // 문제 번호에 해당하는 폴더 생성
    // const inpStorage = await saveFile(ctx, next, probNum, "inp");
    // const outStorage = await saveFile(ctx, next, probNum, "out");
    // const pdfStorage = await saveFile(ctx, next, probNum, "pdf");

    // // await upload.single('img')(ctx, next);
    // await multer({storage:inpStorage}).array([
    //     {name:"inp", maxCount:10000}
    // ])(ctx, next);
    // await multer({storage:outStorage}).array([
    //     {name:"out", maxCount:10000}
    // ])(ctx, next);
    // await multer({storage:pdfStorage}).array([
    //     {name:"pdf", maxCount:10000}
    // ])(ctx, next);
    

    ctx.body = {
        status:200,
        createDBret
    }

}
exports.upPdf = async(ctx, next) => {
    const maxProbNum = await problem.showMaxProbNum();
    const probNum = maxProbNum[0].MAX_NUM;
    const pdfStorage = await saveFile(ctx, next, probNum, "pdf");

    await multer({storage:pdfStorage}).fields([
        {name:"pdf", maxCount:10000}
    ])(ctx, next);

    ctx.body = {
        status: 200
    }
}

exports.upInp = async(ctx, next) => {
    const maxProbNum = await problem.showMaxProbNum();
    const probNum = maxProbNum[0].MAX_NUM;
    const inpStorage = await saveFile(ctx, next, probNum, "inp");

    await multer({storage:inpStorage}).fields([
        {name:"inp", maxCount:10000}
    ])(ctx, next);

    ctx.body = {
        status: 200
    }
}

exports.upOut = async(ctx, next) => {
    const maxProbNum = await problem.showMaxProbNum();
    const probNum = maxProbNum[0].MAX_NUM;
    const outStorage = await saveFile(ctx, next, probNum, "out");

    await multer({storage:outStorage}).fields([
        {name:"out", maxCount:10000}
    ])(ctx, next);

    ctx.body = {
        status: 200
    }
}

async function saveFile(ctx, next, probNum, type) {
    // console.log("@@@@@@@@@@@@@@@", type);
    // type 은 inp 파일들인지, out 파일들인지, pdf 들인지 확인하는 부분
    const savePath = path.join(__dirname, `../../public/problem/${probNum}/${type}`);
    await fs.mkdir(path.join(savePath), {recursive: true});
    // console.log("&&&&&&&&&&&&&&", type);
    const storage = multer.diskStorage({
        destination: async function (ctx, file, cb) {
            const storePath = path.join(__dirname, `../../public/problem/${probNum}/${type}`);
            // if(!fs.exist(storePath)){
            //     fs.mkdir(storePath);
            // }
            cb(null, storePath);
        },
        filename: function(ctx, file, cb){
            cb(null, file.originalname);
        }
    });
    
    // console.log("&&&&&&&&&&&&&&", type);
    return storage;
    // multer({storage:storage}).fields([
    //     {name: `${type}`, maxCount: 50}
    // ]);
}

