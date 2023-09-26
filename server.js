const express=require('express');
const app=express();
require('dotenv').config()
const bodyParser= require('body-parser')
app.use(bodyParser.urlencoded({extended: true}))
const methodOverride = require('method-override')
app.use(methodOverride('_method'))
app.set('view engine', 'ejs');
const MongoClient = require('mongodb').MongoClient;
const uri = 'mongodb://localhost:27017'; 
const client = new MongoClient(uri, { useUnifiedTopology: true });
var db;


MongoClient.connect('mongodb+srv://sonchaemin89:e0e867e6^^**@molcham.9u8swtc.mongodb.net/?retryWrites=true&w=majority', function(에러, client){
    if (err) return console.log(err);
    //서버띄우는 코드 여기로 옮기기

    db=client.db('todoapp');


    app.listen(process.env.PORT, function(){
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
    응답.status(400).send({message:'성공했습니다'});

  })
})


app.get('/edit',function(요청,응답){
  응답.render('edit.ejs')
})

// detail로 접속하면 detail.ejs보여줌

app.get('/detail/:id',function(요청,응답){
  db.collection('post').findOne({ _id : parseInt(요청.params.id) },function(에러,결과){
    응답.render('detail.ejs',{data:결과})


  })
  

})

app.get('/edit/:id', function(요청, 응답){
  db.collection('post').findOne({ _id : parseInt(요청.params.id) }, function(에러, 결과){
    console.log(결과)
    응답.render('edit.ejs', { post : 결과 })
  })
  
});

app.put('/edit', function(요청, 응답){ 
  db.collection('post').updateOne( {_id : parseInt(요청.body.id) }, {$set : { 제목 : 요청.body.title , 날짜 : 요청.body.date }}, 
    function(){ 
    
    console.log('수정완료') 
    응답.redirect('/list') 
  }); 
}); 


const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');

app.use(session({secret : '비밀코드', resave : true, saveUninitialized: false}));
app.use(passport.initialize());
app.use(passport.session()); 


app.get('/login', function(요청, 응답){
  응답.render('login.ejs')
});




passport.use(new LocalStrategy({
  usernameField: 'id', //사용자가 제출한 아이디가 어디 적혔는지
  passwordField: 'pw', // 사용자가 제출한 비번이 어디 적혔는지 
  session: true, //세션을 만들껀지 
  passReqToCallback: false, //아이디 비번말고 다른정보 검사가 필요한지 
}, function (입력한아이디, 입력한비번, done) {
  console.log(입력한아이디, 입력한비번);
  db.collection('login').findOne({ id: 입력한아이디 }, function (에러, 결과) {
    if (에러) return done(에러)

    if (!결과) return done(null, false, { message: '존재하지않는 아이디요' })
    if (입력한비번 == 결과.pw) {
      return done(null, 결과)
    } else {
      return done(null, false, { message: '비번틀렸어요' })
    }
  })
}));

passport.serializeUser(function (user, done) {
  done(null, user.id)
});

passport.deserializeUser(function (아이디, done) {
  db.collection('login').findOne({ id: 아이디 }, function (에러, 결과) {
    done(null, 결과)
  })
}); //요청.user 부분에 꽃아준다. 궁금한거 있으면 console.log()로 출력해보기 
// 방문자가 세션아이디 쿠기가 존재하면 이 함수 덕분에 항상 요청.user라는 데이터가 존재한다. 


app.get('/mypage', 로그인했니, function (요청, 응답) { 
  console.log(요청.user); 
  응답.render('mypage.ejs', {사용자:요청.user}) 
}) 

function 로그인했니(요청, 응답, next) { 
  if (요청.user) { //요청.user는 deserializeUser가 보내준 그냥 로그인한 유저의 DB 데이터.
    next() 
  } 
  else { 
    응답.send('로그인안하셨는데요?') 
  } 
} 

    
