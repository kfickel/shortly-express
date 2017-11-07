const parseCookies = (req, res, next) => {
  console.log('cookie header ', req.headers.cookies);
  if (req.headers.cookies !== undefined) {
    var parsedCookies = JSON.parse(req.headers.cookies);
    req.cookies = parsedCookies;
  }
  next();
};

module.exports = parseCookies;