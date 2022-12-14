const db = require('../db');

// 전체 수정( 예 개인정보 수정)
exports.update = async (id, query, prob_num)=>{
    return await db.query("UPDATE judge set ? where user_uuid = ? and prob_num = ?",[query, id, prob_num]);
}

exports.insert = async (query) => {
    return await db.query("insert judge set ?", query);
}

exports.isExistFromUUID = async (UUID, prob_num)=>{
    // return await db.query("select * from judge where user_uuid = ? and prob_num = ?", [UUID, prob_num]);
    return await db.query("select * from judge where user_uuid = ? and prob_num = ?", [UUID, prob_num]);
}

exports.pagenatedJudge = async (orderForm, pageNum, contentsNum) =>{
    // orderFrom : asc || desc
    // pageNum : 페이지 번호
    // contentsNum : 한 페이지에 보여줄 컨텐츠 개수
    return await db.query(
        `
        select *
        from judge
        order by prob_num ${orderForm}
        limit ? offset ?
        `
        ,[contentsNum, pageNum * contentsNum]
    )
}

exports.pagenatedOneProbJudge = async (probNum, orderForm, pageNum, contentsNum) =>{
    // orderFrom : asc || desc
    // pageNum : 페이지 번호
    // contentsNum : 한 페이지에 보여줄 컨텐츠 개수
    return await db.query(
        `
        select *
        from judge
        where prob_num = ?
        order by prob_num ${orderForm}
        limit ? offset ?
        `
        ,[probNum, contentsNum, pageNum * contentsNum]
    )
}

exports.totalContentsCnt = async()=>{
    const [result] = await db.query(`select count(*) cnt from judge`);
    return result.cnt;
}

exports.showJudgeFromUUID = async(UUID) => {
    return await db.query(`select * from judge where uuid = ?`, UUID);
}

exports.depenceSuccess = async(UUID) => {
    return await db.query(`update judge set 
    attacked_cnt = attacked_cnt + 1, 
    depence_cnt = depence_cnt + 1
    where uuid = ?`, 
    UUID)
}

exports.depenceFail = async(UUID) => {
    return await db.query(`update judge set
    attacked_cnt = attacked_cnt + 1,
    weak_status = TRUE
    where uuid = ?`,
    UUID)
}