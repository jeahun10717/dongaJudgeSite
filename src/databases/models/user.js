const db = require('../db');

exports.insert = async (query)=>{
    return await db.query("INSERT INTO users set ?", query);
}

exports.show = async (auth, order, page, contents)=>{
  if(auth == 'noFilter'){ // 전체
    return await db.query(`select hex(uuid) user_id, id, Auth, phone, name, student_ID, registAt from users
    order by id ${order} limit ? offset ?`, [contents, page * contents])
  }else{
    if(auth === 'admin'){ // 관리자
      return await db.query(`select hex(uuid) user_id, id, Auth, phone, name, student_ID registAt from users where auth > 1
      order by id ${order} limit ? offset ?`, [contents, page * contents])
    }else if(auth == 'common'){ // 일반유저(부동산)
      return await db.query(`select hex(uuid) user_id, id, Auth, phone, name, student_ID registAt from users where auth < 2
      order by id ${order} limit ? offset ?`, [contents, page * contents])
    }
  }
}

exports.pagenum = async (auth)=>{
  if(auth == 'noFilter'){ // 전체
    return await db.query(`select count(*) as cnt from users`)
  }else{
    if(auth === 'admin'){ // 관리자
      return await db.query(`select count(*) as cnt from users where auth > 1`)
    }else if(auth == 'common'){ // 일반유저(부동산)
      return await db.query(`select count(*) as cnt from users where auth <= 1`)
    }
  }
}

exports.search = async(name1, name2, order, filter, page, contents) =>{
  return await db.query(`select
  hex(uuid) user_id, id, Auth, phone, name, student_ID, registAt
  from users
  where ${filter} like ? || ${filter} like ?
  order by id ${order} limit ? offset ?`
  ,[`%${name1}%`, `%${name2}%`, contents, page * contents]);
}

exports.pagenumSearch = async(name1, name2, filter, page, contents)=>{
  return await db.query(`select count(*) cnt from users
  where ${filter} like ? || ${filter} like ?`
  ,[`%${name1}%`, `%${name2}%`, contents, page * contents])
}

// 전체 수정( 예 개인정보 수정)
exports.update = async (id, query)=>{
    return await db.query("UPDATE users set ? where uuid = ?",[query, id]);
}

// Auth 2- 일반관리자 권한 주기
exports.setADM = async (id, adm) =>{
    return await db.query(`UPDATE users set Auth = ${adm} where uuid = ?`, id);
}

exports.checkADM = async (auth, name) => {
  return await db.query(`select name from users where auth >= ? && name = ?`, [auth, name])
}

exports.getAllADM = async () => {
  return await db.query(`select name from users where auth >= 2`)
}

exports.isExist = async (login_type, login_id) => {
    const [result] = await db.query("select hex(uuid) uuid, isnull(name) isNew from users where login_type = ? and login_id = ?",[login_type, login_id]);
    return result; // 있으면 객체, 없으면 undefined
}

exports.isExistFromID = async(id)=>{
  const [result] = await db.query('select count(*) cnt from users where id = ?', id);
  return result.cnt;
}

exports.isExistFromUUID = async(id)=>{
  const [result] = await db.query(`select * from users where uuid =?`,id);
  return result;
}

exports.isExistFromUserID = async(user_id)=>{
  const [result] = await db.query(`select login_id from users where login_id =?`,user_id);
  return result;
}

exports.getAuth = async (user_id) =>{
  const [result] = await db.query(`select Auth from users where uuid = ?`,Buffer.from(user_id,'hex'));
  if(result) return result.Auth;
  return result;
}

exports.delete = async(id)=>{
  return await db.query('delete from users where uuid = ?', id);
}

// user 테이블에 마스터 권한을 가진 user 가 존재하는 지 판단하는 소스
exports.chkMstAdmExist = async() => {
  const [result] = await db.query('select count(*) cnt from users where Auth = 3');
  return result.cnt;
}

exports.getAllAdm = async()=>{
  return await db.query(`select name from users where Auth > 1`)
}
