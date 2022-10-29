const mysql = require('mysql2/promise');
const db_info = require('./db_info');
const pool = mysql.createPool(db_info.localhost);

module.exports = function(){
   const getConn = async ()=> await pool.getConnection();
   const query = async (query, param = null) =>{
      try{
         if(param == null){
            const [rows] = await pool.query(query);
            return rows;
         }else{
            const [rows] = await pool.query(query,param);
            return rows;
         }
      }catch(err){
         throw err;
      }
   }

   return{
      getConn,
      query
   }
}();