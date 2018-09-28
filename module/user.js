var mongoose = require('mongoose');
var passportLocalMongoose = require('passport-local-mongoose');
var userSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: true,
        required: true
    },
    password: String,
    phoneNumber: {
        type: String,
        unique: true,
        required: true
    },
    // email: {
    //     type: String,
    //     unique: true,
    //     required: false
    // },
    parentPhoneNumber: {
        type:String,
        unique: false,
        required: false
    },
    nextLevel:[this],
    income: Number,
    incomeDetails:[
        {
            createdAt:{
                type: Date,
                default: Date.now
            },
            childName: String,
            childIdNumber: String,
            childId:String,
            status:{
                type: Boolean,
                default: false
            },
            level: String,
            amount: Number
        }
    ],
    withdrawal:{
      type: Number,
      default: 0
    },
    withdrawalDetails:[
        {
            createdAt:{
                type: Date,
                default: Date.now
            },
            amount: Number
        }
    ],
    idNumber:{
      type: String,
      unique: true
    },
    address:{
      type:String,
      required:true
    },
    date:{
      type: Date,
      default:Date.now
    },
    userLevel:{
      type:Number,
      default:1
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    status:{
        type:Boolean,
        default:false
    }
});
userSchema.plugin(passportLocalMongoose);
var User = mongoose.model('User', userSchema);
module.exports = User;