const express = require("express")
const routeur = express.Router()
const twig = require("twig")
const bodyParser = require("body-parser")
const multer = require("multer")
const { afficher_categorie, afficher_categories, ajouter_categorie, supprimer_categorie, modifier_categorie, modifier_bd, modifier_img } = require("../controllers/categorie.controller")

//destination, cb - callback
const storage = multer.diskStorage({
    destination : (requete, file, cb) => {
      cb(null, "./public/img/")
    },
    filename : (requete, file, cb)=>{
      let date = new Date().toLocaleDateString("es-CL")
      let nameImage = date+"-"+ Math.round(Math.random()*1000) + "-" + file.originalname
      cb(null, nameImage)
    }
})
  
const fileFilter = (requete, file, cb) => {
    if(file.mimetype === "image/jpeg" || file.mimetype === "image/png"){
      cb(null, true)
    }else{
      cb(new Error("Le format de l'image n'est pas acceptée. L'image doit être en format .jpeg ou  .png"), false )
    }
}
  
const upload = multer({
    storage : storage,
    limits : {
      fileSize : 1024 * 1024 * 5
    },
    fileFilter : fileFilter
})

routeur.get("/", afficher_categories)
routeur.get("/:id", afficher_categorie )
routeur.post("/", upload.single("image"), ajouter_categorie)
routeur.post("/delete/:id", supprimer_categorie)
routeur.get("/update/:id", modifier_categorie)
routeur.post("/updateDB", modifier_bd)
routeur.post("/updateImg", upload.single("image"), modifier_img)

module.exports = routeur