var express = require('express');
var router = express.Router();
var User = require('../module/user');
var middlewareObj = require('../middleware/index');
var passport = require('passport');
/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index');
});

//Sign up routes
router.get('/register', function (req, res) {
    res.render('register/register');
});
router.post('/register', function (req, res) {
    var username = req.body.username;
    var address = req.body.address;
    var phoneNumber = req.body.phoneNumber;
    var parentPhoneNumber = req.body.parentPhoneNumber;
    console.log(typeof req.body._id);
    if (req.body.password === req.body.password_confirm) {
        User.find({phoneNumber:parentPhoneNumber}, function (err, foundUser) {
            console.log(foundUser);
            if(err){
                console.log(err);
                req.flash("error","推荐人不在系统中");
                res.redirect('back');
            }else {
                var newUser = new User({
                    username: username,
                    address: address,
                    phoneNumber: phoneNumber,
                    parentPhoneNumber: parentPhoneNumber,
                    income:0,
                });
                User.register(newUser, req.body.password, function (err, user) {
                    if (err) {
                        req.flash("error", err.message);
                        return res.redirect('back');
                    }
                    passport.authenticate('local')(req, res, function () {
                        console.log(user);
                        req.flash("success", "注册成功");
                        res.redirect('/products');
                    })
                    if(foundUser.length)
                    {
                        //推荐人拿20%
                        // foundUser[0].childrenIdNumber.push(user.idNumber);
                        foundUser[0].nextLevel.push(user);
                        foundUser[0].income += 3000*0.2;
                        var tmpIncome = {
                            childName: user.username,
                            childIdNumber: user.phoneNumber,
                            childId:user._id,
                            level: 1,
                            amount: 600
                        };
                        foundUser[0].incomeDetails.push(tmpIncome);
                        foundUser[0].save();
                        //推荐人的上级如果是高级会员或者钻石会员拿15%
                        User.find({phoneNumber:foundUser[0].parentPhoneNumber}, function (err, userB) {
                            console.log('userB: ', userB);
                            if(err || !userB.length){
                                //do nothing
                            }else {
                                if(userB[0].nextLevel.length >= 8){
                                    userB[0].income += 3000*0.15;
                                    var tmpIncome = {
                                        childName: user.username,
                                        childIdNumber: user.phoneNumber,
                                        childId:user._id,
                                        level: 2,
                                        amount: 450
                                    }
                                    userB[0].incomeDetails.push(tmpIncome);
                                    userB[0].save();
                                }
                                //update 更新上一级的nextlevel
                                var tmpLevelB = userB[0].nextLevel.findIndex(function (element) {
                                    console.log('UserB nextlevel: ' + userB[0].nextLevel);
                                    console.log('elementB phoneNumber: ' + element.phoneNumber);
                                    console.log('foundUserB phonenumber: ' + foundUser[0].phoneNumber);
                                    return element.phoneNumber == foundUser[0].phoneNumber;
                                });
                                // console.log('tmpLevelB: ' + tmpLevelB);
                                // console.log('userB tmpLevel: ' + userB[0].nextLevel[tmpLevelB].username);
                                // userB[0].nextLevel.push(foundUser[0]);
                                if(tmpLevelB > -1){
                                    userB[0].nextLevel.splice(tmpLevelB,1);
                                    userB[0].nextLevel.push(foundUser[0]);
                                }
                                userB[0].save();
                                //推荐人的上级的上级如果是钻石会员还能拿10%
                                User.find({phoneNumber:userB[0].parentPhoneNumber}, function (err, userA) {
                                    if(err || !userA.length){
                                        //do nothing
                                    }else {
                                        if(userA[0].nextLevel.length >= 16){
                                            userA[0].income += 3000 * 0.1;
                                            var tmpIncome = {
                                                childName: user.username,
                                                childIdNumber: user.phoneNumber,
                                                childId:user._id,
                                                level: 3,
                                                amount: 300
                                            }
                                            userA[0].incomeDetails.push(tmpIncome);
                                        }
                                        var tmpLevelA = userA[0].nextLevel.findIndex(function (element) {
                                            console.log('UserA nextlevel: ' + userA[0].nextLevel);
                                            console.log('elementA phoneNumber: ' + element.phoneNumber);
                                            console.log('foundUserA phonenumber: ' + foundUser[0].phoneNumber);
                                            return element.phoneNumber == userB[0].phoneNumber;
                                        });
                                        // console.log('tmpLevelA: ' + tmpLevelA);
                                        // console.log('userAtmpLevel: ' + userA[0].nextLevel[tmpLevelA].username);
                                        // userB[0].nextLevel.push(foundUser[0]);
                                        if(tmpLevelA > -1){
                                            userA[0].nextLevel.splice(tmpLevelA,1);
                                            userA[0].nextLevel.push(userB[0]);
                                        }
                                        userA[0].save();
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
    } else {
        req.flash("error", "请输入相同的密码");
        res.redirect('back');
    }
});

//Login routes
router.get('/login', function (req, res) {
    res.render('register/login');
});

router.post('/login', passport.authenticate('local', {
    successRedirect: '/products',
    failureRedirect: '/login',
    successFlash:'登陆成功' ,
    failureFlash: true
}), function (req, res) {
    // req.flash('success', 'Welcome back, ' + req.user.username);
});

//Logout routes
router.get('/logout', function (req, res) {
    req.logout();
    req.flash("success", "退出成功");
    res.redirect('/');
});

//User Profiles
router.get('/users/:id',middlewareObj.loginCheck, function (req, res) {
    User.findById(req.params.id, function (err, foundUser) {
        if (err){
            req.flash('err', err.message);
            res.redirect('back');
        }else {
            res.render("users/show",{user: foundUser});
        }
    });
});
//Edit User Profiles
router.get('/users/:id/edit',middlewareObj.checkUserPermission, function (req, res) {
    User.findById(req.params.id, function (err, foundUser) {
        if(err){
            console.log(err);
            res.redirect('back');
        }else {
            res.render('users/edit', {user: foundUser});
        }
    });
});

//Update User Profiles
router.put('/users/:id',middlewareObj.checkUserPermission, function (req, res) {
    User.findById(req.params.id, function (err, foundUser) {
        if(err){
            console.log(err);
            res.redirect('back');
        }else {
            if(req.user.isAdmin){
                foundUser.userLevel = req.body.userLevel
                if(req.body.withdrawalDetail > 0){
                    if(!foundUser.withdrawal){
                        foundUser.withdrawal = 0;
                    }
                    if(foundUser.income - foundUser.withdrawal - req.body.withdrawalDetail >= 0){
                        console.log('balance: ' + (foundUser.income - foundUser.withdrawal - req.body.withdrawalDetail));
                        var tmpWithdrawal = parseInt(foundUser.withdrawal )+ parseInt(req.body.withdrawalDetail);
                        var tmpWithdrawalDetail = {
                            amount: req.body.withdrawalDetail
                        };
                        foundUser.withdrawal = tmpWithdrawal;
                        foundUser.withdrawalDetails.push(tmpWithdrawalDetail);
                    }else {
                        req.flash("error", "余额不足");
                    }
                }
            }
            foundUser.idNumber = req.body.idNumber;
            foundUser.save();
            res.redirect('/users/' + req.params.id);
        }
    });
});


//Edit User's Password
router.get('/users/:id/password',middlewareObj.checkUserPermission,function (req, res) {
    User.findById(req.params.id, function (err, foundUser) {
        if(err){
            console.log(err);
            res.redirect('back');
        }else {
            res.render('users/password', {user: foundUser});
        }
    });
});

//Update User's Password
router.put('/users/:id/password',middlewareObj.checkUserPermission, function (req, res) {
    User.findById(req.params.id, function (err, foundUser) {
        if(err){
            console.log(err);
            res.redirect('back');
        }else {
            if(req.user.isAdmin){
                foundUser.setPassword('666666', function () {
                    foundUser.save();
                    res.redirect('/admin/' + req.user._id);
                });
            }else {
                var oldPassword = req.body.oldPassword;
                var oldPasswordConfirm = req.body.oldPasswordConfirm;
                var newPassword = req.body.newPassword;
                if(oldPassword === oldPasswordConfirm){
                    foundUser.changePassword(oldPassword, newPassword, function (err) {
                        if(err){
                            console.log('changePassword', err.message);
                            req.flash('error', 旧密码输入错误);
                            res.redirect('/users/' + req.user._id + '/password');
                        }else {
                            req.flash('success', "修改密码成功");
                            res.redirect('/login');
                        }
                    });
                }else{
                    console.log("两次密码不一样");
                    req.flash('error', "两次旧密码不一致");
                    res.redirect('/users/' + req.user._id + '/password');
                }
            }
        }
    });
});


module.exports = router;
