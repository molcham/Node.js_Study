const express=require('express');
const app=express();
const bodyParser= require('body-parser')
app.use(bodyParser.urlencoded({extended: true}))
app.set('view engine', 'ejs');
const MongoClient = require('mongodb').MongoClient;

var db;
MongoClient.connect('mongodb+srv://sonchaemin89:e0e867e6^^**@molcham.9u8swtc.mongodb.net/?retryWrites=true&w=majority', function(에러, client){
    if (에러) return console.log(에러);
    //서버띄우는 코드 여기로 옮기기

    db=client.db('todoapp');

    db.collection('post').insertOne({이름:'채민',나이:22},function(에러,결과){
      console.log('저장완료');
    });


    app.listen('8080', function(){
      console.log('listening on 8080')
     });
    
  })

/*누군가가 /pet으로 방문을 하면..
  pet 관련 안내문을 띄워주자*/

app.get('/',function(요청,응답){
    응답.sendFile(__dirname+'/write.html');
});

app.post('/add', function(요청, 응답){
    응답.send('전송완료');
    console.log(요청.body.date);
    console.log(요청.body.title);
    db.collection('post').insertOne( { 제목 : 요청.body.title, 날짜 : 요청.body.date } , function(){
      console.log('저장완료')
    });
  });

  /*/list로 GET요청으로 접속하면
     실제 DB에 저장된 데이터들로 예쁘게 꾸며진 html을 보여줌 
  */
app.get('/list',function(요청,응답){


  db.collection('post').find().toArray(function(에러,결과){
    console.lof(결과);
  });
  응답.render('list.ejs');
});


    
