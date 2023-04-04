const mongoose = require("mongoose")

const categorieSchema = mongoose.Schema({
    _id : mongoose.Schema.Types.ObjectId,
    nom : String,
    description : String,
    img : String
}) 

categorieSchema.virtual("plantes", {
    ref :  "Plante",
    localField : "_id",
    foreignField : "categorie"
})

module.exports = mongoose.model('Categorie', categorieSchema)