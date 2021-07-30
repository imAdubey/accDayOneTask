const { getToken, register, login } = require('../services/authService');


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

module.exports = { token, registerUser, loginUser }