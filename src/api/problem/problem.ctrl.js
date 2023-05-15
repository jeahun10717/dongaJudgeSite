const Joi = require('joi');
const multer = require('@koa/multer');
const path = require('path')
const fs = require('fs').promises;
// const storage = require('../../lib/multer/index')
const { problem, user } = require('../../databases');
const { log } = require('console');

exports.showProblem = async(ctx)=>{
    const query = Joi.object({
        orderForm: Joi.string().valid('ASC', 'DESC', 'asc', 'desc').default('ASC').required(),
        pageNum: Joi.number().required(),
        contentsCnt: Joi.number().required(),
    }).validate(ctx.query);
    // console.log(query.error);
    if(query.error) ctx.throw(400, "잘못된 요청입니다.")

    const { orderForm, pageNum, contentsCnt } = query.value;

    const nPage = await problem.pagenatedProb(orderForm, pageNum, contentsCnt);
    const totalContentCnt = await problem.totalContentsCnt();


    //TODO: pagination 을 위한 정보 어떤 거 필요한지 알아야 함
    ctx.body = {
        status: 200,
        result: nPage,
        totalCnt: totalContentCnt
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
        prob_level: Joi.number().required(),
        prob_tag: Joi.string().required(),
        time_limit: Joi.number().default(1000), // ms 단위
    }).validate(ctx.request.body);
    console.log(ctx.request.body, "@@@@@@@@@@@@@");
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

    await fs.mkdir(path.join(__dirname, `../../public/problem/${probNum}`)) // 문제 번호에 해당하는 폴더 생성
    await fs.mkdir(path.join(__dirname, `../../public/markingData/${probNum}`)) // 문제 번호에 해당하는 폴더 생성

    await fs.mkdir(path.join(__dirname, `../../public/markingData/${probNum}/inp`)) // 문제 번호에 해당하는 inp data 폴더 생성
    await fs.mkdir(path.join(__dirname, `../../public/markingData/${probNum}/out`)) // 문제 번호에 해당하는 out data 폴더 생성


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
    const probCnt = await problem.probCnt();

    ctx.body = {
        status:200,
        probNum,
        totalProbCnt:probCnt[0].cnt
    }

}

async function mvFile(originPath, destPath){
    // const originPath = '/Users/seongjehun/Desktop/etc/test/code1.cpp'; // 예: 'C:/폴더/파일.txt'
    // const destPath = '/Users/seongjehun/Desktop/etc/test/pdf'; // 예: 'C:/다른폴더/목적지폴더'
    
    const fileName = path.basename(originPath); // 파일 이름 추출
    const destinationFilePath = path.join(destPath, fileName); // 이동할 경로 생성
    
    fs.rename(originPath, destinationFilePath, (err) => {
      if (err) {
        console.error(err);
      } else {
        console.log('filemv complete.');
      }
    });    
}

exports.upPdf = async(ctx, next) => {
    // const pdfStorage = await saveStorageToTemp(ctx, next);

    // const mulData = await multer({storage:pdfStorage}).fields([
    //     {name:"pdf", maxCount:10000}
    // ])(ctx, next);
    
    // console.log(ctx.request.file);
    const bodyData = Joi.object({
        prob_num: Joi.number().required()
    }).validate(ctx.request.body);
    const { prob_num } = bodyData.value;
    // console.log(ctx.request.file.destination);
    // console.log(ctx.request.file.filename);
    const originPath = ctx.request.file.destination + '/' + ctx.request.file.filename
    const destPath =  path.join(__dirname, `../../public/problem/${prob_num}`)
    
    await mvFile(originPath, destPath);

    if(bodyData.error) ctx.throw(400, "잘못된 요청입니다.")



    ctx.body = {
        status: 200
    }
}

exports.upInp = async(ctx, next) => {

    const bodyData = Joi.object({
        prob_num: Joi.number().required()
    }).validate(ctx.request.body);

    if(bodyData.error) ctx.throw(400, "잘못된 요청입니다.")

    const { prob_num } = bodyData.value;
    
    console.log(ctx.request.files);
    
    ctx.request.files.map(async(data) => {
        const originPath = data.destination + '/' + data.filename
        const destPath =  path.join(__dirname, `../../public/markingData/${prob_num}/inp`)
        await mvFile(originPath, destPath);
    })

    ctx.body = {
        status: 200
    }
}

exports.upOut = async(ctx, next) => {

    const bodyData = Joi.object({
        prob_num: Joi.number().required()
    }).validate(ctx.request.body);

    if(bodyData.error) ctx.throw(400, "잘못된 요청입니다.")

    const { prob_num } = bodyData.value;
    
    console.log(ctx.request.files);
    
    ctx.request.files.map(async(data) => {
        const originPath = data.destination + '/' + data.filename
        const destPath =  path.join(__dirname, `../../public/markingData/${prob_num}/out`)
        await mvFile(originPath, destPath);
    })

    ctx.body = {
        status: 200
    }
}

async function saveFile(ctx, next, probNum, type) {
    // console.log("@@@@@@@@@@@@@@@", type);
    // type 은 inp 파일들인지, out 파일들인지, pdf 들인지 확인하는 부분

    // tagType 이 inp, out 데이터를 삽입하는 경우 markingData/3/inp 형식으로 저장
    // tagType 이 pdf 데이터를 삽입하는 경우 problem/3/pdf 형식으로 저장
    // 이는 보안 떄문
    let tagType; 
    if(type == 'inp' || type == 'out'){
        tagType = 'markingData'; 
    }else if(type == 'pdf'){
        tagType = 'problem';
    }
    
    const savePath = path.join(__dirname, `../../public/${tagType}/${probNum}/${type}`);
    await fs.mkdir(path.join(savePath), {recursive: true});
    // console.log("&&&&&&&&&&&&&&", type);
    const storage = multer.diskStorage({
        destination: async function (ctx, file, cb) {
            const storePath = path.join(__dirname, `../../public/${tagType}/${probNum}/${type}`);
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

// async function saveStorageToTemp(ctx, next) {
//     const storage = multer.diskStorage({
//         destination: async function (ctx, file, cb) {
//             const storePath = path.join(__dirname, `../../public/temp`);
//             // if(!fs.exist(storePath)){
//             //     fs.mkdir(storePath);
//             // }
//             cb(null, storePath);
//         },
//         filename: function(ctx, file, cb){
//             cb(null, file.originalname);
//         }
//     });

//     return storage;
// }

exports.delProb = async(ctx, next)=>{
    params = Joi.object({
        probNum: Joi.number().required()
    }).validate(ctx.params);
    console.log(params.error);
    if(params.error) ctx.throw(400, "잘못된 요청입니다.");

    const {probNum} = params.value;

    // path 저장
    const delPath = path.join(__dirname + `../../../public/problem/${probNum}`); 
    // 위에 path 코드 동기로 안짜도 되는지 확인필요
    
    // console.log(delPath);

    const delResult = await problem.deleteProblem(probNum); // db 에서 probnum row 삭제

    await fs.rmdir(delPath, {recursive : true}, err => {
        console.log("errMsg : ", err);
    }); // 문제 번호로 폴더 삭제


    ctx.body = {
        status: 200
    }
}