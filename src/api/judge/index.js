const Router = require('koa-router');
const judge = new Router();
const judgeCtrl = require('./judge.ctrl');
const { auth } = require('../../lib');

// const fs = require('fs');
// const db = require('../../databases/models/user')

const multer = require('@koa/multer')
const cppUpload = require('../../lib/multer/index')
const path = require('path');

const {PythonShell} = require('python-shell');

judge.use(auth.login);
judge.use(auth.level1);


judge.get('/', judgeCtrl.showJudge);
judge.get('/:judgeUUID', judgeCtrl.showJudgeByUUID);
judge.post('/', judgeCtrl.judge);
judge.post('/attack', judgeCtrl.attack);
// judge.post('/', cppUpload.single('test'),judgeCtrl.judge);

module.exports = judge;

