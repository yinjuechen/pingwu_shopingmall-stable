var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var flash = require('connect-flash');
var session = require('express-session');
var passport = require('passport');
var LocalStrategy = require('passport-local');
var User = require('./module/user');
var methodOverride = require('method-override');
var index = require('./routes/index');
var products = require('./routes/products');
var admin = require('./routes/admin');
var app = express();
var seedDB = require('./seed');
var mongoose = require('mongoose');
var localAuthFactory = require('express-local-auth');


//connect to database
mongoose.Promise = global.Promise;
mongoose.connect(process.env.DATABASE_URL, {useMongoClient: true});
// seedDB();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(methodOverride('_method'));
//Set flash
app.use(flash());
app.use(session({
    secret:"juechen",
    resave: false,
    saveUninitialized: false
}));
app.use(function (req, res, next) {
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});

//PASSPORT CONFIGURATIONS
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use(function (req, res, next) {
    res.locals.currentUser = req.user;
    next();
});
//Set routers
app.use('/', index);
app.use('/products', products);
app.use('/admin', admin);

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

app.listen(process.env.PORT, process.env.IP, function () {
    console.log('Server has started');
} );
module.exports = app;
