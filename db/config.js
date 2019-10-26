const mongoose = require("mongoose")

//connects to the local db throught the port 27017. db name is TrueAndFalse.
mongoose.connect("mongodb://localhost:27017/TrueAndFalse",{ useNewUrlParser: true , 
    useUnifiedTopology: true})

exports.mongoose = mongoose