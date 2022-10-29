const fs = require('fs');
const path = require('path');

fs.readdirSync(__dirname).filter( file => (file != 'index.js' && file != `python`) ).forEach(
  file => {
    exports[file.split('.')[0]] = require(`./${file.split('.')[0]}`);
    // console.log(file);
  }  
);
