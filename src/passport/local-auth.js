const passport = require('passport');
const LocalStrategy = require('passport-local');
const db = require('../database/config')
const bcrypt = require('bcrypt')

passport.serializeUser( (result, done) =>{
    done(null, result[0]._id);
});

passport.deserializeUser( async (serializedID, done) => {
    db.connect ( async (err) =>{
        if(err) {
            console.log(err);
        } else {
            var userCollection = db.getColl('user');
            var result = db.getDocuments(userCollection, {id: serializedID})
            /*
                .then( (doc) => {
                    done(null, doc);
                });
            */
            done(null, result);
        }
    });
});


passport.use('local-login', new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password',
    passReqToCallback: true
}, async (req, user, pass, done) => {
    db.connect( async (err) => {
        if(err){
            console.log(err);
        } else {
            var userCollection = db.getColl('user');
            var hash = bcrypt.hashSync(pass, bcrypt.genSaltSync(10));
            var result = await db.getDocuments(userCollection, {username: user, passwd: hash})
                /*.then( (doc, err) => {
                if(err){
                    console.log(err);
                } else {
                    console.log(doc);
                }
            });*/
            done(null, result);
        }
    });
}));