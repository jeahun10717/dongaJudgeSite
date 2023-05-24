const Joi = require('joi');
const path = require('path');
const { user, judge, problem } = require('../../databases');
const fs = require('fs');

const {c, cpp, node, python, java} = require('compile-run');

// const spawn = require('child_process').spawnSync;


exports.judge = async (ctx, next)=>{
    const bodyVal = Joi.object({
        prob_num: Joi.number().required(),
        code: Joi.string().required(),
        prog_lang: Joi.string().required(),
    }).validate(ctx.request.body);
    
    if(bodyVal.error) { // 에러 핸들링
        ctx.throw(400); 
    }


    const { UUID } = ctx.request.user;
    const bufUUID = Buffer.from(UUID, 'hex');
    // console.log(bufUUID);
    const userInfo = await user.isExistFromUUID(bufUUID);
    // console.log(userInfo);
    const { prob_num, code, prog_lang } = bodyVal.value;
    const probInfo  = await problem.problemFromProbNum(prob_num);
    // console.log(probInfo);
    let time_limit = probInfo[0].time_limit;
    time_limit = parseInt(time_limit * 11 / 10); // 채점 환경을 고려하여 10% 정도의 채점시간의 여유를 두는 부분


    const inpDirPath = path.join(__dirname, `../../public/markingData/${prob_num}/inp/`)
    const outDirPath = path.join(__dirname, `../../public/markingData/${prob_num}/out/`)
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
        // console.log(time_limit);
        let resultPromise = cpp.runSource(sourcecode, {stdin:inpFileData, timeout:time_limit});
        const compilerResult =
        await resultPromise.then((result) => {
            // console.log("@@@@@", result);
            // console.log(result.stdout);
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

    // console.log(compileResult, "##############################");

    // console.log("--------->", compileResult);
    // console.log("--------->", inpFileList);
    // console.log("--------->", outFileList);

    const filteredErrMsg = errorMsgArr.filter((item, index) => errorMsgArr.indexOf(item) === index);
    const probState = (fileLen == correctCnt);
    const isExistArr = await judge.isExistFromUUID(bufUUID, prob_num);
    // console.log(isExistJudgeResult);
    // console.log(isEmpty);
    // console.log(probState);
    let result;
    // if(isExistArr.length == 0){ // uuid 에 해당하는 유저가 prob_num 문제를 제출한 적이 없을 경우
    result = judge.insert({
        prob_num,
        code,
        prog_lang,
        user_uuid: bufUUID,
        time_limit,
        prob_state: probState,
    })

    problem.judgeResultUpdate(probState, prob_num); // problem 의 submit_cnt, correct_cnt update 로직
    // }else{
        // console.log("&****************^&*%*%^^*%*%^*^&%*^*^&");
        // result = judge.update(bufUUID, {
        //     prob_num,
        //     code,
        //     prog_lang,
        //     user_uuid: bufUUID,
        //     time_limit,
        //     prob_state: probState,
        //     attacked_cnt: 0,
        //     depence_cnt: 0,
        //     weak_status: 0,
        //     date: new Date()
        // }, prob_num)
    // }
    
    ctx.body = {
        status:200,
        totalJudgeDataCnt: fileLen,
        correctCnt,
        errMsg: filteredErrMsg
    }
}

exports.attack = async (ctx, next) => {
    const bodyData = Joi.object({
        attackJudgeUUID: Joi.number().integer().required(), // 공격을 진행할 judge 번호
        attackProbNum: Joi.number().integer().required(),
        attackDataSet: Joi.string().required(), // 공격을 진행할 데이터 셋
    }).validate(ctx.request.body);
    // console.log(bodyData.error);
    if(bodyData.error) ctx.throw(400, "잘못된 요청입니다");
    // console.log(bodyData.value);
    // 유저 A 가 B 를 공격한다고 가정
    const { attackJudgeUUID, attackProbNum, attackDataSet } = bodyData.value;
    // 1. A 가 데이터셋을 작성해서 attackDataSet 으로 삽입 후 attackJudgeUUID 에 해당하는 채점데이터 공격
    // 1.1. 만약 A 가 만든 데이터 셋 검증 --> compile-run 을 통해 데이터 셋 검증
    const judgeData = await judge.showJudgeFromUUID(attackJudgeUUID);
    const probInfo  = await problem.problemFromProbNum(attackProbNum);
    // console.log(judgeData);
    // console.log(probInfo[0]);
    const correctCode = probInfo[0].correct_code; // attackProblem 에 해당하는 정답코드
    const timeLimit = probInfo[0].time_limit * 11 / 10; // attackProblem 에 해당하는 제한시간
    const depenceCode = judgeData[0].code
    // console.log(depenceCode);
    // console.log(correctCode);

    let compileResult = [];
    let errorMsgArr = [];
    // console.log(time_limit);
    let resultPromise = cpp.runSource(correctCode, {stdin:attackDataSet, timeout:timeLimit});
    const validateInpDataSet =  
    await resultPromise.then((result) => {
        // console.log("@@@@@", result);
        // console.log(result.stdout);
        if("errorType" in result){ // errorType 필드가 존재할 때 
            errorMsgArr.push(result.errorType);
        }
        compileResult.push({
            result:result
        })    
    })
    .catch((err) => {
        console.log(err);
    })
    console.log(compileResult[0].result.stdout);
    // console.log(compile);
    // console.log(errorMsgArr);
    // console.log();
        
    if(errorMsgArr.length){ // compile-error 가 발생했을 경우
        ctx.throw(400, `입력 데이터셋에 문제가 있습니다. 확인 후 다시 요청십시오. \n${errorMsgArr}`)
    }
    const attStdOut = compileResult[0].result.stdout
    let depenceResultPromise = cpp.runSource(depenceCode, {stdin:attackDataSet, timeout:timeLimit});
    let depenceCompileResult = []; // depence 컴파일 했을 때 결과 저장 변수
    let depenceErrorMsgArr = [];
    const validateDepenceCode =  
    await depenceResultPromise.then((result) => {
        // 공격자의 inpData 로 부터 나온 stdout 과 depence code 의 stdcout 비교
        if(attStdOut == result.stdout) { // 공격자의 stdout 과 방어자의 stdout 이 일치할 때
            
            if("errorType" in result){ // errorType 필드가 존재할 때 
                depenceErrorMsgArr.push(result.errorType);
            }
            depenceCompileResult.push({
                judgeResult: "correct",
                result:result
            })
        }
    })
    .catch((err) => {
        console.log(err);
    })
    // depenceErrorMsg
    // console.log(depenceCompileResult[0].judgeResult);
    if(depenceCompileResult[0].judgeResult == 'correct'){ // depence 성공시
        const result = await judge.depenceSuccess(attackJudgeUUID);
        // console.log(result);
        ctx.body = {
            status: 200,
            attStatus: "Fail"
        }
        // console.log("@@@@@@@@@@@@@@@@@@@@@");
    }else{
        const result = await judge.depenceFail(attackJudgeUUID);
        // TODO: 나중에 방어실패 관련한 데이터 셋 만들어서 테스트 해 봐야 함
        // TODO: 방어 실패 시 depenceErrorMsgArr 에 담기는지도 확인 요함
        ctx.body = {
            status: 200,
            attStatus: "Success"
        }
    }


    // 1.2. problem 의 correct_code 로 데이터 셋 검증
    // 1.3. 데이터 셋 검증 통과 못하면 에러 뱉고
    // 1.3. 데이터 셋 검증 통과 시 2. 로 진행
    // 2. B 의 코드로 A 가 제공한 데이터셋으로 검증
    // 2.1. B 의 코드가 검증을 견뎌 냈으면 judge 의 depence cnt, attacked_cnt 올려줌
    // 2.2. B 의 코드가 검증을 견뎌내지 못했으면 judge 의 attacked_cnt 올려주고 weak_staus 1로 수정
    
    
}

exports.showJudge = async (ctx, next) => {
    const query = Joi.object({
        showFlag: Joi.string().valid('all', 'some').default('all').required(),
        probNum: Joi.number().default(-1).required(),
        orderForm: Joi.string().valid('ASC', 'DESC', 'asc', 'desc').default('ASC').required(),
        pageNum: Joi.number().required(),
        contentsCnt: Joi.number().required(),
    }).validate(ctx.query);
    // console.log(query.error);
    if(query.error) ctx.throw(400, "잘못된 요청입니다.")

    const { showFlag, probNum, orderForm, pageNum, contentsCnt } = query.value;

    let nPage;
    if(showFlag == 'all'){
        nPage = await judge.pagenatedJudge(orderForm, pageNum, contentsCnt);
    }else if(showFlag == 'some'){
        nPage = await judge.pagenatedOneProbJudge(probNum, orderForm, pageNum, contentsCnt);
    }
    

    

    const totalContentCnt = await judge.totalContentsCnt();


    //TODO: pagination 을 위한 정보 어떤 거 필요한지 알아야 함
    ctx.body = {
        status: 200,
        result: nPage,
        totalCnt: totalContentCnt
    }

}

exports.showJudgeByUUID = async(ctx, next)=>{
    const param = Joi.object({
        judgeUUID: Joi.string().required()
    }).validate(ctx.params);

    if(param.error) ctx.throw(400, "잘못된 요청입니다");

    const {judgeUUID} = param.value;

    const judgeResult = await judge.showJudgeFromUUID(judgeUUID);
    console.log(judgeResult);

    ctx.body = {
        status:200,
        result: judgeResult
    }
}




