const express = require('express');
const app = express();
const cors = require("cors")
require("./db/config.js");
const User = require("./db/models/userModel.js");
const Product = require("./db/models/productModel.js");
const Jwt = require('jsonwebtoken');
require('dotenv').config();
const jwtKey='e-com';
app.use(cors(
    {
       
       methods:["POST","GET","DELETE","PUT"],
       credentials:true
    }
));
app.use(express.json());

// interview Question Cors issue (how to fix it)

// Register api
app.get('/',(req,res)=>{
    res.send("Backend");
})
app.post('/register', async (req,res)=>{
   
    
    let user = new User(req.body);
    console.log(req.body);
    let result = await user.save();
    result = result.toObject();
    delete result.password;
    Jwt.sign({result},jwtKey,{expiresIn:"2h"},(error,token)=>{
        if(error){
            res.send({result:"something went wrong"})
        }
        res.send({result,auth:token});     
    })
  
});
app.post('/login',async (req,res)=>{
    if(req.body.password && req.body.email){
        try {
            let user = await User.findOne(req.body).select("-password");
            if (user) {
                // Convert user to plain object before sending as response
                const userObject = user.toObject();
                delete userObject.password;
                Jwt.sign({userObject},jwtKey,{expiresIn:"2h"},(error,token)=>{
                    if(error){
                        res.send({result:"something went wrong"})
                    }
                    res.send({userObject,auth:token});     
                })
                
            } else {
                res.json({ result: "User not found" });
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ result: "Internal Server Error" });
        }
    }
    else{
        res.send({ result:"No Result found"})
    }

  
   
});
app.post('/add-product',verifyToken, async (req,res)=>{
    let product = new Product(req.body);
    let result = await product.save();
    res.send(result);

});
app.get('/products',verifyToken,async (req,res) => {
    let products = await Product.find();
    if(products.length>0){
        res.send(products);
    }
    else{
        res.send({result:"No products found"})
    }
});
app.delete('/product/:id',verifyToken,async (req,res)=>{
    try {
        const result = await Product.deleteOne({ _id: req.params.id });
        res.send(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ result: "Internal Server Error" });
    }
});
app.get('/product/:id',verifyToken, async (req,res)=>{
    try {
        const result = await Product.findOne({ _id: req.params.id });
        if(result){
        res.send(result);
        }
        else{
           res.send({result:"No record found"});
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ result: "Internal Server Error" });
    }
   
});
app.put("/product/:id",verifyToken, async (req,res)=>{
     let result = await Product.updateOne(
        {_id:req.params.id},
        {
            $set:req.body
        }

     );
     res.send(result);

});
app.get("/search/:key",verifyToken, async (req,res)=>{
    console.log(req.params.key);
  let result = await Product.find({
    "$or":[
        { "name":{ $regex:req.params.key } },
        { "company":{ $regex:req.params.key } },
        { "category":{ $regex:req.params.key } },
    ]
  });
  res.send(result)
});
function verifyToken(req,res,next){
    let token = req.headers["authorization"];
    if(token){
      
       Jwt.verify(token,jwtKey,(error,success)=>{
        if(error){
            res.status(401).send({result:"Please provide valid token with heders"})
        }
        else{
            next();

        }
       })
    }
    else{
       res.status(404).send({result:"Please add token with heders"})
    }

}
app.listen(process.env.Port,()=>{
    console.log("Server is Running");

})