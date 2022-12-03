const Router = require('koa-router');
const board = new Router();
const boardCtrl = require('./board.ctrl');
const { auth } = require('../../lib');

board.use(auth.login);
board.use(auth.level1);

board.get('/', boardCtrl.showPagenated);
board.get('/:b_id', boardCtrl.showOne);
board.post('/', boardCtrl.create);
board.delete('/:b_id', boardCtrl.delete);

module.exports = board;