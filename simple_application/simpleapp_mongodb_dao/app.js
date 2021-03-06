var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var session = require('express-session');

var index = require('./routes/index');
var users = require('./routes/users');
var login = require('./routes/login');
var home  = require('./routes/home');

const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

// Connection URL
const url = 'mongodb://localhost:27017';

// Database Name
const dbName = 'testdb';


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');

app.engine('html',require('hbs').__express);

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// configure the session module
app.use(session({
  secret:'keyboard cat',
  cookie:{maxAge:60000}, 
  resave: false,
  saveUninitialized:true
}));


app.use(function(req,res,next){

  MongoClient.connect(url, function (err, client) {
    if (err) {
      console.log("Connection error", err);
    }
    console.log("Connected successfully to server");

    const db = client.db(dbName);

    app.db = db;

    next()
  });
  
})

app.use('/', index);
app.use('/users', users);
app.use('/login', login);
app.use('/home', home);

app.use(function (req,res,next){
  console.log('Counter1:',req.cookies.counter);
  if (req.cookies.counter===undefined){
    console.log("Setting Counter");
    res.cookie("counter",0,{maxAge:9000,httpOnly:true})
  }else {
    req.cookies.counter +=1;
  }
  
  console.log('Counter',req.cookies.counter);
  next();
}); 


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
