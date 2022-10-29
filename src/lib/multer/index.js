const multer = require('@koa/multer');
const fs = require('fs');
const path = require('path')
const userDB = require('../../databases/models/user')
const storage = multer.diskStorage({
    destination: async function(ctx, file, cb){
        // const hexUUID = Buffer.from(ctx.user.UUID, 'hex');
        // const userInfo = await userDB.isExistFromUUID(hexUUID);
        // const studentID = userInfo.student_ID;
        const storePath = path.join(__dirname, `../../public/problem`);

        if(!fs.existsSync(storePath)){
            fs.mkdirSync(storePath);
        }
        cb(null, storePath);
    },
    filename: function(ctx, file, cb){
        cb(null, file.originalname);
    }
})

const upload = multer({
    storage
})

module.exports = upload;