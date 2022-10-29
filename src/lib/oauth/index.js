const { KAKAO_CLIENT_ID, KAKAO_REDIRECT_URI } = process.env;

const axios = require('axios');
const qs = require('querystring');

// 카카오톡 인증
function getAccessToken(code){
    // kakao톡은 formdata로만 전송이 가능.
    const header ={
       headers:{
          "Content-Type":"application/x-www-form-urlencoded"
       }
    }
    const body = {
       grant_type:"authorization_code",
       client_id: KAKAO_CLIENT_ID,
       redirect_uri: KAKAO_REDIRECT_URI,
       code:code,
       // client_secret:"yFGQP6I6GLsH2CHvlvPxS0y72HBVdhqU" // secret키 신청한 경우만
    }
    return new Promise(
       (resolve, reject)=>{
          axios.post(`https://kauth.kakao.com/oauth/token`, qs.stringify(body),header).then(  (res)=>{
             if(res.status == 200){
                resolve(res.data);
             }
             reject(false);
          })
          .catch( e=>{
             // console.log(e.response.data);
             reject(false);
          });
       }
    );
 }
exports.getAccessToken = getAccessToken;
exports.kakaoData = async (access_token)=>{
  const kakaoData = (await axios.post(`https://kapi.kakao.com/v2/user/me`, {}, {
       headers: {
           "Content-Type": "application/json",
           "Authorization": "Bearer " + access_token
       }
  })).data;

  return kakaoData;
}

exports.kakao = async ( code )=>{
   let data;
   try{
      data = await getAccessToken(code);
   }catch(e){
      // console.log("error",e);
   }

   const kakaoData = (await axios.post(`https://kapi.kakao.com/v2/user/me`, {}, {
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + data.access_token
        }
   })).data;

   return kakaoData;
}

exports.naverData = async (access_token)=>{
   try{
      const result = await axios.get('https://openapi.naver.com/v1/nid/me', {
        headers:{
          Authorization: `Bearer ${access_token}`
        }
      });

      return result.data.response;
    }catch(e){
       // console.log(e.data);
      const err = new Error('잘못된 요청-네이버 로그인 실패');
      err.status = 400;
      throw err
    }
}
