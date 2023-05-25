const db = require('../db');


// 전체 수정( 예 개인정보 수정)
exports.create = async (query) => {
    return await db.query("insert into board set ?", query);
}

exports.showMaxProbNum = async () => {
    return await db.query("SELECT MAX(prob_num) AS MAX_NUM from board")
}

exports.showAll = async () => {
    return await db.query("SELECT * FROM board");
}

exports.showOne = async (boardID) => {
    return await db.query("SELECT * FROM board where b_id = ?", boardID);
}

exports.pagenatedBoard = async (orderForm, pageNum, contentsNum, boardType, probNum) =>{
    if(boardType == 'none' && probNum == -1){
        return await db.query(
            `
            select board.b_id, board.prob_num, board.title, user.name, board.main_text, board.board_type, board.regist_at
            from board left join user 
            on board.user_uuid = user.uuid
            order by b_id ${orderForm}
            limit ? offset ?
            `
            ,[contentsNum, pageNum * contentsNum]
        )
    }
    if(boardType == 'none' && probNum != -1){
        return await db.query(
            `
            select board.b_id, board.prob_num, board.title, user.name, board.main_text, board.board_type, board.regist_at
            from board left join user 
            on board.user_uuid = user.uuid
            where prob_num = ?
            order by b_id ${orderForm}
            limit ? offset ?
            `
            ,[probNum, contentsNum, pageNum * contentsNum]
        )
    }
    if(boardType != 'none' && probNum == -1){
        return await db.query(
            `
            select board.b_id, board.prob_num, board.title, user.name, board.main_text, board.board_type, board.regist_at
            from board left join user 
            on board.user_uuid = user.uuid
            where board_type = ?
            order by b_id ${orderForm}
            limit ? offset ?
            `
            ,[boardType, contentsNum, pageNum * contentsNum]
        )
    }
    if(boardType != 'none' && probNum != -1){
        return await db.query(
            `
            select board.b_id, board.prob_num, board.title, user.name, board.main_text, board.board_type, board.regist_at
            from board left join user 
            on board.user_uuid = user.uuid
            where board_type = ? and prob_num = ?
            order by b_id ${orderForm}
            limit ? offset ?
            `
            ,[boardType, probNum, contentsNum, pageNum * contentsNum]
        )
    }    
}

exports.totalContentsCnt = async(boardType)=>{
    const [result] = await db.query(`select count(*) cnt from board where board_type = ?`, boardType);
    return result.cnt;
}

exports.deleteBoard = async(b_id) => {
    return await db.query('delete from board where b_id = ?', b_id);
}

exports.problemFromProbNum = async(probNum) => {
    return await db.query('select * from board where prob_num = ?', probNum);
}

exports.isExistProb = async(probNum)=>{
    return await db.query(`select * from board where prob_num = ?`, probNum);
}