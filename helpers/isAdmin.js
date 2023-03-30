const isAdmin = (req, res, next) => {
  if (req.isAuthenticated() && req.user.isAdmin == 1) {
    return next();
  };
  req.flash('error_msg', 'You need to be an admin');
  res.redirect('/');
};

module.exports = { isAdmin };
 