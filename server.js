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

    
    app.listen('8080', function(){
            console.log('listening on 8080')
          });
    
  })

/*누군가가 /pet으로 방문을 하면..
  pet 관련 안내문을 띄워주자*/

app.get('/beauty',function(요청,응답){
    응답.send('뷰티용품을 쇼핑할 수 있는 페이지입니다.');
});

app.get('/pet',function(요청,응답){
    응답.send('펫 용품을 쇼핑할 수 있는 페이지입니다.');
});

app.get('/',function(요청,응답){
    응답.sendFile(__dirname+'/write.html');
});

app.post('/add', function(요청, 응답){
    응답.send('전송완료');
    db.collection('post').insertOne( { 제목 : 요청.body.title, 날짜 : 요청.body.date } , function(){
      console.log('저장완료')
    });
  });

  app.get('/list',function(요청,응답){



    db.collection('post').find().toArray(function(에러,결과){
      console.log(결과);
      응답.render('list.ejs',{post:결과});
    });
    
  });

    

