const models = require('../models');
const Promise = require('bluebird');

module.exports.createSession = (req, res, next) => {
  console.log('AUTH COOKIE ', req.headers);
  if (req.headers.cookies === undefined) { 
    models.Sessions.create();
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
  }
  
  next();
};

/************************************************************/
// Add additional authentication middleware functions below
/************************************************************/

