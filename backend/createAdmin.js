const mongoose = require("mongoose");
const Employee = require("./models/employees");

mongoose.connect("mongodb://127.0.0.1:27017/EMS");

async function run(){

 await Employee.create({
   first_name:"Admin",
   last_name:"User",
   DoB:new Date("2000-01-01"),
   email:"admin@gmail.com",
   password:"admin123",   // 🔥 plain password only
   access_role:"Admin",
   phone_number:"9999999999",
   address:"test",
   aadhar_number:"123456789012",
   highest_qualification:"BTech",
   year_of_graduation:2020,
   percentage:80,
   joining_date:new Date()
 });

 console.log("Admin created correctly 🔥");
 process.exit();
}

run();
