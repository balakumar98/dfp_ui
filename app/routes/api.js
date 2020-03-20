var models = require('../models/user');
var jwt = require('jsonwebtoken');
var secret = "dfp";

module.exports = function(router){

    router.post('/firstAdmin', function(req,res) {
        var user = new models.User();
        user.username = 'admin101';
        user.password = 'Admin@101';
        user.email = 'dfpadmin@gmail.com';
        user.firstname = 'Bala Kumar';
        user.permission = 'admin';
        user.status = 'Active';
        user.save();
    })

    // User Registration
    // http://localhost:8888/api/users
    router.post('/users', function(req,res) {
        var user = new models.User();
        user.username = req.body.username;
        user.password = req.body.password;
        user.email = req.body.email;
        user.firstname = req.body.firstname;
        user.lastname = req.body.lastname;
        user.permission = 'user';
        user.status = 'Inactive';
        if(user.username == null || user.username == '' || 
           user.password == null || user.password == '' || 
           user.email == null || user.email == '' ||
           user.firstname == null || user.firstname == ''){
            res.json({success:false, message:'Username/password/email/firstname missing.' })
        } else {
            user.save(function(err){
                if(err){
                    if(err.errors != null){
                        if(err.errors.firstname){
                            res.json({success:false, message: err.errors.firstname.message });
                        } else if(err.errors.lastname) {
                            res.json({success: false, message: err.errors.lastname.message});
                        } else if(err.errors.email) {
                            res.json({success: false, message: err.errors.email.message});
                        } else if(err.errors.username) {
                            res.json({success: false, message: err.errors.username.message});
                        } else if(err.errors.password) {
                            res.json({success: false, message: err.errors.password.message});
                        }
                    } else if(err) {
                        if(err.code == 11000){
                            console.log(err.errmsg[60]);
                            if(err.errmsg[60] == 'u'){
                                res.json({success: false, message: 'Username is already taken.'})
                            } else if(err.errmsg[60] == 'e'){
                                res.json({success: false, message: 'Email is already taken.'});
                            } else {
                                res.json({success: false, message: err.errmsg});
                            } 
                        } else {
                            res.json({success: false, message: err});
                        }
                        
                    } 
                
                } else {
                    res.json({success:true, message:'User created succesfully.' })
                }
            })
    
        }
    });

    // User Login
    // http://locahost:8888/api/authenticate
    router.post('/authenticate', function(req,res){
        if(req.body.username == null || req.body.username == ''){
            res.json({success: false, message: 'Username not provided.'})
        }
        if(req.body.password == null || req.body.password == ''){
            res.json({success: false, message: 'Password not provided.'})
        }

        models.User.findOne({username: req.body.username}).select('email username password permission status').exec(function(err, user){
            if(err) throw err;
            if(!user) {
                res.json({success: false, message: 'Could not authenticate user.'})
            } else if(user) {
                var validPassword = user.comparePassword(req.body.password);
                if(!validPassword){
                    res.json({ success: false, message: 'Could not authenticate password.'})
                } else {
                    if(user.status == 'Inactive'){
                        res.json({success: false, message: "Your account is not activated. \n Please contact administrator if this was unexpected."})
                    } else {
                        var token = jwt.sign({
                            username: user.username,
                            email: user.email
                        }, secret, {expiresIn: '6h'})
                        console.log(user.permission);
                        if(user.permission == 'admin'){
                            console.log('Logging in as admin.');
                            res.json({ success: true, admin: true, message: 'User authenticated!', token: token})
                        }else {
                            console.log('Logging in as user.')
                            res.json({ success: true, message: 'User authenticated!', token: token})
                        }
                    }
                    
                }
            }
        })
    })

    router.post('/checkUsername', function(req,res){
 
        models.User.findOne({username: req.body.username}).select('username').exec(function(err, user){
            if(err) throw err;
            if(user) {
                res.json({success: false, message: "Username is already taken."})
            } else {
                res.json({success: true, message: 'Valid Username.'})
            }
        })
    })

    router.post('/checkEmail', function(req,res){
 
        models.User.findOne({email: req.body.email}).select('email').exec(function(err, user){
            if(err) throw err;
            if(user) {
                res.json({success: false, message: "Email is already taken."})
            } else {
                res.json({success: true, message: 'Valid Email.'})
            }
        })
    })






    router.use(function(req,res,next){
        var token = req.body.token || req.body.query || req.headers["x-access-token"];
        if(token) {
            jwt.verify(token,"dfp", function(err,decoded){
                if(err) {
                    res.json({success: false, message: 'Token invalid.'});
                } else {
                    req.decoded = decoded;
                    next();
                }
            })
        } else {
            res.json({success: false, message: 'No token provided.'});
        }
    })


    // Get Current User
    // http://localhost:8888/api/currentUser
    router.post('/currentUser', function(req,res) {
        res.send(req.decoded);
    })

    router.get('/renewToken/:username', function(req,res){
        models.User.findOne({username: req.params.username}).select().exec(function(err,user){
            if(err) throw err;
            if(!user){
                res.json({success: false,message:'No user was found.'});
            } else {
                var newToken = jwt.sign({
                    username: user.username,
                    email: user.email
                }, secret, {expiresIn: '6h'})
                res.json({ success: true,  token: newToken})
           
            }
        })
    })

    router.get('/permission', function(req,res) {
        console.log(req.decoded.username);
        models.User.findOne({username: req.decoded.username}, function(err,user) {
            if(err) throw err;
            if(!user) {
                res.json({success: false, message: 'User was not found.'});
            }else {
                res.json({success: true, permission: user.permission});
            }
        })
    })

    router.get('/userManagement', function(req,res) {
        models.User.find({username: {$ne: req.decoded.username}}, function(err,users) {
            if(err) throw err;
            models.User.findOne({username: req.decoded.username}, function(err, mainUser) {
                if(err) throw err;
                if(!mainUser) {
                    res.json({success:false, message: 'No User found.'})
                } else {
                    if(mainUser.permission == 'admin'){
                        if(!users) {
                            res.json({success:false, message: 'No users found.'});
                        } else {
                            res.json({success: true, users: users, permission: mainUser.permission});
                        }
                    } else {
                        res.json({success: false, message: 'Not permitted to perform this action.'})
                    }
                }
            })
        })
    })

    router.delete('/userManagement/:user', function(req,res){
        var deletedUser = req.params.user;
        models.User.findOne({username: req.decoded.username}, function(err, mainUser) {
            if(err) throw err;
            if(!mainUser) {
                res.json({success : true, message: 'No user found.'})
            } else {
                if(mainUser.permission != 'admin'){
                    res.json({success: true, message: 'Access denied.'})
                } else {
                    if(req.decoded.username == deletedUser){
                        res.json({success: false, message: 'Cannot remove self.'})
                    }
                    models.User.findOneAndRemove({username: deletedUser}, function(err,user){
                        if(err) throw err;
                        res.json({success: true})
                    })
                }
            }
        })
    })

    router.post('/activateUser', function(req,res) {
        console.log('Activating user :'+req.body.user);
        models.User.findByIdAndUpdate({_id: req.body.user.id},{$set:{group:req.body.user.group,
                                                                        subGroup:req.body.user.subGroup,
                                                                        role:req.body.user.role,
                                                                        status: 'Active'}}, function(err,upuser){
            if(err) throw err;
            if(!upuser) {
                console.log('Not found.')
                res.json({success: false, message: 'User not found.'});
            } else {
                console.log('Activated.')
                res.json({success: true, message: 'User account activated.'});
            }
        })
    })

    router.put('/deactivateUser/:id', function(req,res) {
        models.User.findByIdAndUpdate({_id: req.params.id},{$set:{status: 'Inactive'}}, function(err,user){
            if(err) throw err;
            if(!user) {
                console.log('Not found.')
                res.json({success: false, message: 'User not found.'});
            } else {
                res.json({success: true, message: 'User account deactivated.'});
            }
        })
    })


    router.get('/groupManagement', function(req,res) {
        models.Group.find({}, function(err,groups) {
            if(err){
                console.log('Errrrrooooor.')
                throw err;
            } 
            models.User.findOne({username: req.decoded.username}, function(err, mainUser) {
                if(err) throw err;
                if(!mainUser) {
                    res.json({success:false, message: 'No User found.'})
                } else {
                    if(mainUser.permission == 'admin'){
                        if(!groups) {
                            res.json({success:false, message: 'No users found.'});
                        } else {
                            res.json({success: true, groups: groups, permission: mainUser.permission});
                        }
                    } else {
                        res.json({success: false, message: 'Not permitted to perform this action.'})
                    }
                }
            })
        })
    })

    return router;
}


