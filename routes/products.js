var express = require('express');
var router = express.Router();
var Product = require("../module/product");
var Comment = require('../module/comment');
var middlewareObj = require('../middleware/index');
var imagePrestring = "https://res.cloudinary.com/juechen/image/upload/c_scale,h_400,w_700/v";
//Upload image configuration
var multer = require('multer');
var storage = multer.diskStorage({
    filename: function (req, file, callback) {
        callback(null, Date.now() + file.originalname);
    }
});
var imageFilter = function (req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
var upload = multer({
    storage: storage,
    fileFilter: imageFilter
});
var cloudinary = require('cloudinary');
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});
//=====================
//Product Routes
//=====================

//Get all products
router.get('/', function (req, res) {
    Product.find({}, function (err, products) {
        if (err) {
            console.log(err);
            req.flash("error", err.message);
            res.redirect('back');
        } else {
            res.render('products/products', {products: products});
        }
    });
});

//Post a new product(need admin permission)
router.post('/', middlewareObj.isAdmin, upload.single('local_image'), function (req, res) {
    var name = req.body.name;
    var price = req.body.price;
    var description = req.body.description;
    var image;
    var image_public_id;
    cloudinary.uploader.upload(req.file.path, function (result) {
        image_public_id = result.public_id;
        image = imagePrestring + result.version + "/" + result.public_id + "." + result.format;
        console.log(result.public_id);
        console.log(result);
    }).then(function () {
        var newProduct = {
            name: name,
            price: price,
            description: description,
            image: image,
            image_public_id: image_public_id
        };
        Product.create(newProduct, function (err, product) {
            if (err) {
                req.flash("error", err.message);
                res.redirect('back');
            } else {
                console.log('add a new product');
                console.log(product);
                res.redirect('/products');
            }
        });
    });
});

//Add a new product (need admin permission)
router.get('/new', middlewareObj.isAdmin, function (req, res) {
    res.render('products/new');
});

//Show a product route
router.get('/:id', function (req, res) {
    Product.findById(req.params.id).populate('comments').exec(function (err, foundProduct) {
        if (err) {
            req.flash("error", err.message);
            res.redirect('back');
        } else {
            if (foundProduct)
                res.render('products/show', {product: foundProduct});
            else
                res.redirect('products');
        }
    });
});

//Add a comment to a product
router.post('/:id', middlewareObj.loginCheck, function (req, res) {
    Product.findById(req.params.id, function (err, foundProduct) {
        if(err){
            req.flash("error", err.message);
            res.redirect('back');
        }else {
            console.log(req.body.comment);
            var comment = req.body.comment;
            Comment.create(comment, function (err, newComment) {
                if(err){
                    req.flash("error",err.message);
                    res.redirect('back');
                }else {
                    newComment.author.id = req.user._id;
                    newComment.author.username = req.user.username;
                    newComment.save();
                    foundProduct.comments.push(newComment);
                    foundProduct.save();
                    res.redirect('/products/' + req.params.id);
                }
            });
        }
    });
});
//Update a product routes (need admin permission)
router.get('/:id/edit', middlewareObj.isAdmin, function (req, res) {
    Product.findById(req.params.id, function (err, foundProduct) {
        if (err) {
            req.flash("error", err.message);
            res.redirect('/products');
        } else {
            res.render('products/edit', {product: foundProduct});
        }
    });
});
//export module
module.exports = router;