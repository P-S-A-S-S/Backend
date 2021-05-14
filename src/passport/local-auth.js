const passport = require('passport');
const LocalStrategy = require('passport-local');
const db = require('../database/config')
const bcrypt = require('bcrypt')

passport.serializeUser( (result, done) => {
    done(null, result._id);
});

passport.deserializeUser( async (serializedID, done) => {
    db.connect ( async (err) =>{
        if(err) {
            console.log(err);
        } else {
            var userCollection = db.getColl('user');
            var result = db.getDocuments(userCollection, {id: serializedID})
            done(null, result);
        }
    });
});


passport.use('local-login', new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password',
    passReqToCallback: true
}, async (req, user, pass, done) => {
    console.log("user: " + user + "\npass: " + pass)
    db.connect( async (err) => {
        if(err){
            console.log(err);
        } else {
            var userCollection = db.getColl('user');
            try {
                var result = await db.getDocuments(userCollection, {username: user})
                if(bcrypt.compareSync(pass, result[0].passwd)){
                    done(null, result[0]); 
                } else {
                    done(null, false)
                }
            } catch(err) {
                console.log("Error: wrong username/password comination");
            } 
        }
    });
}));

passport.use('local-modify', new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password',
    passReqToCallback: true
}, async (req, user, pass, done) => {
    console.log("user: " + user + "\npass: " + pass)
    db.connect( async (err) => {
        if(err){
            console.log(err);
        } else {
            var userCollection = db.getColl('user');
            var hash = bcrypt.hashSync(pass, bcrypt.genSaltSync(10));
            var result = await db.updateDocument(userCollection, {username: user}, {$set: {passwd: hash}});
            done(null, result[0]);
        }
    });
}));