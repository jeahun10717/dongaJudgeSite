const Naver = new require('koa-router')();

const { NAVER_CLIENT_ID, NAVER_REDIRECT_URI, NAVER_SEND_TOKEN_URI} = process.env;

// Naver.get('/', async (ctx)=>{
//     let html = `
//     <!DOCTYPE html>
//     <html lang="kr">
//     <head>
//         <meta charset="utf-8">
//         <meta http-equiv="X-UA-Compatible" content="IE=edge">
//         <meta name="viewport" content="width=device-width, initial-scale=1">
//         <title>NaverLoginSDK</title>
//         <script src="https://unpkg.com/axios/dist/axios.min.js"></script>
//     </head>
//
//     <body>
//
//         callback 처리중입니다. 이 페이지에서는 callback을 처리하고 바로 main으로 redirect하기때문에 이 메시지가 보이면 안됩니다.
//
//         <!-- (1) LoginWithNaverId Javscript SDK -->
//         <script type="text/javascript" src="https://static.nid.naver.com/js/naveridlogin_js_sdk_2.0.0.js" charset="utf-8"></script>
//
//
//         <!-- (2) LoginWithNaverId Javscript 설정 정보 및 초기화 -->
//         <script>
//             var naverLogin = new naver.LoginWithNaverId(
//                 {
//                     clientId: "[[NAVER_CLIENT_ID]]",
//                     callbackUrl: "[[NAVER_REDIRECT_URI]]",
//                     isPopup: false,
//                     callbackHandle: true
//                     /* callback 페이지가 분리되었을 경우에 callback 페이지에서는 callback처리를 해줄수 있도록 설정합니다. */
//                 }
//             );
//
//             /* (3) 네아로 로그인 정보를 초기화하기 위하여 init을 호출 */
//             naverLogin.init();
//
//             /* (4) Callback의 처리. 정상적으로 Callback 처리가 완료될 경우 main page로 redirect(또는 Popup close) */
//             window.addEventListener('load', function () {
//                 naverLogin.getLoginStatus(async function (status) {
//                     console.log(status);
//                     if (status) {
//                         /* (5) 필수적으로 받아야하는 프로필 정보가 있다면 callback처리 시점에 체크 */
//                         var email = naverLogin.user.getEmail();
//                         if( email == undefined || email == null) {
//                             alert("이메일은 필수정보입니다. 정보제공을 동의해주세요.");
//                             /* (5-1) 사용자 정보 재동의를 위하여 다시 네아로 동의페이지로 이동함 */
//                             naverLogin.reprompt();
//                             return;
//                         }
//                         document.cookie = "naverOauth="+naverLogin.accessToken.accessToken;
//                         // TODO add 화면으로 redirect 시켜줘야 함
//                         // TODO access_token 임시로 쿠키에 저장
//                         // TODO 사용 후 파기
//                         // 서버로 access_token 전달
//                         // await axios.post("[[NAVER_SEND_TOKEN_URI]]", {
//                         //     access_token: naverLogin.accessToken.accessToken
//                         // });
//
//                         // 특정 URL로 보냄
//                         // window.location.replace('/addPage');
//                         //TODO: 위의 /addPage 는 클라이언트 페이지 URL 인데
//                         // 쿠키에 들어가 있는 access_token 값을 저장하여야 하며 post : /api/users/add
//                         // 쪽에서 request-body 의 access_token 에 저장해 줘야 함. 위의 post 요청이 끝난 후
//                         // naverOauth 토큰은 삭제해야 함!!
//                         console.log(naverLogin.accessToken.accessToken);
//                     } else {
//                         console.log("callback 처리에 실패하였습니다.");
//                     }
//                 });
//             });
//         </script>
//     </body>
//     </html>
//     `;
//
//     html = html.replace(/\[\[NAVER_CLIENT_ID\]\]/g, NAVER_CLIENT_ID);
//     html = html.replace(/\[\[NAVER_REDIRECT_URI\]\]/g, NAVER_REDIRECT_URI)
//     html = html.replace(/\[\[NAVER_SEND_TOKEN_URI\]\]/g, NAVER_SEND_TOKEN_URI)
//     ctx.body = html;
// })

module.exports = Naver;
