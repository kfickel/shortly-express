const models = require('../models');
const Promise = require('bluebird');

module.exports.createSession = (req, res, next) => {
  // console.log('create session');
  //need to save relevant data in an object related to that session and assigns it to the request session property
  // console.log('AUTH COOKIE ', req.headers);
  if (req.headers.cookies === undefined) {
    // console.log('no cookie'); 
    //no cookie, so create session hash
    models.Sessions.create()
      .then(function(createObj) {
        console.log('create');
        //trying to get the Session hash we created
        // console.log('createObj ', createObj);
        // console.log('insert Id', createObj.insertId);
        req.headers.cookies = '123';
        models.Sessions.get({id: createObj.insertId})
          .then(function (sessionObj) {
            // console.log('AUTH GET ', sessionObj);
            console.log('HEADER BEFORE CHANGE ', req.headers);
            
            // req.headers.cookies = sessionObj.hash;
            // req.setHeader("Set-Cookie", sessionObj.hash);
            // var cookieHeader = 'Set-Cookie';
            req.headers.cookies = sessionObj.hash;
            console.log('HEADER AFTER CHANGE ', req.headers);
            console.log('cookie header ', req.headers['Set-Cookie']);
          });
      });
    //already filters the user id in 
    // models.Users.get({username: req.body.username})
    //   .then(function(userObj) {
    //     if (userObj !== undefined) {
    //       console.log('userObj ', userObj);
    //       models.Sessions.get({userId: userObj.id})
    //         .then(function(results) {
    //           console.log('RESULTS ', results);
    //         });
    //     }
    //   });
  } else {
    //we have cookie
    //check to see if cookie is verified (in session table)
    models.Sessions.get({hash: req.headers.cookies})
      .then(function (sessionObj) {
        console.log('SESSIONOBJ :', sessionObj);
        //For verified, check if session property exists
        // if (!req.session) {
        //   req.session = {};
        // }
        models.Sessions.isLoggedIn(sessionObj);
        //For verified, if session property does not, add the session property equal to an obj
        
      })
      .catch(function(err) {
        console.log('LIAR');
      });
  }
  
  next();
};

/************************************************************/
// Add additional authentication middleware functions below
/************************************************************/

