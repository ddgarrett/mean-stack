
var express = require('express');       // express
var passModule = require('./pass');

var app = express();                    // express app

var cookieSecret = 'cookie secret';     // for Cookie Parser
var sessionSecret = 'session secret';   // for Session

app.configure(function(){
    app.use(express.logger('dev'))          // Add default logging
        .use(express.bodyParser())          // parse post and put input data
        .use(express.cookieParser(cookieSecret))  // parse cookies
        .use(express.session(sessionSecret))      // use sessions
        .use(app.router)                    // use routes defined below: app.get(...), app.post(...), etc.
        .use(express.static(__dirname + '/client'))   // serve static files from /client directory
    ;
});


/***************************************************************************
    Dummy Database
 ***************************************************************************/

var users = {
    tj: { name: 'tj' }
};

// when you create a user, generate a salt
// and hash the password ('foobar' is the pass here)
passModule.getSalt('foobar', function(err, salt, hash){
    if (err) throw err;
    // store the salt & hash in the "db"
    users.tj.salt = salt;
    users.tj.hash = hash;
});


/***************************************************************************
    Authentication and Restriction Logic
 ***************************************************************************/

// Authenticate using our plain-object database of doom!
function authenticate(name, pass, fn) {
    if (!module.parent) console.log('authenticating %s:%s', name, pass);
    var user = users[name];
    // query the db for the given username
    if (!user) return fn(new Error('cannot find user'));
    // apply the same algorithm to the POSTed password, applying
    // the hash against the pass / salt, if there is a match we
    // found the user
    passModule.hash(pass, user.salt, function(err, hash){
        if (err) return fn(err);
        if (hash == user.hash) return fn(null, user);
        fn(new Error('invalid password'));
    })
}

function restrict(req, res, next) {
    if (req.session.user) {
        next();
    } else {
        res.json({error : true, message : 'unauthorized'});
    }
}

app.get('/api', function(req, res){
    res.redirect('/api/login');
});

app.get('/api/restricted', restrict, function(req, res){
    res.json({error : false, message : 'you made it to a restricted area', data : users});
});


/***************************************************************************
    Caller Log in and log out logic
 ***************************************************************************/

var loginString = {method: 'POST',  url: '/api/login',
                     data: {email: 'email', password : 'password'}};

app.get('/api/login', function(req, res){
    res.json({error : false, message: '', login : loginString});
});

app.post('/api/login', function(req, res){
    authenticate(req.body.email, req.body.password, function(err, user){
        if (user) {
            // Regenerate session when signing in
            // to prevent fixation
            req.session.regenerate(function(){
                // Store the user's primary key
                // in the session store to be retrieved,
                // or in this case the entire user object
                req.session.user = user;
                res.json({error: false, message: 'logged in', logout : {method: 'GET',  url: '/api/logout'} });
            });
        } else {
            var response  =  JSON.parse(JSON.stringify(loginString));
            response.email = req.body.email;
            response.password = req.body.password;
            res.json({error: true, message: 'login failed for user '+req.body.email, login : response });
        }
    });
});

app.get('/api/logout', function(req, res){
    // destroy the user's session to log them out
    // will be re-created next request
    req.session.destroy(function(){
        res.json({error : false, message : 'user logged out', login : loginString});
    });
});

/***************************************************************************
    Start Server
 ***************************************************************************/

app.listen(3000);
console.log('Express started on port 3000');
