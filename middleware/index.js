var User = require('../module/user');
var middlewareObj = {
    loginCheck: function (req, res, next) {
        if(req.isAuthenticated()){
            return next();
        }
        req.flash('error', "请先登录");
        res.redirect('/login');
    },
    checkUserPermission:function(req, res, next){
        if(req.isAuthenticated()){
            User.findById(req.params.id, function (err, foundUser) {
                if(err){
                    console.log(err);
                    req.flash('error',"User not found");
                    res.redirect('back');
                }else {
                    if(!foundUser)
                        return res.status(400).send("Item not found");
                    if(foundUser._id.equals(req.user._id) || req.user.isAdmin){
                        next();
                    }else {
                        req.flash('error'," You don't have permission to do that.");
                        res.redirect('back')
                    }
                }
            });
        }else{
            req.flash('error', '请先登陆');
            res.redirect('back');
        }
    },
    isAdmin: function (req, res, next) {
        if(req.isAuthenticated()){
            if(req.user.isAdmin)
                return next();
            else{
               req.flash("error", "Not found");
               res.redirect('back');
            }
        }else {
            req.flash("error", "验证失败");
            res.redirect('back');
        }
    }
}

module.exports = middlewareObj;