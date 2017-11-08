const models = require('../models');
const Promise = require('bluebird');

module.exports.createSession = (req, res, next) => {
  console.log('here');
  //need to save relevant data in an object related to that session and assigns it to the request session property
  // console.log('REQ HEADERS: ', req.headers.cookie);

  if (req.headers.cookie === undefined) {
    models.Sessions.create()
      .then(function(createObj) {
        console.log('create');
        models.Sessions.get({id: createObj.insertId})
          .then(function (sessionObj) {
            // console.log('set header getting set');
            // req.headers.cookies = sessionObj.hash;
            res.setHeader('Set-Cookie', sessionObj.hash);
            
            // console.log('check if it is set ', res.getHeader('Set-Cookie'));
            // console.log('set header is set');
            next();
          });
      });
    
  } else {
    //we have cookie
    //check to see if cookie is verified (in session table)
    console.log('has cookie :', req.headers.cookie);
    models.Sessions.get({hash: req.headers.cookie})
      .then(function (sessionObj) {
        var loggedIn = models.Sessions.isLoggedIn(sessionObj);
        req.session = {
          loggedIn: loggedIn
        };
        if (loggedIn) {
          console.log('LOGGED IN');
          next();
        } else {
          console.log('REDIRECT- not logged in');
          //res.redirect('/login');
          // next();
          next();
        }
        //if the user is logged in, reroute to index
        //else if not logged in, reroute to log in?
        

        // console.log('SESSIONOBJ :', sessionObj);
        //For verified, check if session property exists
        // if (!req.session) {
        //   req.session = {};
        // }
        // res.req.client.Cookie = sessionObj.hash;
        // models.Sessions.isLoggedIn(sessionObj);
        //For verified, if session property does not, add the session property equal to an obj
      })
      .catch(function(err) {
        console.log('LIAR');
      });
    
  }
};

/************************************************************/
// Add additional authentication middleware functions below
/************************************************************/

