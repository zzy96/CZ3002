var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
require('./Models.js').initialize();
var User = mongoose.model("User");
var Hospital = mongoose.model("Hospital");
var Doctor = mongoose.model("Doctor");
var Appointment = mongoose.model("Appointment");

/* GET home page. */
router.get('/', function(req, res, next) {
	if (!req.session.userprofile){
		req.session.userprofile = undefined;
		req.session.doctor = false;
	}
	req.session.popup = false;
    res.render('HomePage', {'session': req.session});
});
router.post('/', function(req, res, next) {
  req.session.popup = true;
  User.find({"username":req.body.username,"password":req.body.password},function(err,docs){
    if (docs[0]){
    	req.session.userprofile = docs[0];
    	req.session.popup = false;
    	res.render('HomePage', {'session': req.session});
    }else{
    	Doctor.find({"username":req.body.username,"password":req.body.password},function(err,docs){
          if (docs[0]){
    	    req.session.userprofile = docs[0];
    	    req.session.doctor = true;
    	    req.session.popup = false;
    	    res.render('HomePage', {'session': req.session});
          }else{
    	    res.render('HomePage', {'session': req.session});
          req.session.popup = false;
          }
        });
    }
  });
});

router.get('/logout', function(req, res, next){
	req.session.userprofile = undefined;
	req.session.doctor = undefined;
	res.redirect('/');
});
router.get('/search_hospital', function(req, res, next) {
	req.session.popup = false;
    res.render('SearchHospital', {'session': req.session});
});
router.get('/search_doctor', function(req, res, next) {
	req.session.popup = false;
    res.render('SearchDoctor', {'session': req.session});
});
router.get('/register', function(req, res, next) {
	req.session.popup = false;
    res.render('Register', {'session': req.session});
});
router.post('/register', function(req, res, next) {
	req.session.popup = false;
	var user = new User({name: req.body.name, username: req.body.username, password: req.body.password, email: req.body.email, contact: req.body.contact, appointment_id:[]});
	user.save(function(err){
		User.find({username: req.body.username, password: req.body.password}, function(err, docs){
    		req.session.userprofile = docs[0];
    		req.session.popup = false;
    		res.redirect("/");
		})
		
	})
})

router.get('/about', function(req, res, next) {
	req.session.popup = false;
    res.render('About', {'session': req.session});
});

module.exports = router;
