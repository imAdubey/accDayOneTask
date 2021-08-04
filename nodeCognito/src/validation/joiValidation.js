const Joi = require('joi');
// const { fetchResourceRes } = require('../services/authService')

const createClientValidate = async(fetchResourceRes)=>{
    const scopes = await fetchResourceRes;
    // console.log("scopes: ", scopes);
    const createClientSchema = Joi.object({
        clientName: Joi.string().min(2).max(50).required(),
        scopes: Joi.array().items(Joi.string().valid(...scopes).required()).required()
    }).required();
    return createClientSchema;
}

module.exports = { createClientValidate }
