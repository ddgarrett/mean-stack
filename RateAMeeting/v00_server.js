var express = require('express');           // express
var app = express();                        // express app

// Static page server
    app.configure(function(){
        app.use(express.logger('dev'))       // Add default logging
            .use(express.static(__dirname + '/client_v01'))      // serve static files
    ;
});


// app.listen(3000,'localhost');
// console.log('Listening on port ' + 3000);

var ipaddress = process.env.OPENSHIFT_NODEJS_IP || 'localhost';
var port      = process.env.OPENSHIFT_NODEJS_PORT || 3000;

var mongoip   = process.env.OPENSHIFT_MONGODB_DB_HOST || 'localhost';
var mongoport = process.env.OPENSHIFT_MONGODB_DB_PORT || 27017;

app.listen(port,ipaddress);
console.log('Listening on port %s ipaddress %s',port,ipaddress);

console.log('mongodb info - host: %s, port: %s', mongoip, mongoport);


















