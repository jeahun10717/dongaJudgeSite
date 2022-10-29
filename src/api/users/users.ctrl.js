const Joi = require('joi');
const { user } = require('../../databases');
// const { token } = require('../../lib');
const axios = require('axios')
const kakao = require('./kakao');
const { oauth,token,auth,login } = require('../../lib');

const { KAKAO_ADMIN_KEY } = process.env;

// TODO: 퍼블리싱 하기 전에 밑에 부분 30 으로 고쳐야 함
const contentNum = 15;

exports.isExist = async (ctx) => {
    const params = Joi.object({
        login_type: Joi.number().integer().min(1).max(2).required(),
        access_token: Joi.string().required()
    }).validate(ctx.request.body);
    if (params.error) ctx.throw(400, '잘못된 요청');

    const {
        login_type,
        access_token
    } = params.value;
    let login_id;
    // kakao
    if (login_type === 2) {
        const kakaoData = await oauth.kakaoData(access_token);
        login_id = `kakao:${kakaoData.id}`;
    } else if (login_type === 1) {
        const naverData = await oauth.naverData(access_token);
        login_id = `naver:${naverData.id}`;
    }
    const isExist = await user.isExist(login_type, login_id);

    // const bufUUID = Buffer.from(isExist.uuid, 'hex');
    // const result = await User.isExistFromUUID(bufUUID);

    let myToken;
    // TODO: 밑에 소스 분기 안해도 풀리는 지 확인 필요
    if (isExist) {
        myToken = token.get({
            UUID: isExist.uuid
        });
        const bufUUID = Buffer.from(isExist.uuid, 'hex');
        const result = await user.isExistFromUUID(bufUUID);
        // console.log(result.Auth);
        // console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
        ctx.body = {
            status: 200,
            result: {
                Auth: result.Auth,
                isExist: isExist ? true : false,
                access_token: myToken
            }
        }
    } else {
        ctx.body = {
            status: 200,
            data: {
                isExist: isExist ? true : false,
                access_token: myToken,
                // Auth: result.Auth
            }
        }
    }
}

