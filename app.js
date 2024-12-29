if(process.env.NODE_ENV != "production") {
    require('dotenv').config();
}

const express = require('express');
const app = express();
const path = require('path');
const session = require("express-session");
const flash = require('connect-flash');
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const mongoose = require("mongoose");

const listingRouter = require('./routes/listing.js');
const userRouter = require('./routes/user.js');

const MONGO_URL = "mongodb://localhost:27017/gostream";

main()
.then(() => {
    console.log("connected to db");
}).catch((err) => {
    console.log(err);
})
async function main(){
   await mongoose.connect(MONGO_URL);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

const sessionOptions = {
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now()+ 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true
    }
};

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
})

app.use("/listings", listingRouter);
app.use("/", userRouter);


app.use((err, req, res, next)=>{
    let {statusCode=500, message="Something went wrong!"} = err;
    res.status(statusCode).render("error.ejs", {message});
});

app.listen(8080, () => {
    console.log("listening on port 8080");
})