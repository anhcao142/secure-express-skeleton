const express       = require('express');
const path          = require('path');
const favicon       = require('serve-favicon');
const logger        = require('morgan');
const cookieParser  = require('cookie-parser');
const bodyParser    = require('body-parser');
const mongoose      = require('mongoose');
const helmet        = require('helmet');
const join          = require('join-io');
const session       = require('express-session');
const MongoStore    = require('connect-mongo')(session);
const config        = require('./config');
const csrf          = require('csurf');


mongoose.connect(config.connectionOptions);


const index = require('./routes/index');
const users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

/**
 * Add Express-Session
 * Session data will be stored in mongo using connect-mongo Store
 */
app.use(express.session({
    name: config.sessionName,
    secret: config.sessionSecret,
    saveUninitialized: false, // don't create session until something stored
    resave: false, //don't save session if unmodified
    cookie: {maxAge: 3600000, HttpOnly: true} // An hour
    store: new MongoStore({mongooseConnection: mongoose.connection})
}))

/**
 * Add csurf for CSRF protection
 * This will use express-session as the main storage
 */
app.use(csrf());

app.use(require('node-sass-middleware')({
    src: path.join(__dirname, 'public'),
    dest: path.join(__dirname, 'public'),
    indentedSyntax: true,
    sourceMap: true
}));

/**
 * Add helmet for HTTP headers protection
 */
app.use(helmet())


/**
 * Add Join-io - Join file on the fly
 */
app.use(join({
    dir: __dirname,
    prefix: '/join',        /* default */
    minify: false             /* default */
}));



app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// CSRF error handler
// Happen when user try to submit form or request without csrf's token
app.use(function (err, req, res, next) {
    if (err.code !== 'EBADCSRFTOKEN') return next(err)

    // handle CSRF token errors here
    res.status(403)
    res.send('form tampered with')
})

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
