const express = require("express")
const routeur = express.Router()
const twig = require("twig")
const bodyParser = require("body-parser")
const multer = require("multer")

routeur.get("/", (requete, reponse)=>{
    reponse.render("index.html.twig")
})

routeur.use((requete, reponse, suite) =>{
    const error = new Error("Page non trouvée")
    error.status = 404
    suite(error)
})

routeur.use((error, requete, reponse) => {
    reponse.status(error.status || 500);
    reponse.end(error.message)
})

module.exports = routeur