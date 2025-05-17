import express from "express";
import mongoose from "mongoose";
import multer from "multer";
import path from "path";

const app = express();
app.use(express.urlencoded({extended:true}))

import { v2 as cloudinary } from "cloudinary";
cloudinary.config({
  cloud_name: "dhcobsrot",
  api_key: "965654412181328",
  api_secret: "efXbaBvJyFOhMRtkfExDEBg8ToI",
});

mongoose
  .connect(
    "mongodb+srv://danishnanjiani09:fysRY1kajzUejgo4@cluster0.gxyqxyx.mongodb.net/",
    { dbName: "NodeJs_Mastery_Course" }
  )
  .then(() => console.log("MongoDb is Connected"))
  .catch((err) => console.log(err));

//rendering Login ejs file
app.get("/", (req, res) => {
  res.render("login.ejs", {url:null});

});
app.get("/register", (req,res)=>{
    res.render("register.ejs", {url:null});
})


const storage = multer.diskStorage({
  //destination: "./public/uploads",
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix);
  },
});

const upload = multer({ storage: storage });


//Schema
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  filename: String,
  public_id: String,
  imageUrl: String,
});

//model
const User = mongoose.model("user", userSchema);

app.post("/register", upload.single("file"), async (req, res) => {
  const file = req.file.path;
  const {name, email, password} = req.body;

  const cloudinaryRes = await cloudinary.uploader.upload(file, {
    folder: "NodeJS_Mastery_Course",
  });

  //Creating User
  const db = await User.create({
    name,
    email,
    password,
    filename: File.originalname,
    public_id: cloudinaryRes.public_id,
    imageUrl: cloudinaryRes.secure_url,
  });
  res.redirect("/");
   //res.render("register.ejs", { url: cloudinaryRes.secure_url });

  //res.json({message: 'File Uploaded Successfully', cloudinaryRes})
});

app.post("/login", async (req,res)=>{
    const {email, password} = req.body;
    let user = await User.findOne({email})
    if(!user) {res.render("login.ejs");}
    else if(user.password != password){
        res.render("login.ejs")
    }
    else{
        res.render("profile.ejs", {user});
    }

});

const port = 1000;
app.listen(port, () => console.log(`Server started at Port = ${port}`));
