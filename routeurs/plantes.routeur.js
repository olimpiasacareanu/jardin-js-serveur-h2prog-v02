const express = require("express")
const routeur = express.Router()
const twig = require("twig")
const bodyParser = require("body-parser")
const multer = require("multer")
const plantesControlleur = require("../controllers/plante.controller")

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

routeur.get("/", plantesControlleur.plantes_affichage)
routeur.post("/", upload.single("image"), plantesControlleur.plante_ajout)
routeur.get("/:id", plantesControlleur.plante_detail)
routeur.get("/update/:id", plantesControlleur.plante_modification)
routeur.post("/updateServer", plantesControlleur.modification_serveur)
routeur.post("/updateImage", upload.single("image"), plantesControlleur.modification_image)
routeur.post("/delete/:id", plantesControlleur.suppression_plante)

module.exports = routeur