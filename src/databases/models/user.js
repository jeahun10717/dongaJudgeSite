const db = require('../db');

exports.insert = async (query)=>{
    return await db.query("INSERT INTO user set ?", query);
}

exports.show = async (auth, order, page, contents)=>{
  if(auth == 'noFilter'){ // 전체
    return await db.query(`select hex(uuid) user_id, id, Auth, phone, name, student_ID, registAt from user
    order by id ${order} limit ? offset ?`, [contents, page * contents])
  }else{
    if(auth === 'admin'){ // 관리자
      return await db.query(`select hex(uuid) user_id, id, Auth, phone, name, student_ID registAt from user where auth > 1
      order by id ${order} limit ? offset ?`, [contents, page * contents])
    }else if(auth == 'common'){ // 일반유저(부동산)
      return await db.query(`select hex(uuid) user_id, id, Auth, phone, name, student_ID registAt from user where auth < 2
      order by id ${order} limit ? offset ?`, [contents, page * contents])
    }
  }
}

exports.pagenum = async (auth)=>{
  if(auth == 'noFilter'){ // 전체
    return await db.query(`select count(*) as cnt from user`)
  }else{
    if(auth === 'admin'){ // 관리자
      return await db.query(`select count(*) as cnt from user where auth > 1`)
    }else if(auth == 'common'){ // 일반유저(부동산)
      return await db.query(`select count(*) as cnt from user where auth <= 1`)
    }
  }
}

exports.search = async(name1, name2, order, filter, page, contents) =>{
  return await db.query(`select
  hex(uuid) user_id, id, Auth, phone, name, student_ID, registAt
  from user
  where ${filter} like ? || ${filter} like ?
  order by id ${order} limit ? offset ?`
  ,[`%${name1}%`, `%${name2}%`, contents, page * contents]);
}

exports.pagenumSearch = async(name1, name2, filter, page, contents)=>{
  return await db.query(`select count(*) cnt from user
  where ${filter} like ? || ${filter} like ?`
  ,[`%${name1}%`, `%${name2}%`, contents, page * contents])
}

// 전체 수정( 예 개인정보 수정)
exports.update = async (id, query)=>{
    return await db.query("UPDATE user set ? where uuid = ?",[query, id]);
}

// Auth 2- 일반관리자 권한 주기
exports.setADM = async (id, adm) =>{
    return await db.query(`UPDATE user set Auth = ${adm} where uuid = ?`, id);
}

exports.checkADM = async (auth, name) => {
  return await db.query(`select name from user where auth >= ? && name = ?`, [auth, name])
}

exports.getAllADM = async () => {
  return await db.query(`select name from user where auth >= 2`)
}

exports.isExist = async (login_id) => {
    const [result] = await db.query("select hex(uuid) uuid, isnull(name) isNew from user where kakao_id = ?",login_id);
    return result; // 있으면 객체, 없으면 undefined
}

exports.isExistFromID = async(id)=>{
  const [result] = await db.query('select count(*) cnt from user where kakao_id = ?', id);
  return result.cnt;
}

exports.isExistFromUUID = async(id)=>{
  const [result] = await db.query(`select * from user where uuid =?`,id);
  return result;
}

exports.isExistFromUserID = async(kakao_id)=>{
  const [result] = await db.query(`select kakao_id from user where kakao_id =?`,kakao_id);
  return result;
}

exports.getAuth = async (user_id) =>{
  const [result] = await db.query(`select Auth from user where uuid = ?`,Buffer.from(user_id,'hex'));
  if(result) return result.Auth;
  return result;
}

exports.delete = async(id)=>{
  return await db.query('delete from user where uuid = ?', id);
}

// user 테이블에 마스터 권한을 가진 user 가 존재하는 지 판단하는 소스
exports.chkMstAdmExist = async() => {
  const [result] = await db.query('select count(*) cnt from user where Auth = 3');
  return result.cnt;
}

exports.getAllAdm = async()=>{
  return await db.query(`select name from user where Auth > 1`)
}
