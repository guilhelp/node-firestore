const express = require("express")
const app = express()
const handlebars = require("express-handlebars").engine
const bodyParser = require("body-parser")
const { initializeApp, applicationDefault, cert } = require('firebase-admin/app')
const { getFirestore, Timestamp, FieldValue, Filter } = require('firebase-admin/firestore')

const serviceAccount = require('./node-firestore-fd02c-firebase-adminsdk-dtytb-8e53c2a19e.json')

initializeApp({
  credential: cert(serviceAccount)
})

const db = getFirestore()

app.engine("handlebars", handlebars({defaultLayout: "main"}))
app.set("view engine", "handlebars")

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

app.get("/", function(req, res){
    res.render("primeira_pagina")
})

app.get("/consulta", async function(req, res) {
    const agendamentosRef = db.collection('agendamentos');
    const snapshot = await agendamentosRef.get();
    const agendamentos = [];

    snapshot.forEach(doc => {
        agendamentos.push({ id: doc.id, ...doc.data() });
    });

    console.log(agendamentos)
    res.render("consultar", { agendamentos: agendamentos });
});


app.get("/editar/:id", async function(req, res){
    const id = req.params.id;

    const agendamentosRef = db.collection('agendamentos').doc(id);
    const doc = await agendamentosRef.get();

    console.log(doc.data())
   
    res.render("editar", { agendamento: doc.data(), id: id});
    
})

app.get("/excluir/:id", async function(req, res){
    const id = req.params.id;

    const agendamentosRef = db.collection('agendamentos').doc(id);
    await agendamentosRef.delete();
   
    res.redirect("/consulta");
})

app.post("/cadastrar", function(req, res){
    var result = db.collection('agendamentos').add({
        nome: req.body.nome,
        telefone: req.body.telefone,
        origem: req.body.origem,
        data_contato: req.body.data_contato,
        observacao: req.body.observacao
    }).then(function(){
        console.log('Added document');
        res.redirect('/consulta')
    })
})

app.post("/atualizar", async function(req, res){
    const id = req.body.id;
    console.log("atualizar" + id)
    await db.collection('agendamentos').doc(id).update({
        nome: req.body.nome,
        telefone: req.body.telefone,
        origem: req.body.origem,
        data_contato: req.body.data_contato,
        observacao: req.body.observacao
    }).then(function(){
        console.log('Updated document');
        res.redirect('/consulta')
    })
})

app.listen(8081, function(){
    console.log("Servidor ativo!")
})