exports.regist = async(ctx, next) => {
    const params = Joi.object({
        login_type: Joi.number().integer().min(1).max(2).required(),
        access_token: Joi.string().required(),
        phone: Joi.string().regex(/^[0-9]{8,13}$/).required(), // 회원전화번호
        name: Joi.string().max(30).required(), // 회원 이름
        email: Joi.string().email().required(),
        student_ID: Joi.string().required(),
        regist_at: Joi.string().isoDate().default(new Date())
      }).validate(ctx.request.body);
    
      // console.log(params.error[0]);
      // console.log();
      // console.log(params.error.details[0].message);
    
      // console.log(throwErrMsg);
      if (params.error) {
        const errorMsg = params.error.details[0].message;
        const regexp = new RegExp(/^\"[a-zA-Z\_]{0,}\"/, "g");
        const throwErrMsg = regexp.exec(errorMsg);
        ctx.throw(400, throwErrMsg[0])
      };
    
      const {
        access_token,
        login_type,
        ...rest
      } = params.value;
    
      let login_id;
    
      if (login_type === 2) { // kakao login
        const kakaoData = await oauth.kakaoData(access_token);
        const result = await user.isExistFromUserID(`kakao:${kakaoData.id}`)
        if (result) ctx.throw(400, "이미 존재하는 유저입니다.")
        // console.log(result);
        login_id = `kakao:${kakaoData.id}`;
      } else if (login_type === 1) { // naver login
        const naverData = await oauth.naverData(access_token);
        // console.log(naverData);
        const result = await user.isExistFromUserID(`naver:${naverData.id}`)
        if (result) ctx.throw(400, "이미 존재하는 유저입니다.")
        login_id = `naver:${naverData.id}`;
      }
    
      // try{ // TODO: 이 부분에 왜 try-catch 로 했는지 확인하고 나중에 수정하기
      const userToken = await login.regist({
        login_type,
        login_id,
        ...rest
      })
      //   });
      // }catch(e){
      //   throw(400,e);
      // }
      // console.log(params);
      // console.log(params.value);
      // console.log(ctx.request.user);
      // console.log(UUID);
    
      // query=ctx.request.body
      // user.update(Buffer.from(UUID, 'hex'), query);
      // kakao:1659856827
      ctx.status = 200;
      ctx.body = {
        status: 200,
        result: {
          userToken: userToken.token
        }
      };
}

exports.userMe = async(ctx)=>{
  const { UUID } = ctx.request.user;
  const bufUUID = Buffer.from(UUID, 'hex');
  console.log(UUID, bufUUID);

  const result = await user.isExistFromUUID(bufUUID);
  result.uuid = UUID
  if(!result) ctx.throw(401, "인증 오류 입니다.");
  ctx.body = {
    status: 200,
    result
  }
}

exports.token = async(ctx)=>{
    const { UUID } = ctx.request.user;
    const bufUUID = Buffer.from(UUID, 'hex');
    const result = await user.isExistFromUUID(bufUUID);

    console.log(bufUUID);
    console.log(result);

    if(!result) ctx.throw(401, "인증 오류 입니다.");

    ctx.body={
        status:200,
        result:{
            token:token.get({UUID}),   // 여기서 던져주는 token 은 새로운 token 임
                                       // TODO: 토큰 만료기간 설정하고 나중에 되는지 확인해야 함
                                       // UUID 로 받아오는 토큰 1번, 새로 받아오는 토큰 2번
                                       // ex: 만료기간이 1분이면 위의 api 요청후 1분 후에
                                       // 1번은 동작하지 않아야 함. 2번은 동작해야 함.
            auth: result.Auth
        }
    }

}

exports.show = async(ctx)=>{

    const params = Joi.object({
        auth: Joi.string().valid('noFilter','admin','common').default('noFilter'),
        page: Joi.number().integer().required(),
        order: Joi.string().valid('desc','asc').required()
    }).validate(ctx.query);
    if(params.error) ctx.throw(400,'잘못된 요청');

    // auth == noFilter : 전체 회원 보여줌
    // auth == admin : auth == 2 || auth == 3
    // auth == common : auth == 0 || auth == 1
    // order 오름차순 내림차순
    const { auth, page, order } = params.value;

    const result = await user.show(auth, order, page, contentNum);
    const userNum = await user.pagenum(auth);

    ctx.body = {
        status:200,
        result,
        userNum: userNum[0].cnt,
        pageNum: Math.ceil(userNum[0].cnt/contentNum)
    }
}

// TODO: user talbe 에 값 여러개 입력하고 밑의 소스 검증해야 함
exports.search = async(ctx)=>{
    const params = Joi.object({
        search: Joi.string().required(),
        order: Joi.string().regex(/\bdesc\b|\basc\b/).required(),
        filter: Joi.string().regex(/\bname\b|\brealty_name\b|\brealty_owner_name\b/).required(),
        page: Joi.number().integer().required()
    }).validate(ctx.query);

    if(params.error){
        ctx.throw(400, "잘못된 요청입니다.")
    }

    const { search, order, filter, page } = params.value;
    const name = search.split(' ');
    //TODO: 여기서 1 부분 30 으로 바꾸기
    const result = await user.search(name[0], name[1], order, filter, page, contentNum)
    const userNum = await user.pagenumSearch(name[0], name[1], filter, page, contentNum);

    ctx.body = {
        status:200,
        result,
        userNum: userNum[0].cnt,
        pageNum: Math.ceil(userNum[0].cnt/contentNum)
    }
}

exports.update = async(ctx)=>{
    const { UUID } = ctx.request.user;
    const user_id = Buffer.from(UUID, 'hex');

    const admNum = await user.chkMstAdmExist();


    const params = Joi.object({
        phone: Joi.string().regex(/^[0-9]{8,13}$/).required(), // 회원전화번호
        name: Joi.string().max(30).required(),  // 회원 이름
        student_ID: Joi.string().required(),
        email: Joi.string().email().required(),
    }).validate(ctx.request.body);

    if(params.error) {
      const errorMsg = params.error.details[0].message;
      const regexp = new RegExp(/^\"[a-zA-Z\_]{0,}\"/, "g");
      const throwErrMsg = regexp.exec(errorMsg);
      ctx.throw(400, throwErrMsg[0])
    };

    const result = await user.update(user_id, params.value);
    if(result.affectedRows === 0) ctx.throw(400, "id 가 존재하지 않음");

    ctx.body = {
        status:200,
    }
}

exports.userUpdate = async(ctx)=>{
  const { UUID } = ctx.request.user;
  const myUUID = Buffer.from(UUID, 'hex');

  // const query = Joi.object({
  //   target: Joi.string().regex(/\bme\b|\bother\b/)
  // }).validate(ctx.query);

  const reqBody = Joi.object({
    uuid: Joi.string().custom(v=>Buffer.from(v,'hex')).required(),
    auth: Joi.number().integer().valid(0,1,2,3).required(),
    phone: Joi.string().regex(/^[0-9]{8,13}$/).required(), // 회원전화번호
    name: Joi.string().max(30).required(),  // 회원 이름
    student_ID: Joi.string().required()
  }).validate(ctx.request.body);

  // if(query.error) ctx.throw(400, "잘못된 요청입니다");
  if(reqBody.error) {
    const errorMsg = params.error.details[0].message;
    const regexp = new RegExp(/^\"[a-zA-Z\_]{0,}\"/, "g");
    const throwErrMsg = regexp.exec(errorMsg);
    ctx.throw(400, throwErrMsg[0])
  }

  // console.log("query : ",query.value);
  // console.log("reqBody : ",reqBody.value);
  //
  // console.log(query.value.target);
  // console.log(reqBody.value.uuid, "!!!!!!!!!!!!!!!!!!!!!!!!");
  // console.log(ctx.request.body.uuid);
  // console.log(UUID, "?????????????????????!");

  const admNum = await user.chkMstAdmExist();
  if(ctx.request.body.uuid === UUID){
    // console.log(admNum, "dddddddddddddddddddddd");
      if(admNum >1){

        await user.update(ctx.request.body.uuid,reqBody.value);

      }else if(admNum<=1){
        if(reqBody.value.auth != 3) ctx.throw(400, "마스터관리자가 1명 이하이므로 강등이 불가합니다")
        await user.update(ctx.request.body.uuid,reqBody.value);
      }

    // await user.setADM(myUUID, reqBody.value.auth);
    // console.log("asdfasdfasdfadfasdfasdfasdfasdfasdfasda");
  }else if(ctx.request.body.uuid !== UUID){
    await user.update(reqBody.value.uuid,reqBody.value);
  }

  ctx.body = {
    status: 200
  }
}

exports.userDelete = async (ctx)=>{
    const params = Joi.object({
        uuid: Joi.string().custom(v=>Buffer.from(v,'hex')).required()
    }).validate(ctx.query);
    // TODO params.error

    if(params.error) ctx.throw(400, "잘못된 요청입니다")

    const { uuid } = params.value;
    const { UUID } = ctx.request.user;
    const admNum = await user.chkMstAdmExist();
    const user = await user.isExistFromUUID(uuid);

    // console.log(admNum, ctx.query.uuid, "111111111111111111111111111111111");
    // console.log(UUID, "????????????????????????", ctx.query.uuid);

    // if(admNum < 2)
    if((UUID.toLowerCase()==ctx.query.uuid.toLowerCase())&&(admNum<=1)){
      ctx.throw(400, "이 대상을 삭제하면 최고관리자가 1명 미만이 되므로 삭제가 불가합니다.")
    }

    const result = await user.delete(uuid);
    if(result.affectedRows === 0) ctx.throw(400, "id 가 존재하지 않음");

    ctx.body = {
        status: 200,
    }
}

exports.delete = async(ctx)=>{
  // console.log(ctx.request)
  // console.log('asdljkfalskdjflaksdjfljasdlfkjasldf');
  const { UUID } = ctx.request.user;
  const bufUUID = Buffer.from(UUID, 'hex');

  // console.log(ctx.request.user);
  const admNum = await user.chkMstAdmExist();
  const userMe = await user.isExistFromUUID(bufUUID)

  // console.log(user);
  // console.log(user.uuid);
  // console.log(user.login_id);
  // let targetID = user.login_id.replace(/kakao:/,"")
  // targetID=Number(targetID);
  // console.log(typeof targetID);

  // const token = ctx.request.header.authorization;
  // console.log(token);
  // console.log(user, admNum, "dddddddddddddddddddddddddddddddd");
  // console.log(user.Auth, admNum);
  if(userMe.Auth === 3 && admNum <= 1) ctx.throw(400, "본 유저가 탈퇴시 최종관리자가 1명도 없으므로 탈퇴가 불가합니다.")
  // console.log(KAKAO_ADMIN_KEY);
  // const config = {
  //   headers: {
  //     "Authorization": "KakaoAK "+ KAKAO_ADMIN_KEY
  //   }
  // }
  // const data = {
  //   data: {
  //     target_id_type: "user_id",
  //     target_id: `${Number(targetID)}`
  //   }
  // }
  // const result = await axios.post('https://kapi.kakao.com/v1/user/unlink', data ,config);
  // axios({
  //   method: "POST",
  //   url: 'https://kapi.kakao.com/v1/user/unlink',
  //   data: {
  //     target_id_type: "user_id",
  //     target_id: `${Number(targetID)}`
  //   },
  //   headers: {
  //     "Authorization": "KakaoAK "+ KAKAO_ADMIN_KEY
  //   }
  // }).then((res)=>)
  // console.log(result);
  await user.delete(bufUUID);
  ctx.body={
    status:200
  }
}



// TODO: 밑의 setADM, setMasterADM 함수는 유저 여러명 가능할 때 따로 검증해야 함.(검증 안했음)
exports.setADM = async (ctx)=>{
    // adm 이 2일 때 1을 2로 승급
    // adm 이 1일 때 2를 1로 강등
    const params = Joi.object({
        uuid: Joi.string().custom(v=>Buffer.from(v,'hex')).required(),
        adm: Joi.number().integer().required()
    }).validate(ctx.request.body);

    if(params.error){
        ctx.throw(400, "잘못된 요청입니다");
    }

    const { uuid, adm } = params.value;

    if(params.error){
        ctx.throw(400, "없는 관리자 number 입니다.");
    }

    await user.setADM(uuid, adm);
}

exports.setMasterADM = async (ctx)=>{
    const params = Joi.object({
        uuid: Joi.string().custom(v=>Buffer.from(v,'hex')).required(),
        adm: Joi.number().integer().required()
    }).validate(ctx.request.body);

    if(params.error){
        ctx.throw(400, "잘못된 요청입니다");
    }

    const { uuid, adm } = params.value;

    if(params.error){
        ctx.throw(400, "없는 관리자 number 입니다.");
    }

    if(adm === 3){ // 일반 관리자(auth 2) 를 최고 관리자(auth 3)로 승급
        await user.setADM(uuid, adm)
    }else if(adm == 2){ // 다른 최고관리자(auth 3) 을 일반 관리자(auth 2)로 강등
        if(await user.chkMstAdmExist <= 1){
            ctx.body={
                status: 400,
                msg: `최고관리자가 1명 이하이므로 해당 동작을 수행할 수 없습니다.`
            }
        }
        await user.setADM(uuid, adm);
    }
}

exports.getAllAdm = async(ctx)=>{
  const admins = await user.getAllAdm()

  ctx.body = {
    stauts: 200,
    adm: admins
  }
}
