const express = require("express")
const routeur = express.Router()
const twig = require("twig")
const bodyParser = require("body-parser")
const multer = require("multer")
const familleControlleur = require("../controllers/famille.controller")

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

routeur.get("/" , familleControlleur.afficher_familles )
routeur.get("/:id" , familleControlleur.afficher_famille )
routeur.post("/" , upload.single('image'), familleControlleur.ajout_famille )
routeur.post("/delete/:id" , familleControlleur.supprimer_famille )
routeur.get("/update/:id", familleControlleur.modifier_famille )
routeur.post("/updateServer" , familleControlleur.modifier_serveur )
routeur.post("/updateImage" , upload.single("image"), familleControlleur.modifier_image )


module.exports = routeur