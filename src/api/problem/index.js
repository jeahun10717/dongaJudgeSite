const Router = require('koa-router');
const problem = new Router();
const problemCtrl = require('./problem.ctrl');
const { auth } = require('../../lib');

const multer = require('@koa/multer');
const path = require('path');





problem.get('/', problemCtrl.showProblem);
problem.post('/', problemCtrl.createProblem);
problem.post('/pdf', problemCtrl.upPdf);
problem.post('/inp', problemCtrl.upInp);
problem.post('/out', problemCtrl.upOut);
problem.get('/maxProbNum', problemCtrl.showMaxProbNum);

module.exports = problem;