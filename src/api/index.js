const Router = require('koa-router');
const users = require('./users');
const score = require('./score');
const problem = require('./problem');
const judge = require('./judge');

const api = new Router();

api.use('/users', users.routes());
api.use('/score', score.routes());
api.use('/problem', problem.routes());
api.use('/judge', judge.routes());

module.exports = api;
