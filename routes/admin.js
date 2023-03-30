const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Category = require("../models/Category");
require('../models/Post');
const Post = mongoose.model('posts');
const { isAdmin }= require('../helpers/isAdmin');

router.get('/', isAdmin, (req, res) => {
  res.render('admin/index');
});

router.get('/categories', isAdmin, (req, res) => {
  Category.find().lean().then((categories) => {
    res.render('admin/categories', { categories: categories });
  }).catch(() => {
    req.flash('error_msg', 'There was an error to list the categories');
    res.redirect('/admin');
  });
});

router.get('/categories/add', isAdmin, (req, res) => {
  res.render('admin/addcategories');
});

router.post('/categories/new', isAdmin, (req, res) => {
  let errors = [];

  if (!req.body.name || typeof req.body.name == undefined || req.body.name == null) {
    errors.push({ text: 'Invalid Name' });
  };

  if (req.body.name.length < 2) {
    errors.push({ text: 'Insufficient name length' });
  };

  if (!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null) {
    errors.push({ text: 'Invalid Slug' });
  };

  if (errors.length > 0) {
    res.render('admin/addcategories', { errors: errors });
  } else {
    const newCategory = {
      name: req.body.name,
      slug: req.body.slug
    };

    new Category(newCategory).save().then(() => {
      req.flash('success_msg', 'Category saved with success!');
      res.redirect('/admin/categories');
    }).catch(() => {
      res.redirect('/admin');
    });
  }
});

router.get('/categories/edit/:id', isAdmin, (req, res) => {
  Category.findOne({ _id: req.params.id }).lean().then((category) => {
    res.render('admin/editcategories', { category: category });
  }).catch(err => {
    req.flash('error_msg', "This category does not exist.");
    res.redirect('/admin/categories');
  });
});

router.post('/categories/edit', isAdmin,(req, res) => {
  Category.findOne({ _id: req.body.id }).then((category) => {
    let errors = [];
    if (!req.body.name || typeof req.body.name == undefined || req.body.name == null) {
      errors.push({ text: "Invalid Name" });
    };
    if (!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null) {
      errors.push({ text: "Invalid Slug" });
    };
    if (req.body.name.length < 2) {
      errors.push({ text: "Insufficient name length" });
    };
    if (errors.length > 0) {
      Category.findOne({ _id: req.body.id }).lean().then(category => {
        res.render('admin/editcategories', { category: category, errors: errors });
      }).catch(() => {
        req.flash('error_msg', 'Error getting data');
        res.redirect('/admin/categories');
      });
    } else {
      category.name = req.body.name;
      category.slug = req.body.slug;

      category.save().then(() => {
        req.flash("success_msg", "Category edited successfully!");
        res.redirect("/admin/categories");
      }).catch(() => {
        req.flash("error_msg", "Error saving category edit.");
        res.redirect("/admin/categories");
      });
    }
  }).catch(() => {
    req.flash("error_msg", "Error editing category");
    res.redirect("/admin/categories");
  });
});

router.post('/categories/delete', isAdmin,(req, res) => {
  Category.deleteOne({ _id: req.body.id }).then(() => {
    req.flash('success_msg', 'Category removed successfully.');
    res.redirect('/admin/categories');
  }).catch(() => {
    req.flash('error_msg', 'An error occurred while deleting the category');
    res.redirect('/admin/categories');
  });
});

router.get('/posts', isAdmin,(req, res) => {
  Post.find().lean().populate({ path: 'category', strictPopulate: false }).sort({ data: "desc" }).then((posts) => {
    res.render('admin/posts', { posts: posts });
  }).catch(() => {
    req.flash('error_msg', 'There was an error listing posts1');
    res.redirect('/admin');
  });
});

router.get('/posts/add', isAdmin,(req, res) => {
  Category.find().lean().then((categories) => {
    res.render('admin/addposts', { categories: categories });
  }).catch(() => {
    req.flash('error_msg', 'There was an error creating the post');
    res.redirect('/admin');
  });
});

router.post('/posts/new', isAdmin,(req, res) => {
  let errors = [];

  if (req.body.category == "0") {
    errors.push({ text: 'Invalid category, register a new one' });
  };

  if (!req.body.title || typeof req.body.title == undefined || typeof req.body.title == null || req.body.title.length < 2) {
    errors.push({ text: 'Invalid Title' });
  };

  if (!req.body.description || typeof req.body.description == undefined || typeof req.body.description == null || req.body.description.length < 5) {
    errors.push({ text: 'Invalid Description' });
  };

  if (!req.body.content || typeof req.body.content == undefined || typeof req.body.content == null) {
    errors.push({ text: 'Invalid Content' });
  };

  if (!req.body.slug || typeof req.body.slug == undefined || typeof req.body.slug == null || req.body.slug.length < 2) {
    errors.push({ text: 'Invalid Slug' });
  };

  if (errors.length > 0) {
    res.render('admin/addposts', { errors: errors });
  } else {
    const newPost = {
      title: req.body.title,
      description: req.body.description,
      content: req.body.content,
      category: req.body.category,
      slug: req.body.slug,
      date: Date.now()
    };

    new Post(newPost).save().then(() => {
      req.flash('success_msg', 'Post successfully created');
      res.redirect('/admin/posts');
    }).catch(() => {
      req.flash('error_msg', "An error occurred while saveing the post");
      res.redirect('/admin/posts');
    });
  };
});

router.get('/posts/edit/:id', isAdmin,(req, res) => {
  Post.findOne({ _id: req.params.id }).lean().then((post) => {
    Category.find().lean().then((categories) => {
      res.render('admin/editposts', { categories: categories, post: post });
    }).catch(() => {
      req.flash('error_msg', 'There was an error listing the categories1');
      res.redirect('/admin/posts');
    });
  }).catch(() => {
    req.flash('error_msg', 'This post does not exist.');
    res.redirect('/admin/posts');
  });
});

router.post('/post/edit', isAdmin,(req, res) => {
  Post.findOne({ _id: req.body.id }).then((post) => {
    post.title = req.body.title;
    post.slug = req.body.slug;
    post.description = req.body.description;
    post.content = req.body.content;
    post.category = req.body.category;
    post.date = new Date();
    post.save().then(() => {
      req.flash('success_msg', 'Successfully edited post');
      res.redirect('/admin/posts/');  
    }).catch(() => {
      req.flash('error_msg', 'Internal error when editing post');
      res.redirect('/admin/posts');
    });
  }).catch(() => {
    req.flash('error_msg', 'An error occurred while saving the edit');
    res.redirect('/admin/posts');
  });
});

router.get('/posts/delete/:id', isAdmin,(req, res) => {
  Post.deleteOne({_id: req.params.id}).then(() => {
    req.flash('success_msg', 'Post removed successfully');
    res.redirect('/admin/posts');
  }).catch(() => {
    req.flash('error_msg', 'An error occurred while deleting the category');
    res.redirect('/admin/posts');
  });
});

module.exports = router;