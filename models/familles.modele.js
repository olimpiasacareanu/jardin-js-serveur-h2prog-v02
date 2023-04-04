const mongoose = require("mongoose")

const familleSchema = mongoose.Schema({
    _id : mongoose.Schema.Types.ObjectId,
    nom : String,
    nomLatin : String,
    description : String,
    img : String
})

familleSchema.virtual("plantes", {
    ref :  "Plante",
    localField : "_id",
    foreignField : "famille"
})

module.exports = mongoose.model("Famille", familleSchema)