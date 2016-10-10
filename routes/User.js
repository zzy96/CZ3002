var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = function(){
  var User = new Schema({
    name:           String,
    username:       String,
    password:       String,
    email:          String,
    contact:        String,
    appointment_id: String
  },{collection: 'User'});
  mongoose.model("User",User);
  
  var Hospital = new Schema({
      name:        String,
      id:          Number,
      latitude:    Number,
      longitude:   Number,
      brief_intro: String,
      department:  Array,
      image:       String,
      score:       Number 
   },{collection:'Hospital'});
   mongoose.model("Hospital",Hospital);

   var Doctor = new Schema({
	   name:           String,
	   contact:        String,
	   Email:          String,
	   username:       String,
	   password:       String,
	   hospital:       Number,
	   department:     String,
	   appointment_id: String,
	   image:          String,
     score:          Number,
     brief_intro:    String
    },{collection:'Doctor'});
    mongoose.model("Doctor",Doctor);

    var Appointment = new Schema({
	    appointment_id: String,
	    date:           String,
	    start_time:     Number,
	    end_time:       Number
    },{collection:'Appointment'});
    mongoose.model("Appointment",Appointment);
};
