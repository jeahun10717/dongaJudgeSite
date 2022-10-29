const Router = require('koa-router');
const kakao = new Router();
const {oauth, login} = require('../../../lib');

kakao.get('/', async (ctx,next)=>{ // get : /src/api/users/kakao
   const { code } = ctx.query;


   const access_token = await oauth.getAccessToken(code)

   ctx.body = {
     status: 200,
     access_token : access_token.access_token
   }
   // const kakaoData = await oauth.kakao(code);
   // const userToken = await login.regist({
   //    login_type: 2,
   //    login_id: `kakao:${kakaoData.id}`
   // });
   //
   // // 홈으로 보낼지 추가사항 입력으로 보낼지
   // // token cookie에 저장
   // ctx.cookies.set('token', userToken.token, { httpOnly: false });
   //
   // if(userToken.isNew){ // ./src/lib/login/index.js 에서 isNew 에 대한 정보 주었음
   //                      // 가입 되어 있을 경우 :
   //    ctx.body = `<script>location.href= '${process.env.KAKAO_SUCCESS_URI}'</script>`;
   // }else{
   //    ctx.body = `<script>location.href= '/' </script>`;
   // }
})

module.exports = kakao;
