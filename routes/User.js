var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = function(){
  var User = new Schema({
    name:           String,
    username:       String,
    password:       String,
    email:          String,
    contact:        String,
    appointment_id: Array
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
      score:       Number,
      count:       Number,
      address:     String
   },{collection:'Hospital'});
   mongoose.model("Hospital",Hospital);

   var Doctor = new Schema({
	   name:           String,
	   contact:        String,
	   email:          String,
	   username:       String,
	   password:       String,
	   hospital:       Number,
     hospital_name:  String,
	   department:     String,
	   appointment_id: Array,
	   image:          String,
     score:          Number,
     brief_intro:    String,
     count:          Number
    },{collection:'Doctor'});
    mongoose.model("Doctor",Doctor);

    var Appointment = new Schema({
	    appointment_id: String,
	    date:           String,
	    start_time:     Number
    },{collection:'Appointment'});
    mongoose.model("Appointment",Appointment);
};
