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
  Hospital.find({},function(err,docs){
    req.session.hospital_list = docs;
    if (!req.session.userprofile){
      req.session.userprofile = undefined;
      req.session.doctor = false;
    }
    req.session.popup = false;
    res.render('HomePage', {'session': req.session});
  });
});

router.post('/', function(req, res, next) {
  req.session.popup = true;
  User.find({"username":req.body.username,"password":req.body.password},function(err,docs){
    if (docs[0]){
    	req.session.userprofile = docs[0];
    	req.session.popup = false;
      console.log(req.session)
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
  req.session.destroy();
	res.redirect('/');
});
router.get('/search_hospital', function(req, res, next) {
  Hospital.find({},function(err,docs){
    req.session.hospital_list = docs
    req.session.popup = false;
    res.render('SearchHospital', {'session': req.session});
  });
});
router.get('/search_doctor', function(req, res, next) {
	Doctor.find({},function(err,docs){
    req.session.doctor_list = docs
    req.session.popup = false;
    res.render('SearchDoctor', {'session': req.session});
  });
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

router.get('/profile', function(req, res, next) {
  Appointment.find({},function(err,docs){    
    req.session.appointment_list = docs;
    if (req.session.doctor){
      res.render('DoctorProfile', {'session': req.session});
    }else{
      res.render('UserProfile', {'session': req.session});
    }
  });
});

router.get('/booking/:doctor_id',function(req, res, next){
  Doctor.find({_id:req.params.doctor_id},function(err,docs){
    req.session.doctorprofile = docs[0];
    Appointment.find({},function(err,docs){    
      req.session.appointment_list = docs;
      User.findOne({username: req.session.userprofile.username, password: req.session.userprofile.password},function(err,doc){
        req.session.userprofile = doc
        res.render('Booking',{'session': req.session});
      })
    });
  })
})

router.post('/book_success',function(req, res, next){
  var appointment = new Appointment({appointment_id: (new Date()).valueOf(), start_time:req.body.start_time, date: req.body.date});
  appointment.save(function(err){
    console.log(req.session.userprofile.username)
        User.findOne({username: req.session.userprofile.username, password: req.session.userprofile.password}, function (err, doc){
          console.log("doc:"+doc)
          var appointment_list;
          if (!doc.appointment_id){
            appointment_list = [];
          }else{
            appointment_list = doc.appointment_id;
          }
          appointment_list.push(appointment.appointment_id)
          console.log("appointment: "+appointment_list)
          doc.appointment_id = appointment_list;
          console.log(doc)
          doc.save();
          Doctor.findOne({username: req.session.doctorprofile.username, password: req.session.doctorprofile.password},function(err,doc){
            var appointment_list;
            if (!doc.appointment_id){
              appointment_list = [];
            }else{
              appointment_list = doc.appointment_id;
            }
            appointment_list.push(appointment.appointment_id);
            doc.appointment_id = appointment_list;
            doc.save();
            req.session.popup = false;
            res.render('BookingSuccess', {'session': req.session});
          });
        })
  })
})

router.post('/book_cancel',function(req, res, next){
  Appointment.remove({ appointment_id: req.body.appointment_id }, function(err) {
    var appointment_id = req.body.appointment_id
    console.log(req.session.userprofile.username)
        User.findOne({username: req.session.userprofile.username, password: req.session.userprofile.password}, function (err, doc){
          console.log("doc:"+doc)
          var appointment_list;
          if (!doc.appointment_id){
            appointment_list = [];
          }else{
            appointment_list = doc.appointment_id;
          }
          appointment_list.pop(appointment_id)
          console.log("appointment: "+appointment_list)
          doc.appointment_id = appointment_list;
          console.log(doc)
          doc.save();
          Doctor.findOne({username: req.session.doctorprofile.username, password: req.session.doctorprofile.password},function(err,doc){
            var appointment_list;
            if (!doc.appointment_id){
              appointment_list = [];
            }else{
              appointment_list = doc.appointment_id;
            }
            appointment_list.pop(appointment_id);
            doc.appointment_id = appointment_list;
            doc.save();
            req.session.popup = false;
            res.redirect("/booking/"+doc._id)
          });
        })
  })
})

router.post('/booking/:doctor_id', function(req, res, next){
  Doctor.findOne({_id: req.params.doctor_id}, function (err, doc){
    doc.score = Math.round(10*(doc.score*doc.count+parseInt(req.body.rate))/(doc.count+1))/10
    doc.count++;
    doc.save();
    User.findOne({username: req.session.userprofile.username, password: req.session.userprofile.password},function(err,doc){
      req.session.userprofile = doc
      res.redirect('/booking/'+req.params.doctor_id.toString())
    })
  })
})

router.get('/hospital_rating',function(req, res, next){
  Hospital.find({}).sort({score:-1}).exec(function(err,docs){
    console.log(err)
    req.session.hospital_list = docs
    req.session.popup = false;
    res.render('SearchHospital', {'session': req.session});
  });
})

router.get('/hospital_name',function(req, res, next){
  Hospital.find({}).sort({name:1}).exec(function(err,docs){
    console.log(err)
    req.session.hospital_list = docs
    req.session.popup = false;
    res.render('SearchHospital', {'session': req.session});
  });
})

router.get('/doctor_rating',function(req, res, next){
  Doctor.find({}).sort({score:-1}).exec(function(err,docs){
    console.log(err)
    req.session.doctor_list = docs
    req.session.popup = false;
    res.render('SearchDoctor', {'session': req.session});
  });
})

router.get('/doctor_name',function(req, res, next){
  Doctor.find({}).sort({name:1}).exec(function(err,docs){
    console.log(err)
    req.session.doctor_list = docs
    req.session.popup = false;
    res.render('SearchDoctor', {'session': req.session});
  });
})

router.get('/hospital/:hospital_id',function(req, res, next){
  Hospital.findOne({_id:req.params.hospital_id},function(err,doc){
    req.session.hospitalprofile = doc;
      res.render('Hospital',{'session': req.session});
  })
})

router.post('/hospital/:hospital_id', function(req, res, next){
  Hospital.findOne({_id: req.params.hospital_id}, function (err, doc){
    doc.score = Math.round(10*(doc.score*doc.count+parseInt(req.body.rate))/(doc.count+1))/10
    doc.count++;
    doc.save();
    res.redirect('/hospital/'+req.params.hospital_id.toString())
  })
})

router.get('/about', function(req, res, next) {
	req.session.popup = false;
    res.render('About', {'session': req.session});
});

module.exports = router;
