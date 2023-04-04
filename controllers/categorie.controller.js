const categorieSchema = require("../models/categories.modele")
const planteSchema = require("../models/plantes.modele")
const fs = require("fs")
const { request } = require("http")
const mongoose = require("mongoose")

exports.afficher_categorie = (requete, reponse) => {
    categorieSchema.findById(requete.params.id)
    .populate("plantes")
    .exec()
    .then(categorie=>{
        reponse.render("categories/categorie.html.twig", {categorie : categorie, isModification : false})
    })
    .catch(error => {
        console.log(error)
    })
}

exports.afficher_categories = (requete, reponse) =>{
    categorieSchema.find()
    .populate("plantes")
    .exec()
    .then(categories => {
        reponse.render("categories/liste.html.twig", {categories : categories}  )
    })
    .catch(error=>{
        console.log(error)
    })
}

exports.ajouter_categorie = (requete, reponse) => {
    const categorie = new categorieSchema({
        _id: new mongoose.Types.ObjectId(),
        nom : requete.body.nom,
        description: requete.body.description,
    })
     // Ajouter une image par defaut si une autre n'est pas choisi
     if(typeof requete.file === "undefined"){
        categorie.img = "default.png"
    }else{
        categorie.img = requete.file.path.substring(11)
    }
    categorie.save()
    .then(resultat =>{
        reponse.redirect("/categories")
    })
    .catch(error=>{
        console.log(error)
    })
}

exports.supprimer_categorie = (requete, reponse) => {
    //chercher la catégorie anonyme
    categorieSchema.find()
    .where("nom").equals("anonyme")
    .exec()
    .then(categorie => {
        // Modifier l'id de la categorie de la plante par l'id anonyme
        planteSchema.updateMany({"categorie" : requete.params.id}, {"$set" : { "categorie" : categorie[0]._id}}, {"multi" : true})
        .exec()
        .then(
            categorieSchema.deleteOne({_id : requete.params.id})
            // supprimer tous les catégories sauf celle anonyme
            .where("nom").ne("anonyme")
            .exec()
            .then(()=>{
                reponse.redirect("/categories")
            })
            .catch(console.error())
        )
    })
}

exports.modifier_categorie = (requete, reponse) => {
    categorieSchema.findById({_id : requete.params.id})
    .exec()
    .then(categorie => {
        reponse.render("categories/categorie.html.twig", {categorie : categorie, isModification : true})
    })
    .catch(console.error())
}

exports.modifier_bd = (requete, reponse) => {
    const categorieUpdate = {
        "nom" : requete.body.nom,
        "description" : requete.body.description
    }
    categorieSchema.updateOne({_id : requete.body.identifiant} , categorieUpdate)
    .exec()
    .then(resultat => {
        if(resultat.modifiedCount < 1){
            throw new Error("Pas de modifications apportées ou la requête de modification a echoué. ")
        }
        requete.session.message = {
            type : "alert-success",
            contenu : "Modification effectuée"
        }
        reponse.redirect("/categories")

    })
    .catch(error => {
        console.log(error)
        requete.session.message = {
            type : "alert-danger",
            contenu : error.message
        }
        reponse.redirect("/categories")

    })
}

exports.modifier_img = (requete, reponse) => {
    let categorie = categorieSchema.findById(requete.body.identifiant)
    .select("img")
    .exec()
    .then(categorie => {
        if(categorie.img !== "default.png"){
            fs.unlink("./public/img/" + categorie.img, error =>{
                console.log(error)
            })
        }
        const categorieUpdate = {}        // Ajouter une image par defaut si une autre n'est pas choisi
        if(typeof requete.file === "undefined"){
            categorieUpdate.img = "default.png"
        }else{
            categorieUpdate.img = requete.file.path.substring(11)
        }
        categorieSchema.updateOne({_id : requete.body.identifiant}, categorieUpdate)
        .exec()
        .then(resultat => {
            if(resultat.modifiedCount < 1){
                throw new Error("Pas de modifications apportées ou la modification a echouée. ")
            }
            requete.session.message = {
                type : "alert-success",
                contenu : "Modification effectuée"
            }
            reponse.redirect("/categories")
            // reponse.redirect("/categories/update/" + requete.body.identifiant)
        })
        .catch(error=>{
            console.log(error)
            requete.session.message = {
                type : "alert-danger",
                contenu : error.message
            }
            reponse.redirect("/categories")
        })
    })
}