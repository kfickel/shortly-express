const express = require('express');
const path = require('path');
const utils = require('./lib/hashUtils');
const partials = require('express-partials');
const bodyParser = require('body-parser');
const Auth = require('./middleware/auth');
const models = require('./models');
const Cookie = require('./middleware/cookieParser');

const app = express();


app.set('views', `${__dirname}/views`);
app.set('view engine', 'ejs');
app.use(partials());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));

//parse an existing cookie

app.use(Cookie);

//checks if a cookie exists
  //if a cookied doesn't exist, creates cookie
  //else, check if sessionId is valid. 
app.use(Auth.createSession);



app.get('/', 
(req, res) => {
  res.render('index');
});

app.get('/create', 
(req, res) => {
  res.render('index');
});

app.get('/links', 
(req, res, next) => {
  models.Links.getAll()
    .then(links => {
      res.status(200).send(links);
    })
    .error(error => {
      res.status(500).send(error);
    });
});

app.post('/links', 
(req, res, next) => {
  var url = req.body.url;
  if (!models.Links.isValidUrl(url)) {
    // send back a 404 if link is not valid
    return res.sendStatus(404);
  }

  return models.Links.get({ url })
    .then(link => {
      if (link) {
        throw link;
      }
      return models.Links.getUrlTitle(url);
    })
    .then(title => {
      return models.Links.create({
        url: url,
        title: title,
        baseUrl: req.headers.origin
      });
    })
    .then(results => {
      return models.Links.get({ id: results.insertId });
    })
    .then(link => {
      throw link;
    })
    .error(error => {
      res.status(500).send(error);
    })
    .catch(link => {
      res.status(200).send(link);
    });
});

/************************************************************/
// Write your authentication routes here
/************************************************************/
// html = new EJS({url: './views/signup.ejs'}).render();
app.get('/signup', 
  (req, res) => {
    res.render('signup');
  });

app.post('/signup', function(req, res, next) {
  var username = req.body.username;
  var password = req.body.password;

  models.Users.get({username: username})
    .then(function(results) {
      if (results === undefined) {
        models.Users.create({username, password});
        models.Users.get({username: username})
          .then(function(userObj) {
            var userObj = userObj;
            console.log('user id ', userObj.id);
            // console.log('cookie ', req.headers);
            // console.log('HEADER ', res.getHeader('Set-Cookie'));
            var cookie = res.getHeader('Set-Cookie');
            console.log('COOKIE ', cookie);
            var q = `UPDATE sessions SET userId = ${userObj.id} WHERE hash = "${cookie}" AND userId IS NULL `;
            console.log('Q : ', q);
            executeQuery(`UPDATE sessions SET userId = ${userObj.id} WHERE hash = "${cookie}" AND userId IS NULL `);

            // models.Sessions.update({hash: cookie}, {hash: cookie, userId: userObj.id})
            //   .then (function (results) {
            //     console.log('UPDATE RESULTS ', results);
            //     models.Sessions.get({userId: userObj.id})
            //       .then(function (userSession) {
            //         console.log('session userId ', userSession);
            //       });
            //   });
          });
        res.redirect('/');
        res.status(201).send('');
      } else {
        res.redirect('/signup');
      }
    })
    .catch(function(err) {
    });
});


app.get('/login', 
  (req, res) => {
    res.render('login');
  });

app.post('/login', function(req, res, next) {
  var username = req.body.username;
  var password = req.body.password;
  // console.log('REQ :\n' , req);
  models.Users.get({username: username})
    .then(function(results) {
      // console.log('results ', results.password);
      var verified = models.Users.compare(password, results.password, results.salt);
      if (verified) {
        //grab the user id
        models.Users.get({username: username})
          .then(function(userObj) {
            console.log('user id ', userObj.id);
            console.log('cookie ', req.headers);
            console.log('HEADER ', res.getHeader('Set-Cookie'));
            var cookie = res.getHeader('Set-Cookie');

            models.Sessions.update({hash: cookie, userId: null}, {userId: userObj.id});
            models.Sessions.get({userId: userObj.id})
              .then(function (userSession) {
                console.log('session userId ', userSession);
              });
          });
        //set the user id in the session table
        res.redirect('/');
        // res.status(201).send('');
      } else {
        res.redirect('/login');
        // res.send('wrong');
      }
    })
    .catch(function(err) {
      res.redirect('/login');
      // res.send('wrong');
    }); 
});


/************************************************************/
// Handle the code parameter route last - if all other routes fail
// assume the route is a short code and try and handle it here.
// If the short-code doesn't exist, send the user to '/'
/************************************************************/

app.get('/:code', (req, res, next) => {

  return models.Links.get({ code: req.params.code })
    .tap(link => {

      if (!link) {
        throw new Error('Link does not exist');
      }
      return models.Clicks.create({ linkId: link.id });
    })
    .tap(link => {
      return models.Links.update(link, { visits: link.visits + 1 });
    })
    .then(({ url }) => {
      res.redirect(url);
    })
    .error(error => {
      res.status(500).send(error);
    })
    .catch(() => {
      res.redirect('/');
    });
});

module.exports = app;
