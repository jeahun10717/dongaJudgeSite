const db = require('../db');

// 전체 수정( 예 개인정보 수정)
exports.update = async (id, query)=>{
    return await db.query("UPDATE users set ? where uuid = ?",[query, id]);
}
