const Router = require('koa-router');
const kakao = require('./kakao')
// const add = require('./add');
const usersCtrl = require('./users.ctrl');

const users = new Router();
const Joi = require('joi');
const { user: User } = require('../../databases');
const { oauth,token,auth,login } = require('../../lib');

// users.get('/', (ctx, next)=>{
//     ctx.body = 'this is users page'
// })

users.use('/kakao', kakao.routes());
users.use('/naver', require('./naver').routes())

users
.post('/exist', usersCtrl.isExist)
.post('/', usersCtrl.regist);

// users
// .get('/getAllAdm', usersCtrl.getAllAdm);

users.use(auth.login);
users.use(auth.level1);

users
.get('/token', usersCtrl.token)
.get('/userMe', usersCtrl.userMe)
.put('/', usersCtrl.update)  // 자신의 회원정보수정
.delete('/', usersCtrl.delete);  // 자신의 회원 탈퇴

users.use(auth.level2);

users// create 은 user 라우트 단계에서 처리됨.
.get('/', usersCtrl.show) // read : user 목록 불러오기
.get('/filtered', usersCtrl.search);
//TODO: search filter 걸어서 만들기

users.use(auth.level3);

users
.put('/admin', usersCtrl.userUpdate)
.delete('/admin', usersCtrl.userDelete);
// .post('/setAdmin', usersCtrl.setADM)  // 회원 관리자 승격/강등 관리
// .post('/setMasterAdmin', usersCtrl.setMasterADM)  // 최고 관리자 승격/강등 관리


// users.use('/add', add.routes());
// users.use('/userInfo', userInfo.routes());

module.exports = users;
