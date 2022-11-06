import { db } from "../db/database.js";

export async function findByEmail(email) {
  return false;
  // return db
  //   .execute("SELECT * FROM users WHERE 이메일=?", [email]) //
  //   .then((result) => result[0][0]);
}

export async function createUser(user) {
  return db
    .execute(
      "INSERT INTO users (학번, 학과, 이메일, 비밀번호, 이름) VALUES (?,?,?,?,?)",
      [user.id, user.department, user.email, user.password, user.username]
    )
    .then((result) => {
      console.log(result);
      return result;
    });
}
