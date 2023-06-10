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
        select j.uuid, u.nick_name, u.name,
        j.prob_num, j.time_limit, j.prog_lang, j.code, j.date
            from judge as j left join user as u
            on j.user_uuid = u.uuid
            order by j.prob_num ${orderForm}
            limit ? offset ?;
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
        select j.uuid, u.nick_name, u.name,
        j.prob_num, j.time_limit, j.prog_lang, j.code, j.date
            from judge as j left join user as u
            on j.user_uuid = u.uuid
            where j.prob_num = ?
            order by j.prob_num ${orderForm}
            limit ? offset ?;
        `
        ,[probNum, contentsNum, pageNum * contentsNum]
    )
}

exports.pagenatedJudgeCnt = async (orderForm) =>{
    // orderFrom : asc || desc
    // pageNum : 페이지 번호
    // contentsNum : 한 페이지에 보여줄 컨텐츠 개수
    return await db.query(
        `
        select 
            count(*) as cnt
        from judge as j left join user as u
        on j.user_uuid = u.uuid
        order by j.prob_num ${orderForm};
        `
    )
}

exports.pagenatedOneProbJudge = async (probNum, orderForm, pageNum, contentsNum) =>{
    // orderFrom : asc || desc
    // pageNum : 페이지 번호
    // contentsNum : 한 페이지에 보여줄 컨텐츠 개수
    return await db.query(
        `
        select j.uuid, u.nick_name, u.name,
        j.prob_num, j.time_limit, j.prog_lang, j.code, j.date
            from judge as j left join user as u
            on j.user_uuid = u.uuid
            where j.prob_num = ?
            order by j.prob_num ${orderForm}
            limit ? offset ?;
        `
        ,[probNum, contentsNum, pageNum * contentsNum]
    )
}

exports.pagenatedOneProbJudgeCnt = async (probNum, orderForm) =>{
    // orderFrom : asc || desc
    // pageNum : 페이지 번호
    // contentsNum : 한 페이지에 보여줄 컨텐츠 개수
    return await db.query(
        `
        select 
            count(*) cnt
        from judge as j left join user as u
        on j.user_uuid = u.uuid
        where j.prob_num = ?
        order by j.prob_num ${orderForm};
        `
        ,[probNum]
    )
}

exports.totalContentsCnt = async()=>{
    const [result] = await db.query(`select count(*) cnt from judge`);
    return result.cnt;
}

exports.showJudgeFromUUID = async(UUID) => {
    return await db.query(`select * from judge where uuid = ?`, UUID);
}

exports.showPagenatedJudgeFromUUID = async(UUID, probNum, orderForm, pageNum, contentsNum) => {
    return await db.query(
        `
        SELECT 
            j.uuid, u.nick_name, u.name, j.prob_num, 
            j.time_limit, j.prog_lang, j.code, j.date
        FROM judge AS j LEFT JOIN user AS u ON j.user_uuid = u.uuid
        WHERE j.user_uuid = ? and j.prob_num = ?
        ORDER BY j.prob_num ${orderForm}
        LIMIT ? OFFSET ?;
        `, [UUID, probNum, contentsNum, pageNum * contentsNum]
    )
}

exports.showPagenatedJudgeFromUUIDCnt = async(UUID, probNum, orderForm) => {
    return await db.query(
        `
        SELECT 
            COUNT(*) AS cnt
        FROM judge AS j LEFT JOIN user AS u ON j.user_uuid = u.uuid
        WHERE j.user_uuid = ? and j.prob_num = ?
        ORDER BY j.prob_num ${orderForm}
        `, [UUID, probNum]
    )
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