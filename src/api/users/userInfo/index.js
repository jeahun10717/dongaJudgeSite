// const Router = require('koa-router');
// const users = new Router();
// const userInfoCtrl = require('./userInfo.ctrl');
// const { auth } = require('../../../lib');

// users
// .get('/getAllAdm', usersCtrl.getAllAdm);

// users.use(auth.login);
// users.use(auth.level1);

// users
// .get('/token', usersCtrl.token)
// .get('/userMe', usersCtrl.userMe)
// .post('/update', usersCtrl.update)  // 자신의 회원정보수
// .delete('/delete', usersCtrl.delete)  // 자신의 회원 탈퇴

// users.use(auth.level2);

// users// create 은 user 라우트 단계에서 처리됨.
// .get('/show', usersCtrl.show)
// .get('/search', usersCtrl.search)
// //TODO: search filter 걸어서 만들기

// users.use(auth.level3);

// users
// .post('/userUpdate', usersCtrl.userUpdate)
// .delete('/userDelete', usersCtrl.userDelete);
// // .post('/setAdmin', usersCtrl.setADM)  // 회원 관리자 승격/강등 관리
// // .post('/setMasterAdmin', usersCtrl.setMasterADM)  // 최고 관리자 승격/강등 관리

// module.exports = userInfo
