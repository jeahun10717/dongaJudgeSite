const multer = require('@koa/multer');
const Joi = require('joi');
const axios = require('axios');
const path = require('path');
const { params } = require('../users');
const { user, judge, problem } = require('../../databases');
const fs = require('fs');

const {c, cpp, node, python, java} = require('compile-run');
const { stdin } = require('process');

// const spawn = require('child_process').spawnSync;

exports.judge = async (ctx, next)=>{
    const bodyVal = Joi.object({
        prob_num: Joi.number().required(),
        code: Joi.string().required(),
        prog_lang: Joi.string().required(),
    }).validate(ctx.request.body);
    
    if(bodyVal.error) { // 에러 핸들링
        console.log(bodyVal.error);
        ctx.throw(400); 
    }


    
    const { UUID } = ctx.request.user;
    const bufUUID = Buffer.from(UUID, 'hex') 
    console.log(bufUUID);
    const userInfo = await user.isExistFromUUID(bufUUID);
    console.log(userInfo);
    const { prob_num, code, prog_lang } = bodyVal.value;
    const probInfo  = await problem.timeLimit(prob_num);
    const time_limit = probInfo[0].time_limit;
    // console.log();
    console.log(time_limit, "@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@");

    const inpDirPath = path.join(__dirname, `../../public/problem/${prob_num}/inp/`)
    const outDirPath = path.join(__dirname, `../../public/problem/${prob_num}/out/`)
    const inpFileList = fs.readdirSync(inpDirPath)
    const outFileList = fs.readdirSync(outDirPath)

    let fileLen;
    let compileResult = [];
    let errorMsgArr = [];
    if(inpFileList.length != outFileList.length) ctx.throw(500, "inp 파일과 out 파일의 개수가 다릅니다. 관리자에게 문의하세요.")
    else fileLen = inpFileList.length;
    let judgeresult, correctCnt = 0;
    for (let fileIdx = 0; fileIdx < fileLen; fileIdx++) {
        
        const inpFileData = fs.readFileSync(path.join(inpDirPath + inpFileList[fileIdx]), 'utf-8');
        const outFileData = fs.readFileSync(path.join(outDirPath + outFileList[fileIdx]), 'utf-8');
        let sourcecode = code;
        let resultPromise = cpp.runSource(sourcecode, {stdin:inpFileData, timeout:1000});
        const compilerResult =  await resultPromise
        .then((result) => {
            // console.log("@@@@@", result);
            console.log(result.stdout);
            if(outFileData == result.stdout) { // 해당 채점 데이터가 정답일 경우
                if("errorType" in result){ // errorType 필드가 존재할 때 
                    errorMsgArr.push(result.errorType);
                }
                correctCnt++;
                compileResult.push({
                    dataNum : fileIdx,
                    judgeResult: "correct",
                    result:result
                })
            }else{ // 해당 채점 데이터가 컴파일 에러나 오답일 경우
                if("errorType" in result){ // errorType 필드가 존재할 때 
                    errorMsgArr.push(result.errorType);
                }
                compileResult.push({
                    dataNum : fileIdx,
                    judgeResult: "incorrect",
                    result:result
                })
            }
        })
        .catch((err) => {
            console.log(err);
        })
    }

    console.log(compileResult, "##############################");

    // console.log("--------->", compileResult);
    // console.log("--------->", inpFileList);
    // console.log("--------->", outFileList);

    const filteredErrMsg = errorMsgArr.filter((item, index) => errorMsgArr.indexOf(item) === index);
    const probState = fileLen / correctCnt == 1
    console.log(probState);
    // const result = judge.insert({
    //     prob_num, 
    //     code, 
    //     prog_lang,
    //     user_uuid: bufUUID,
    //     time_limit,

    // })

     ctx.body = {
         status:200,
         totalJudgeDataCnt: fileLen,
         correctCnt,
         errMsg: filteredErrMsg
     }
}