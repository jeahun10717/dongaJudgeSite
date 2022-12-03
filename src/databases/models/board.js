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

exports.pagenatedBoard = async (orderForm, pageNum, contentsNum) =>{
    return await db.query(
        `
        select *
        from board
        order by b_id ${orderForm}
        limit ? offset ?
        `
        ,[contentsNum, pageNum * contentsNum]
    )
}

exports.totalContentsCnt = async()=>{
    const [result] = await db.query(`select count(*) cnt from board`);
    return result.cnt;
}

exports.deleteBoard = async(b_id) => {
    return await db.query('delete from board where b_id = ?', b_id);
}

exports.problemFromProbNum = async(probNum) => {
    return await db.query('select * from board where prob_num = ?', probNum);
}