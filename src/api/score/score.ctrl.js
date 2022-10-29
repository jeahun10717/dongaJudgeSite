const Joi = require('joi');
// const { score } = require('../../databases');

// TODO: path 모듈 써서 dest 일반화 하기

exports.multerTest = async (ctx) => {
    console.log(ctx.request.files);
    ctx.body = {
        test : "test"
    }
}

exports.test = async (ctx) => {
    ctx.body = {
        test: "test"
    }
}