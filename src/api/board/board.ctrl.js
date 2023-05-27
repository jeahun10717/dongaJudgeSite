const judge = require('../../databases/models/judge');
const problem = require('../../databases/models/problem');
const user = require('../../databases/models/user');
const board = require('../../databases/models/board');
const Joi = require('joi');

exports.create = async (ctx, next) => {
    const body = Joi.object({
        title: Joi.string().required(),
        main_text: Joi.string().required(),
        board_type: Joi.string().required(),
        prob_num: Joi.number()
    }).validate(ctx.request.body);
    // console.log(body.error);
    if(body.error) {
        // console.log(body.error.details[0].message);
        ctx.throw(400, `잘못된 요청입니다.`);
    }
    
    const { title, main_text, prob_num, board_type } = body.value;

    
    // 문제번호가 빈 필드로 들어올 때는 -1 을 전달받으므로 아래 로직 작성함
    if(prob_num == -1) {
        await board.create({
            prob_num:null,
            title,
            main_text,
            board_type,
            user_uuid: Buffer.from(ctx.request.user.UUID, 'hex'),
        })
    }else{
        const probNumState = await board.isExistProb(prob_num);
        console.log(probNumState, "@#$%^");
        if(probNumState.length == 0) ctx.throw(400, "잘못된 요청입니다(없는 문제 번호 입니다.)") 
        await board.create({
            prob_num,
            title,
            main_text,
            board_type,
            user_uuid: Buffer.from(ctx.request.user.UUID, 'hex'),
        })
    }

    ctx.body = {
        status:200,
    }
}

exports.showOne = async (ctx, next) => {
    const param = Joi.object({
        b_id: Joi.number().integer().required()
    }).validate(ctx.params)

    if(param.error) ctx.throw(400, "잘못된 요청입니다.");

    const { b_id } = param.value;
    const [result] = await board.showOne(b_id);


    ctx.body = {
        status:200,
        result
    }
}

exports.showPagenated= async (ctx, next) => {

    //TODO: prob_num 으로 조회가능하게 -> 만약 prob_num 이 undefined 면 전체 조회
    // prob_num == -1 이면 boardType 으로만 분기
    // prob_num != -1 이면 Prob_num 으로만 조회(boardType 신경 안씀)
    const query = Joi.object({
        orderForm: Joi.string().valid('ASC', 'DESC', 'asc', 'desc').default('ASC').required(),
        pageNum: Joi.number().required(),
        contentsCnt: Joi.number().required(),
        // boardType 이 'none' 이면 모든 boardType 이 적용됨
        // 'none' 을 제외한 수들은 boardType 필터가 적용됨 
        boardType: Joi.string().required(),
        // probNum 이  -1 이면 probNum 조회는 없음
        // -1을 제외한 수들은 probNum 필터가 적용됨
        probNum: Joi.number().required() 
    }).validate(ctx.query);

    if(query.error) ctx.throw(400, "잘못된 요청입니다.")

    const { orderForm, pageNum, contentsCnt, boardType, probNum } = query.value;
    
    const nPage = await board.pagenatedBoard(orderForm, pageNum, contentsCnt, boardType, probNum);
    const totalContentCnt = await board.totalContentsCnt(boardType);


    //TODO: pagination 을 위한 정보 어떤 거 필요한지 알아야 함
    ctx.body = {
        status: 200,
        result: nPage,
        totalCnt: totalContentCnt
    }
}

exports.delete = async (ctx, next) => {
    const params = Joi.object({
        b_id: Joi.number().integer().required()
    }).validate(ctx.params);

    if(params.error) ctx.throw(400, "잘못된 요청입니다.")

    const { b_id } = params.value;

    const tokenUUID = Buffer.from(ctx.request.user.UUID, 'hex');
    const [ boardInfo ] = await board.showOne(b_id);
    if(!boardInfo) {
        // b_id 에 해당하는 게시글이 없을 경우
        ctx.throw(400, "해당하는 게시글을 찾을 수 없어 게시글 삭제가 불가능합니다.")
    }
    
    console.log(boardInfo);

    const bidUUID = boardInfo.user_uuid;
    

    // console.log(tokenUUID.toString('utf-8'), '\n', bidUUID.toString('utf-8'));
    
    // 만약 쿠키에 담겨있는 토큰 user 의 uuid 와 board table 에 b_id 에 해당하는 uuid 와 비교하여 
    if(tokenUUID.toString('utf-8') == bidUUID.toString('utf-8')) await board.deleteBoard(b_id);        
    else ctx.throw(401, '현재 게시글을 지울 권한이 없습니다. 본인이 작성한 계시글이 아니면 삭제가 불가능합니다.')

    ctx.body = {
        status:200
    }
    // await board.deleteBoard(b_id)
}