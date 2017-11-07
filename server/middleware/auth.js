const models = require('../models');
const Promise = require('bluebird');

module.exports.createSession = (req, res, next) => {
  //need to save relevant data in an object related to that session and assigns it to the request session property
  if (req.headers.cookies === undefined) {
    models.Sessions.create()
      .then(function(createObj) {
        console.log('create');
        models.Sessions.get({id: createObj.insertId})
          .then(function (sessionObj) {

            res.setHeader('Set-Cookie', sessionObj.hash);
            next();
          });
      });
  } else {
    //we have cookie
    //check to see if cookie is verified (in session table)
    models.Sessions.get({hash: req.headers.cookies})
      .then(function (sessionObj) {
        models.Sessions.isLoggedIn(sessionObj);
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
    next();
  }
  
};

/************************************************************/
// Add additional authentication middleware functions below
/************************************************************/

