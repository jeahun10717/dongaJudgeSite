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

exports.createProblem = async(ctx) => {
    //TODO : 사용자가 운영자인지 확인하는 로직 넣어야 함
    
    
    const bodyData = Joi.object({
        prob_name: Joi.string().required(),
        time_limit: Joi.number().default(1)
    }).validate(ctx.request.body);

    if(bodyData.error) {
        console.log(bodyData.error);
        ctx.throw(400);
    }
    
    let createDBret = await problem.create(bodyData.value);
    console.log(createDBret.insertId);
    const probNum = createDBret.insertId;

    fs.mkdir(path.join(__dirname, `../public/problem/${probNum}`)) // 문제 번호에 해당하는 폴더 생성
    await saveFile(probNum, "pdf");
    await saveFile(probNum, "inp");
    await saveFile(probNum, "out");
    ctx.body = {
        status:200,
        createDBret
    }

}

async function saveFile(probNum, type) {
    // type 은 inp 파일들인지, out 파일들인지, pdf 들인지 확인하는 부분
    const savePath = path.join(__dirname, `../public/problem/${probNum}/${type}`);
    await fs.mkdir(path.join(savePath)); // 

    const storage = multer.diskStorage({
        destination: async function (ctx, file, cb) {
            const storePath = path.join(__dirname, `../public/problem/${probNum}/${type}`);
            if(!fs.existsSync(storePath)){
                fs.mkdirSync(storePath);
            }
            cb(null, storePath);
        },
        filename: function(ctx, file, cb){
            cb(null, file.originalname);
        }
    });
    
    multer({storage}).fields([
        {name: `${type}`, maxCount: 50},
    ])
}

