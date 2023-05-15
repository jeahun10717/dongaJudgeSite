const judge = require('../../databases/models/judge');
const problem = require('../../databases/models/problem');
const user = require('../../databases/models/user');
const board = require('../../databases/models/board');
const Joi = require('joi');


exports.create = async (ctx, next) => {
    const body = Joi.object({
        title: Joi.string().required(),
        main_text: Joi.string().required(),
        prob_num: Joi.number()
    }).validate(ctx.request.body);
    console.log(body.error);
    if(body.error) ctx.throw(400, '잘못된 요청입니다.');

    const { title, main_text, prob_num } = body.value;

    console.log(title, main_text);
    await board.create({
        prob_num,
        title,
        main_text,
        user_uuid: Buffer.from(ctx.request.user.UUID, 'hex'),
    })

    // console.log(ctx.request.user);
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

    console.log(result);

    ctx.body = {
        status:200,
        result
    }
}

exports.showPagenated= async (ctx, next) => {
    const query = Joi.object({
        orderForm: Joi.string().valid('ASC', 'DESC', 'asc', 'desc').default('ASC').required(),
        pageNum: Joi.number().required(),
        contentsCnt: Joi.number().required(),
        boardType: Joi.string().valid('Community', 'Algorithm').required()
    }).validate(ctx.query);
    // console.log(query.error);
    if(query.error) ctx.throw(400, "잘못된 요청입니다.")

    const { orderForm, pageNum, contentsCnt, boardType } = query.value;

    const nPage = await board.pagenatedBoard(orderForm, pageNum, contentsCnt, boardType);
    const totalContentCnt = await board.totalContentsCnt();


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