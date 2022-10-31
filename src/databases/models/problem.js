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

exports.showSome = async () => {
    return await db.query("")
}