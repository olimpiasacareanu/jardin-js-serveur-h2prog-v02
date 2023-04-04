const mongoose = require("mongoose")

const planteSchema = mongoose.Schema({
    _id : mongoose.Schema.Types.ObjectId,
    nom : String,
    nomLatin : String,
    famille : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Famille",
        required : true
    },
    categorie : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Categorie",
        required : true
    },
    description : String,
    img : String
}) 

module.exports = mongoose.model('Plante', planteSchema)