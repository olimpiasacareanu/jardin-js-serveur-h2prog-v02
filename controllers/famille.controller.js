const familleSchema = require("../models/familles.modele")
const planteSchema = require("../models/plantes.modele")
const fs = require("fs")
const { request } = require("http")
const mongoose = require("mongoose") // module pour Mongodb - CRUD


exports.afficher_familles = (requete, reponse) => {
    familleSchema.find()
    .exec()
    .then(familles => {
        reponse.render("familles/liste.html.twig", {liste : familles})
    })
    .catch(console.error())
}

exports.afficher_famille = (requete, reponse) =>{
    familleSchema.findById(requete.params.id)
    .populate("plantes")
    .exec()
    .then(famille => {
        reponse.render("familles/famille.html.twig", {famille : famille, isModification : false})
    })
    .catch(console.error())
}

exports.ajout_famille = (requete, reponse) => {
    const famille = {
        _id : new mongoose.Types.ObjectId(), 
        nom : requete.body.nom,
        nomLatin : requete.body.nomLatin,
        description : requete.body.description,
    }
     // Ajouter une image par defaut si une autre n'est pas choisi
    if(typeof requete.file == "undefined"){
        famille.img = "default.png"
    }else{
        famille.img = requete.file.path.substring(11)
    }
    familleSchema.create(famille)
    .then(resultat => {
        reponse.redirect("/familles")
    })
    .catch(console.error())
}

exports.supprimer_famille = (requete, reponse) => {
    familleSchema.find()
    .where('nom').equals("anonyme")
    .exec()
    .then(famille => {
        planteSchema.updateMany({"famille" : requete.params.id}, {"$set" : {"famille" : famille[0]._id}}, {"multi" : true})
        .exec()
        .then(
            familleSchema.deleteOne({_id : requete.params.id})
            .where('nom').ne("anonyme")
            .exec()
            .then(resultat=> {
                if(resultat.deletedCount <1){
                    throw new Error("La famille n'a pas été supprimée ! ")
                }
                requete.session.message = {
                    type : "alert-success",
                    contenu : "La famille vient d'être supprimée ."
                }
                reponse.redirect("/familles")
            })
            .catch(error=>{
                console.log(error)
                requete.session.message = {
                    type : "alert-danger",
                    contenu : error.message
                }
                reponse.redirect("/familles")
            })
        )
        .catch(error=>{
            console.log(error)
        });
    })
}

exports.modifier_famille = (requete, reponse) => {
    familleSchema.findById(requete.params.id)
    .exec()
    .then(famille=>{
        reponse.render("familles/famille.html.twig", {famille : famille, isModification : true} )
    })
}

exports.modifier_serveur = (requete, reponse) => {
    const familleUpdate = {
        nom : requete.body.nom,
        nomLatin : requete.body.nomLatin,
        description : requete.body.description
    }

    familleSchema.updateOne({_id : requete.body.identifiant}, familleUpdate)
    .exec()
    .then(resultat => {
        if(resultat.modifiedCount < 1){
            throw new Error("La modification n'a pas été réalisée .")
        }
        requete.session.message = {
            type : "alert-success",
            contenu : "La famille de plante vient d'être modifiée. "
        }
        reponse.redirect("/familles")

    })
    .catch(error=>{
        requete.session.message = {
            type : "alert-success",
            contenu : "La modification de la famille a echoué. "
        }
        reponse.redirect("/familles")
    })
}

exports.modifier_image = (requete, reponse) => {
    familleSchema.findById(requete.body.identifiant)
    .select("img")
    .exec()
    .then(famille => {
        if(famille.img !== "default.png"){
            fs.unlink("./public/img/" + famille.img, error =>{
                console.log(error)
            })
        }
        const familleUpdate = {}        // Ajouter une image par defaut si une autre n'est pas choisi
        if(typeof requete.file === "undefined"){
            familleUpdate.img = "default.png"
        }else{
            familleUpdate.img = requete.file.path.substring(11)
        }
        familleSchema.updateOne({_id : requete.body.identifiant}, familleUpdate)
        .exec()
        .then(resultat => {
            if(resultat.modifiedCount < 1){
                throw new Error("Pas de modifications apportées ou la modification a echouée. ")
            }
            requete.session.message = {
                type : "alert-success",
                contenu : "Modification effectuée"
            }
            reponse.redirect("/familles/update/" + requete.body.identifiant)
        })
        .catch(error=>{
            console.log(error)
            requete.session.message = {
                type : "alert-danger",
                contenu : error.message
            }
            reponse.redirect("/familles/update/" + requete.body.identifiant)
        })
    })
    .catch(console.error())
}