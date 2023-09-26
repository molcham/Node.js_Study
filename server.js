const express=require('express');
const app=express();
const bodyParser= require('body-parser')
app.use(bodyParser.urlencoded({extended: true}))
app.set('view engine', 'ejs');
const MongoClient = require('mongodb').MongoClient;
const uri = 'mongodb://localhost:27017'; 
const client = new MongoClient(uri, { useUnifiedTopology: true });
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

app.get('/',function(요청,응답){
    응답.sendFile(__dirname+'/write.html');
});

app.post('/add', function(요청, 응답){
    응답.send('전송완료');
    console.log(요청.body.date);
    console.log(요청.body.title);
    db.collection('counter').findOne({name:'게시물갯수'},function(에러,결과){
      console.log(결과.totalPost);
      let 총게시물갯수=결과.totalPost;

      db.collection('post').insertOne( { _id : 총게시물갯수+1, 제목 : 요청.body.title, 날짜 : 요청.body.date } , function(){
        console.log('저장완료')
        //counter라는 콜렉션에 있는 totalPost라는 항목도 1증가 시켜야함
        db.collection('counter').updateOne({name:'게시물갯수'},{$inc:{totalPost:1}})

      });

    });
   
  });

  /*/list로 GET요청으로 접속하면
     실제 DB에 저장된 데이터들로 예쁘게 꾸며진 html을 보여줌 
  */
app.get('/list',function(요청,응답){


  db.collection('post').find().toArray(function(에러,결과){
    console.log(결과);
    응답.render('list.ejs',{posts:결과});
  });
});

app.delete('/delete',function(요청,응답){
  console.log(요청.body);
  요청.body._id=parseInt(요청.body._id);
  //요청.body에 담겨온 게시물번호를 가진 글을 db에서 찾아서 삭제해주세요
  db.collection('post').deleteOne(요청.body,function(에러,결과){
    console.log('삭제완료');

  })
})


app.get('/edit',function(요청,응답){
  응답.render('edit.ejs')
})


    
