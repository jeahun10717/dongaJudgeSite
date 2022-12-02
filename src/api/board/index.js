const Router = require('koa-router');
const board = new Router();
const boardCtrl = require('./board.ctrl');

board.get('/', boardCtrl.create);

module.exports = board;