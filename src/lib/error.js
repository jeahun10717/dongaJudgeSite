const fs = require('fs');

module.exports = async ( ctx, next )=>{
  try{
    await next();
  }catch(e){
    let status = e.status || 500;

    if(status == 500) console.error(e); // 500 이면 에러로그 출력
    ctx.status = status;
    ctx.body = {
      status: status,
      code: e.errcode || 0,
      msg: status == 500 ? "서버 에러" : e.message
    }
  }
}
