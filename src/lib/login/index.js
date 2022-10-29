const { user } = require('../../databases');
const uuid = require("../uuid");
const token = require('../token');

// @deprecated isNew
exports.regist = async (query)=>{
    const userData = await user.isExist(query.login_type, query.login_id);
    // 가입이 된 유저인지 검증
    // console.log(userData, ' : /login/index.js');
    if(userData){   //가입이 되어 있을 경우(userData 가 존재할 때)-->isExist 가 객체로 존재할 때 <1>
        // 토큰 생성 및 토큰 return
        // dead code
        // return {
        //     isNew: userData.isNew,
        //     token: token.get({UUID: userData.uuid})
        // };
    }else{
        // 가입이 안되있을 경우.
        // uuid 생성
        const UUID = uuid.get();

        // db insert
        const data = {
            ...query,
            uuid : Buffer.from(UUID, 'hex'),
            auth: 1
        }

        await user.insert(data);

        // token
        return {     // 가입이 위의 소스에서 insert 가 되었으므로 존재한다.
            isNew: 1,// 가입이 되었으므로 isNew 에 1 을 넣는다.-->이거 정확히 왜 그런지 모르겠음
            token: token.get({UUID})
        };
    }
}
