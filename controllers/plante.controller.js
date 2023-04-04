const planteSchema = require("../models/plantes.modele")
const categorieSchema = require("../models/categories.modele")
const familleSchema = require("../models/familles.modele")
const fs = require("fs")
const mongoose = require("mongoose")


exports.plantes_affichage = (requete, reponse)=>{
    familleSchema.find()
    .exec()
    .then(familles => {
        console.log(familles)
        categorieSchema.find()
        .exec()
        .then(categories => {
            planteSchema.find()
            .populate("famille")
            .populate("categorie")
            .exec()
            .then(plantes =>{
                reponse.render("plantes/liste.html.twig", {
                    liste : plantes,
                    categories : categories, 
                    familles : familles,
                    message : reponse.locals.message})
                })
            .catch(console.error())
        })
        .catch(console.error() )
    })
    .catch(console.error())
}

exports.plante_ajout = (requete, reponse)=>{
    const plante = new planteSchema({
        _id: new mongoose.Types.ObjectId(),
        nom : requete.body.nom,
        nomLatin : requete.body.nomLatin,
        famille : requete.body.famille,
        description : requete.body.description,
        categorie : requete.body.categorie
    })
    // Ajouter une image par defaut si une autre n'est pas choisi
    if(typeof requete.file === "undefined"){
        plante.img = "default.png"
    }else{
        plante.img = requete.file.path.substring(11)
    }
    plante.save()
    .then(resultat =>{
        reponse.redirect("/plantes")
    })
    .catch(console.error())
}

exports.plante_detail = (requete, reponse)=>{
    planteSchema.findById(requete.params.id)
    .populate("categorie")
    .populate("famille")
    .exec()
    .then(plante =>{
        reponse.render("plantes/plante.html.twig", { 
            plante : plante, 
            isModification : false
        })       
    })
    .catch(console.error())
}

// Modification d'une plante
exports.plante_modification = (requete, reponse)=>{
    familleSchema.find()
    .exec()
    .then(familles => {

        categorieSchema.find()
        .exec()
        .then(categories => {
            planteSchema.findById(requete.params.id)
            .populate("categorie")
            .populate("famille")
            .exec()
            .then(plante =>{
                reponse.render("plantes/plante.html.twig", { 
                    plante : plante, 
                    categories : categories,
                    familles : familles,
                    isModification :true})
            })
            .catch(error => {
                console.log(error)
            })
        })
        .catch(console.error())
    }).catch(console.error())
}

exports.modification_serveur = (requete, reponse) => {
    const planteUpdate = {
        "nom" : requete.body.nom,
        "nomLatin" : requete.body.nomLatin,
        "famille" : requete.body.famille,
        "categorie" : requete.body.categorie,
        "description": requete.body.description
    }
    console.log(planteUpdate)
    planteSchema.updateOne({_id : requete.body.identifiant}, planteUpdate)
    .exec()
    .then(resultat => {
        if(resultat.modifiedCount < 1) {
            throw new Error("Requete de modification échouée")
        }
        requete.session.message = {
            type : 'success',
            contenu : 'Modification effectuée'
        }
        reponse.redirect("/plantes")
    })
    .catch(error => {
        console.log(error)
        requete.session.message = {
            type : 'danger',
            contenu : error.message
        }
        reponse.redirect("/plantes")
    })
}

exports.modification_image = (requete, reponse) => {
    //chercher et selectionner la photo
    let plante = planteSchema.findById(requete.body.identifiant)
    //img comme dans la BD
    .select("img")
    .exec()
    .then(plante=>{
        // supression photo avec fs
        //img comme dans la bd
        if(plante.img !== "default.png"){
            fs.unlink("./public/img/" + plante.img, error =>{
                console.log(error)
            })
        }
        const planteUpdate = {}
        // Ajouter une image par defaut si une autre n'est pas choisi
        if(typeof requete.file === "undefined"){
            planteUpdate.img = "default.png"
        }else{
            planteUpdate.img = requete.file.path.substring(11)
        }
        planteSchema.updateOne({_id : requete.body.identifiant}, planteUpdate)
        .exec()
        .then(resultat => {
            if(resultat.modifiedCount < 1){
                throw new Error("Pas de modifications apportées ou la modification a echouée. ")
            }
            requete.session.message = {
                type : "success",
                contenu : "Modification effectuée"
            }
            reponse.redirect("/plantes")
        })
        .catch(error=>{
            console.log(error)
            requete.session.message = {
                type : "danger",
                contenu : error.message
            }
            reponse.redirect("/plantes")
        })
    })
}

exports.suppression_plante = (requete, reponse) =>{
    // Chercher et selectionner le photo
    let plante = planteSchema.findById(requete.params.id)
    // Img comme dans la BD
    .select("img")
    .exec()
    // Supression photo avec fs
    .then(plante=>{
        //img comme dans la bd
        if(plante.img !== "default.png"){
            // Supprimer l'image selectée du dossier
            fs.unlink("./public/img/"+plante.img, (err) => {
                if (err) {
                    console.log("failed to delete local image:"+err);
                } else {
                    console.log('successfully deleted local image');                                
                }
            });
        }
        planteSchema.deleteOne({_id: requete.params.id})
            .exec()
            .then(resultat=>{
                requete.session.message = {
                    type : "success",
                    contenu : "La plante vient d'être supprimée ."
                }
                reponse.redirect("/plantes")
            })
            .catch(error => {
                console.log(error)
            })
    })
}