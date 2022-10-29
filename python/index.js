const express = require('express')
const app = express()
const bodyParser = require('body-parser')

const {PythonShell} = require('python-shell');

app.use(bodyParser.urlencoded({
    extended: false
}))
app.get('/', (req, res) => {
    res.send(`
    <form action="/" method="post">
        <input type="text" name="name" placeholder="파일이름을 입력하세요."/>
        <input type="number" name="num" placeholder="과제번호를 입력하세요."/>
        <input type="submit" value="전송">
    </form>
    `)
})
app.post('/', (req, res) => {
    const name = req.body.name || "" // 파일 받아와서 이름으로 수정
    const num = req.body.num || 0 // TASK 번호

    // TODO: num, name 수정

    let options = {
        mode: 'text',
        pythonPath: 'python3', 
        pythonOptions: ['-u'],
        scriptPath: '.', // 수정필요
        args: [`${name} ${num}`]
    }
    
    PythonShell.run('./python/test.py', options, function (err, results) {
        if (err) throw err;
        console.log('results: %j', results);
        //파일 삭제
        res.json(results.map((d) => d.split(',')))
    })
})
