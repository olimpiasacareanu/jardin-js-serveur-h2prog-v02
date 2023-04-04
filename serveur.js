const express = require("express")
const serveur = express()
const morgan = require("morgan")
const routerPlante = require("./routeurs/plantes.routeur")
const routerFamille = require("./routeurs/familles.routeur")
const routerCategories = require("./routeurs/categories.routeur")
const routerGlobal = require("./routeurs/global.routeur")
const mongoose = require("mongoose")
const bodyParser = require("body-parser")
const session = require("express-session")

serveur.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true,
    cookie: { maxAge: 60000 }
  }))

mongoose.connect("mongodb://localhost/Jardin", {useNewUrlParser:true, useUnifiedTopology : true})

const planteModel = require("./models/plantes.modele")

serveur.use(express.static("public"))
serveur.use(morgan("dev")) //erreurs
serveur.use(bodyParser.urlencoded({extended:false})) //traiter les url et les infos postées
serveur.set('trust proxy', 1)

serveur.use((requete, reponse, suite) => {
    reponse.locals.message = requete.session.message
    delete requete.session.message
    suite()
})

serveur.use("/plantes", routerPlante)
serveur.use("/categories", routerCategories)
serveur.use("/familles", routerFamille)
serveur.use("/", routerGlobal)

serveur.listen(8080) // port

