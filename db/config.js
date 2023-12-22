const mongoose = require('mongoose');
require('dotenv').config();
mongoose.connect(process.env.MONGODB_URI)
.then(()=>{
    console.log("DataBase Connected Succesfully");
})
.catch((err)=>{
    console.log(err);
})