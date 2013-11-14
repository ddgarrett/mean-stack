var ml = require('./mongoLoad');

var hash = require('../server/hash');  // password module containing hash and salt generator

// NOTE: in the data below we've added "password"
// before loading we will remove "password" and replace it with "hash" and "salt"
var users = [
  { _id   : 1001,
    fName : 'System',
    lName : 'Admin',
    email : 'sys.admin@nowhere.com',
    password : 'secret'
  },

  { _id   : 1002,
    fName : 'Jane',
    lName : 'Smith',
    email : 'j.smith@nowhere.com',
    password : 'somepassword',
    defaultCollection: 'trains',
    collections : [
      {_id : 'trains', name : 'Trains', defaultView : 1,
       views: [
         {_id : 1, name : 'Complete Database Listing'},
         {_id : 2, name : 'Listing by Railroad'},
         {_id : 3, name : 'Physical Inventory by Storage Location'},
         {_id : 4, name : 'Shopping List'},
         {_id : 5, name : 'Wish List'},
         {_id : 6, name : 'Items For Sale'}
       ]},
      {_id : 'music', name : 'Music', defaultView: 7,
       views: [
         {_id : 7, name : 'Complete Music Listing'},
         {_id : 8, name : 'Shopping List'},
         {_id : 9, name : 'Wish List'},
         {_id : 10, name : 'Items For Sale'}
       ]},
      {_id : 'books', name : 'Books', defaultView : 11,
       views: [
         {_id : 11, name : 'Book List'},
         {_id : 12, name : 'Shopping List'},
         {_id : 13, name : 'Wish List'},
         {_id : 14, name : 'Items For Sale'}
       ]}
    ]
  }
  ]
;

/*
MongoClient.connect(config.mongoDB.connectionString, function(err, db) {
    if (err) throw err;
    var collection = db.collection('users');
    console.log('remove all documents in users');
    collection.remove({}, {w:1}, function(err, result) {
        if (err) {
            console.log('error on remove of users documents: ' + err);
            db.close();
        }
        else {
            console.log('documents deleted from users, result: ' + result)
            db.close();
            insertUsers();
        }
    });
});


// replace password with hash and salt
// and insert each user one by one
function insertUsers(collection){
users.forEach( function(user) {
    console.log(' ********** get salt for user '+user);
    passModule.getSalt(user.password, function(err, salt, hash){
        if (err) throw err;
        // store the salt & hash in user
        console.log(' user '+user.fName);
        user.salt = salt;
        user.hash = hash;
        delete user.password;
        MongoClient.connect(config.mongoDB.connectionString, function(err, db) {
            if (err) throw err;
            var collection = db.collection('users');
            collection
            .insert(user,{w:1}, function(err, result) {
                if (err) {
                    console.log('insert error: ' + err);
                }
                else {
                    console.log('user inserted');
                    console.log('user response: ' + result);
                }
                db.close();
            });
        });
    });
});
}
*/

// Add salt for user i, then call addSalt for user ++i
// Until all users processed,
// Then call the MongoLoad utility to load the document
function addSalt(i){
    // replace password with hash and salt for user i
    var user = users[i];
    console.log(' ********** get salt for user '+user.fName);
    hash.getSalt(user.password, function(err, salt, hash){
        if (err) throw err;

        // store the salt & hash in user
        console.log(' process user '+user.fName);
        user.salt = salt;
        user.hash = hash;
        delete user.password;

        if (++i < users.length)
            addSalt(i);
        else
            ml.insertDocs('users',users);
    });
}

// add salt for the first user
addSalt(0);




