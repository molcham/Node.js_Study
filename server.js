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



let multer = require('multer');
var storage = multer.diskStorage({

  destination : function(req, file, cb){
    cb(null, './public/image')
  },
  filename : function(req, file, cb){
    cb(null, file.originalname )
  }

});

var path = require('path');


var upload = multer({
  storage: storage,
  fileFilter: function (req, file, callback) {
      var ext = path.extname(file.originalname);
      if(ext !== '.png' && ext !== '.jpg' && ext !== '.jpeg') {
          return callback(new Error('PNG, JPG만 업로드하세요'))
      }
      callback(null, true)
  },
  limits:{
      fileSize: 1024 * 1024
  }
});




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
      var 총게시물갯수=결과.totalPost;
      var post= { _id: 총게시물갯수 + 1, 작성자: 요청.user._id , 제목: 요청.body.title, 날짜: 요청.body.date }

      db.collection('post').insertOne(post , function(){
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
  db.collection('post').deleteOne({_id : 요청.body._id, 작성자 : 요청.user._id} ,function(에러,결과){
    console.log('삭제완료');
    응답.status(200).send({message:'성공했습니다'});

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

app.get('/search', (요청, 응답)=>{

  var 검색조건 = [
    {
      $search: {
        index: 'titleSearch',
        text: {
          query: 요청.query.value,
          path: '제목'  // 제목날짜 둘다 찾고 싶으면 ['제목', '날짜']
        }
      }
    }
  ] 
  console.log(요청.query);
  db.collection('post').aggregate(검색조건).toArray((에러, 결과)=>{
    console.log(결과)
    응답.render('search.ejs', {posts : 결과})
  })
})

app.post('/register', function (요청, 응답) {
  db.collection('login').insertOne({ id: 요청.body.id, pw: 요청.body.pw }, function (에러, 결과) {
    응답.redirect('/')
  })
})


app.use('/shop',require('./routes/shop.js'));
app.use('/board/sub',require('./routes/board.js'));

// part3. 이미지 upload관련코드 
app.get('/upload', function(요청, 응답){
  응답.render('upload.ejs')
})

app.post('/upload', upload.single('프로필'), function(요청, 응답){
  응답.send('업로드완료')
}); 


// 업로드한 이미지 보여주는 이미지 API 만들기 
app.get('/image/:imageName', function(요청, 응답){
  응답.sendFile( __dirname + '/public/image/' + 요청.params.imageName )
})
//dirnmae :특별한 기본변수 현재파일의 경로가 나온다.



//part3.채팅방 만들기 코드 


//서버가 post요청 받으면 채팅방 게시물 발행해주는 코드 
app.post('/chatroom', function(요청, 응답){

  var 저장할거 = {
    title : '무슨무슨채팅방',
    member : [ObjectId(요청.body.당한사람id), 요청.user._id],
    date : new Date()
  }

  db.collection('chatroom').insertOne(저장할거).then(function(결과){
    응답.send('저장완료')
  });
});

//유저가 /chat으로 접속하면 chat.ejs 파일 보내주는 코드 
app.get('/chat', 로그인했니, function(요청, 응답){ 

  db.collection('chatroom').find({ member : 요청.user._id }).toArray().then((결과)=>{
    console.log(결과);  // db에 insert,find,delete 이런거 하고 콜백함수 대신에 .then()붙이기 가능 
    응답.render('chat.ejs', {data : 결과})
  })

}); 


//채팅메세지 저장하는 코드 


app.post('/message', 로그인했니, function(요청, 응답){
  var 저장할거 = {
    parent : 요청.body.parent,
    userid : 요청.user._id,
    content : 요청.body.content,
    date : new Date(),
  }
  db.collection('message').insertOne(저장할거)
  .then((결과)=>{
    응답.send(결과);
  })
}); 

//서버에서 채팅메세지 가져오는 코드
//=> 서버랑 유저간 지속적인 소통채널 열기  


app.get('/message/:parentid', 로그인했니, function(요청, 응답){

  응답.writeHead(200, {
    "Connection": "keep-alive",
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
  });

  db.collection('message').find({ parent: 요청.params.parentid }).toArray()
  .then((결과)=>{
    console.log(결과);
    응답.write('event: test\n');
    응답.write(`data: ${JSON.stringify(결과)}\n\n`);
  }); 
  //JSON.stringify [],{} 자료내부에 전부 따옴표를 붙이고 싶을때, JSON자료(문자자료)취급
  //반대로 떼고 싶다?==> JSON.parse()함수   
  //서버와 실시간으로 소통할 때는 [],{} 와 같은것들은 주고받을 수 없음  

});
















 

    
