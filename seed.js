var mongoose = require('mongoose');
var Product = require("./module/product");
var products = [
    {
        name: "产品1",
        price: "10",
        image: "http://img.chinatimes.com/newsphoto/2015-03-12/656/bd0300_p_04_01.jpg",
        description:"敬礼敬礼敬礼就阿萨放假啦进风啦看见啊链接发垃圾说法拉萨解放"
    },
    {
        name: "产品2",
        price: "12",
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQnpX937VR0tZN-ClA7TQUlmszwh4so_KwKtqf5eJPUMrJNQh1DEQ",
        description: "阿里；剑法立刻解放拉萨解放啦就发链接拉萨解放啊上来就发了"
    }
];

function seedDB() {
    //remove all products
    Product.remove({}, function (err) {
        if (err)
            console.log(err);
        else {
            console.log("removed everything.");
        }
    });
    //add a few products
    products.forEach(function (seed) {
        Product.create(seed, function (err, product) {
            if (err)
                console.log(err);
            else {
                console.log('add a new product');
                console.log(product);
            }
        })
    });
}

module.exports = seedDB;