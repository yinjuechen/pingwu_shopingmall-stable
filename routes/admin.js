var express = require('express');
var router = express.Router();
var User = require('../module/user');
var passport = require('passport');
var middlewareObj = require('../middleware/index');
var Product = require("../module/product");

//admin home page and log in
router.get('/', function (req, res) {
    res.render('admin/login');
});
router.post('/', passport.authenticate('local', {
    // successRedirect: '/admin/:id',
    failureRedirect: '/admin',
    // successFlash:'登陆成功' ,
    failureFlash: true
}), function (req, res) {
    res.redirect('admin/' + req.user.id);
    req.flash('success', 'Welcome back, ' + req.user.username);
});

// Get user's information page
router.get('/:id/user/:userId',middlewareObj.isAdmin, function (req, res) {
    console.log('userID: ' + req.params.userId);
    User.findById(req.params.userId, function (err, foundUser) {
        if(err){
            console.log(err);
            res.redirect('back');
        }else{
            User.find({phoneNumber:foundUser.parentPhoneNumber}, function (err, parentUser) {
                if (err){
                    console.log(err);
                    res.redirect('back');
                } else {
                    res.render('admin/user',{user:foundUser, parent:parentUser[0]});
                }
            });
        }
    });
});
//Edit and update user's information
router.put('/:id/user/:userId',middlewareObj.isAdmin, function (req,res) {
    console.log('put request: ' + req.body.agree);
    console.log(req.body.decline);
    User.findById(req.params.userId, function (err, foundUser) {
        if(err){
            req.flash('err', err.message);
        }else {
            if(req.body.agree){
                foundUser.status = true;
                foundUser.save();

            }
        }
    });
    res.redirect('/admin/' + req.params.id);
});

//admin management page
router.get('/:id', middlewareObj.isAdmin, function (req, res) {
    User.findById(req.params.id, function (err, foundUser) {
        if (err){
            req.flash('err', err.message);
            res.redirect('back');
        }else {
            if (foundUser.isAdmin) {
                User.find({}, function (err, foundUsers) {
                    // console.log(foundUsers);
                    // console.log('foundUsers length: ' + foundUsers.length);
                    Product.find({}, function (err, foundProducts) {
                        if(err){
                            req.flash('err', err.message);
                            res.redirect('back');
                        }else {
                            res.render("admin/show", {users: foundUsers, products: foundProducts});
                        }
                    });
                });
            } else {
                res.redirect('/');
            }
        }
    });
});
module.exports = router;