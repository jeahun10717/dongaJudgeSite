const db = require('../db');


// 전체 수정( 예 개인정보 수정)
exports.create = async (query) => {
    return await db.query("insert into problem set ?", query);
}

exports.update = async (id, query)=>{
    return await db.query("UPDATE users set ? where uuid = ?",[query, id]);
}

exports.showMaxProbNum = async () => {
    return await db.query("SELECT MAX(prob_num) AS MAX_NUM from problem")
}

exports.showAll = async () => {
    return await db.query("SELECT * FROM problem");
}

exports.pagenatedProb = async (orderForm, pageNum, contentsNum) =>{
    return await db.query(
        `
        select *
        from problem
        order by prob_num ${orderForm}
        limit ? offset ?
        `
        ,[contentsNum, pageNum * contentsNum]
    )
}



exports.totalContentsCnt = async()=>{
    const [result] = await db.query(`select count(*) cnt from problem`);
    return result.cnt;
}

exports.deleteProblem = async(probNum) => {
    return await db.query('delete from problem where prob_num = ?', probNum);
}

exports.problemFromProbNum = async(probNum) => {
    return await db.query('select * from problem where prob_num = ?', probNum);
}

exports.probCnt = async() => {
    return await db.query(`select count(*) as prob_cnt from problem`)
}

// judge 를 수행하였을 때 problem 테이블에서 제출횟수(submit_cnt)와 성공횟수(correct_cnt) 업데이트
exports.judgeResultUpdate = async(judgeState, probNum)=>{ 
    console.log(judgeState, "@@@@@@@@@@@@");
    if(judgeState == 1){
        console.log("judgeStat == 1");
        return await db.query(
            `update problem 
                set correct_cnt = correct_cnt + 1, submit_cnt = submit_cnt + 1 
                where prob_num = ?`, [probNum] 
        )
    }
    else if(judgeState == 0){
        console.log("judgeStat == 0");
        return await db.query(
            `update problem set submit_cnt = submit_cnt + 1 where prob_num = ?`, [probNum]
        )
    }
}

exports.submitCnt = async() => {
    return await db.query(`SELECT SUM(correct_cnt) as submit_cnt FROM problem`)
}

exports.correctCnt = async() => {
    return await db.query(`SELECT SUM(submit_cnt) as correct_cnt FROM problem`)
}