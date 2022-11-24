const db = require('../db');

// 전체 수정( 예 개인정보 수정)
exports.update = async (id, query)=>{
    return await db.query("UPDATE users set ? where uuid = ?",[query, id]);
}

exports.insert = async (query) => {
    return await db.query("insert judge set ?", query);
}

exports.isExistFromUUID = async (UUID, prob_num)=>{
    // return await db.query("select * from judge where user_uuid = ? and prob_num = ?", [UUID, prob_num]);
    return await db.query("select * from judge where user_uuid = ?", UUID);
}