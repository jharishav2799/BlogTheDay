var express           = require("express"),
    bodyParser        = require("body-parser"),
    methodOverride    = require("method-override"),
    passport          = require('passport'),
    expressSanitizer  = require("express-sanitizer"),
    mongoose          = require("mongoose"),
    app               = express(),
    LocalStrategy     = require('passport-local'),
    passportLocalMongoose = require('passport-local-mongoose');
const User                = require('./model/User');

//APP CONFIGURATION

mongoose
   .connect("mongodb+srv://rishav:rishav@cluster0-nejhg.mongodb.net/test?retryWrites=true&w=majority",{useNewUrlParser: true , useUnifiedTopology: true})
   .then(() => console.log('DB IS CONNECTED'))
   .catch( err => console.log(err));

app.set("view engine","ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(expressSanitizer());
app.use(methodOverride("_method"));

//MONGODB CONNECT
const Schema = mongoose.Schema;
var blogSchema=new mongoose.Schema({
  
    title:String,
    image:String,
    body:String,
    created:{type: Date, default: Date.now}
});


var Blog = mongoose.model("Blog",blogSchema);



//==================
//PASSPORT CONFIG
//==================s

app.use(require('express-session')
({
     secret: 'pratyush is @@@@@@',
     resave: false,   
     saveUninitialized:false
}));
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req,res,next){
    res.locals.currentUser = req.user;
    next();
})


//=============
//AUTH ROUTES
//=============

app.get('/blogs/register', function(req,res)  {
    res.render('signup');
});


app.post('/blogs/register' , function(req,res) {

    User.register(new User({username:req.body.username, name: req.body.name}),req.body.password, function(err,user){
        if(err)
        {
            console.log(err);
            return res.render('signup');
        }
        passport.authenticate("local")(req,res,function() {
            res.redirect('/blogs');
        });
   });
});

app.get('/blogs/login', function(req,res){
    res.render("login");
});

app.post('/blogs/login',passport.authenticate("local",{
    successRedirect:'/',
    failureRedirect:'/blogs/login'
      }), function(req,res){
        })

app.get('/blogs/logout', function(req,res){

    req.logout();
    res.redirect('/');

});

function isLoggedIn(req,res,next)
{
    if(req.isAuthenticated())
    {
       return next();
    }
    res.redirect('/blogs/login');
}

//ROUTES

app.get("/", function(req, res){
    res.redirect("/blogs"); 
 });

app.get('/blogs/myblogs',function(req,res)
{   
    Blog.find({id:req.user.id}).populate('userid').then(() => res.render('index',{blogs: blogs})).catch( err => console.log(err));
});
 



app.get('/blogs', function(req,res){
    Blog.find({}, function(err,blogs){
        if(err)
        {
            console.log("SOME ERROR OCCURED IN DATABASE");
        }
        else
        {
            
            res.render("index", {blogs: blogs});
        }
    });
});

app.get('/blogs/new',isLoggedIn, function(req,res){
    Blog.userid = req.user.id;      
    res.render("new");
});

app.post('/blogs', function(req,res){
  
    Blog.create(req.body.blog, function(err,newBlog){
        if(err)
        {
            res.render("new");
        }
        else
        {
            res.redirect("/blogs");
        }
    });
});

app.get('/blogs/:id', function(req,res){
    Blog.findById(req.params.id, function(err,foundBlog){
        if(err)
        {
            res.redirect('/blogs');
        }
        else
        {
            res.render('show', {blog: foundBlog});
        }
    });
});

app.get('/blogs/:id/edit', function(req,res){
    Blog.findById(req.params.id, function(err,foundBlog){
        if(err)
        {
            res.redirect('/blogs');
        }
        else
        {
            res.render('edit', {blog:foundBlog});
        }
    });
});

app.put('/blogs/:id', function(req,res){
    req.body.blog.body=req.sanitize( req.body.blog.body);
    Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err,updatedBlog){
        if(err)
        {
            res.redirect('/blogs');
        }
        else{
            res.redirect('/blogs/'+req.params.id);
        }
    });
});

app.delete('/blogs/:id', function(req,res){ 
    Blog.findByIdAndRemove(req.params.id, function(err)
    {
        if(err)
         res.redirect('/blogs');
        else
        {
           res.redirect('/blogs');
        }
    });
});



//====================
//SERVER CONNECTION
//====================


app.listen(8080, process.env.IP, function(){
    console.log("SERVER IS RUNNING!");
});