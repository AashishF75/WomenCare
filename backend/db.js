const mongoose = require("mongoose");

/* LOCAL DATABASE */

const localDB = "mongodb+srv://ashish:Aashish2006@cluster0.gnxspvv.mongodb.net/?appName=Cluster0";

/* ATLAS DATABASE (for hosting later) */

const atlasDB = process.env.MONGO_URI;

/* CONNECT DATABASE */

mongoose.connect(atlasDB || localDB)
.then(()=>{
console.log("MongoDB Connected");
})
.catch((err)=>{
console.log("MongoDB Error:", err);
});

module.exports = mongoose;