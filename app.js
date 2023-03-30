require('./models/Post');
require('./models/Category');
const passport = require('passport');
require('./config/auth')(passport);
const express = require('express');
const handlebars = require('express-handlebars');
const app = express();
const admin = require('./routes/admin');
const users = require('./routes/user');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const flash = require('connect-flash');
const Post = mongoose.model('posts');
const Category = mongoose.model('categories');

// Config
// Session
app.use(session({
  secret: "pitoco",
  resave: true,
  saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

// Middleware
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash('error');
  res.locals.user = req.user || null;
  next();
});

// Body Parser
app.use(express.json()); //support JSON-encoded bodies
app.use(express.urlencoded({ extended: true })); //support URL-encoded bodies


// Template Engine - Handlebars
app.engine('handlebars', handlebars.engine({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

// Mongoose
mongoose.Promise = global.Promise;
mongoose.connect("mongodb://localhost/blogapp").then(() => {
  console.log('Mongo Connected!');
}).catch((err) => {
  console.log('Error to connect ' + err);
});
// Public
app.use(express.static(path.join(__dirname, "public")));

// Routes
app.use('/admin', admin);
app.use('/users', users);

app.get('/post/:slug', (req, res) => {
  Post.findOne({ slug: req.params.slug }).lean().then((post) => {
    if (post) {
      res.render('post/index', { post: post });
    } else {
      req.flash('error_msg', 'This post does not exist');
      res.redirect('/');
    };
  }).catch(() => {
    req.flash('error_msg', 'Internal Error');
    res.redirect('/');
  });
});

app.get('/categories', (req, res) => {
  Category.find().lean().then(categories => {
    res.render('categories/index', {categories: categories});
  }).catch(() => {
    req.flash('error_msg', 'There was an error listing categories');
    res.redirect('/');
  });
});

app.get('/categories/:slug', (req, res) => {
  Category.findOne({slug: req.params.slug}).lean().then(category => {
    if(category) {
      Post.find({category: category._id}).lean().then((posts) => {
        res.render('categories/posts', {posts: posts, category: category});
      }).catch(() => {
        req.flash('error_msg', 'There is no post with this category.');
        res.redirect('/');
      });
    } else {
      req.flash('error_msg', 'There is no post with this category');
      res.redirect('/');
    };
  }).catch(() => {
    req.flash('error_msg', 'Internal error occurred while trying to load the category page');
    res.redirect('/');
  });
});

app.get('/404', (req, res) => {
  res.send('ERROR 404!');
});

app.use('/', (req, res) => {
  Post.find().lean().populate('category').sort({ data: 'desc' }).then((posts) => {
    res.render('index', { posts: posts });
  }).catch(() => {
    req.flash('error_msg', 'Internal error');
    res.redirect('/404');
  });
});

const port = process.env.PORT || 8081;
app.listen(port, () => {
  console.log('Server running!');
});
