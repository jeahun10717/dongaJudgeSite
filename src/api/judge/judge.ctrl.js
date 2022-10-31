const multer = require('@koa/multer');
const Joi = require('joi');
const axios = require('axios');
const path = require('path');
const { params } = require('../users');
const userDB = require('../../databases/models/user');
const { PythonShell } = require('python-shell');

// const spawn = require('child_process').spawnSync;

exports.judge = async (ctx, next)=>{
    
}