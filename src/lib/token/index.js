const { JWT_SECRET, JWT_EXPIRESIN } = process.env;
const jwt = require('jsonwebtoken');

function get( payload ){
   return jwt.sign(
      payload,
      JWT_SECRET,
      {
         expiresIn: JWT_EXPIRESIN
      }
   )
}

exports.get = get;

function decode ( token ){
   return new Promise(
      (resolve, reject) =>{
         jwt.verify(
            token.split(' ')[1],
            JWT_SECRET,
            (err, payload)=>{
               if(err) reject(err);
               resolve(payload);
            })
      }
   );
}
exports.jwtMiddleware = async (ctx, next)=>{
   try{
      let auth = ctx.request.headers.authorization;

      if(auth){
         let payload;
         try{
            payload = await decode(auth);
         }catch(e){
            ctx.throw(401,e);
         }

         // 인증 통과
         if(!payload.hasOwnProperty('UUID')){
               ctx.throw(401,`invalid token`);
         }

         ctx.request.user = {UUID: payload.UUID};
         ctx.req.user = {UUID: payload.UUID};
      }
   }catch(e){
      ctx.throw(500,e);
   }
   return next();
};

// console.log(get({UUID:'49183CC28CDD88F581A54DB7E59D87E5'}))
