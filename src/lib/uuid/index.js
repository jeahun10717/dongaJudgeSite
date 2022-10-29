const uuid4 = require('uuid4');

function get(){// 생성은 get 으로 하고
  let uuid = uuid4().split('-');
  return uuid[2] + uuid[1] + uuid[0] + uuid[3] + uuid[4];
}

// DB 에 넣을 때는 이렇게 넣으면 됨
// {
//    uuid : Buffer.from(uuid, 'hex');
// }
exports.get = get;
