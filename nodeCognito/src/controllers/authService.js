const { createResourceServer, createClient, getToken, register, login } = require('../services/authService');

const resourceServer = (req, res)=>{
    createResourceServer(req.body).then((data)=>{
        res.status(200).send({
            message: "success",
            data: data
        });
    }).catch((err)=>{
        res.status(400).send({
            message: "error",
            data: err
        });
    });
}

const getClientCredentials = (req, res)=>{
    createClient(req.body).then((data)=>{
        res.status(200).send({
            message: "success",
            data: data
        });
    }).catch((err)=>{
        res.status(400).send({
            message: "error",
            data: err
        });
    });
}

const token = (req, res)=>{
    getToken().then((data)=>{
        res.status(data.status).send({
            message: "success",
            data: data.data
        });
    }).catch((e)=>{
        res.status(400).send({
            message: "error",
            data: e
        });
    });
}

const registerUser = (req, res)=>{
    register(req.body).then((data)=>{
        res.status(200).send({
            message: "success",
            data: data.user
        });
    }).catch((e)=>{
        res.status(400).send({
            message: "error",
            data: e
        });
    })
}

const loginUser = (req, res)=>{
    login(req.body).then((data)=>{
        res.status(200).send({
            message: "success",
            data: data
        });
    }).catch((e)=>{
        res.status(400).send({
            message: "error",
            data: e
        });
    })
}

module.exports = { resourceServer, getClientCredentials, token, registerUser, loginUser }