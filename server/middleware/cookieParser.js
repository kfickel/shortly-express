const parseCookies = (req, res, next) => {
  // console.log('cookie header ', req.headers.cookies);
  // console.log('cookie');
  if (req.headers.cookies !== undefined) {
    var parsedCookies = JSON.parse(req.headers.cookies);
    req.headers.cookies = parsedCookies;
  }
  next();
};

module.exports = parseCookies;