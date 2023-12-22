const mongoose = require('mongoose');
mongoose.connect(`mongodb+srv://1234:1234@cluster0.me6dazy.mongodb.net/e-commercedb`)
.then(()=>{
    console.log("DataBase Connected Succesfully");
})
.catch((err)=>{
    console.log(err);
})