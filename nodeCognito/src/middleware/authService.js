// const AmazonCognitoIdentity = require('amazon-cognito-identity-js');
// const fetch = require('node-fetch');
const jwkToPem = require('jwk-to-pem');
const jwt = require('jsonwebtoken');
const request = require('request');

const poolData = {
    UserPoolId: "",
};
const poolRegion = "";

// const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

const validation = (req, res, next)=>{
    const token = req.headers.authorization.split(" ")[1];

    const decodedJwt = jwt.decode(token, {complete: true});
    if(!decodedJwt){
        console.log("Not a valid JWT token");
        res.status(401);
        return res.send("Invalid token");
    }
    console.log("decodedJwt: ", decodedJwt.payload.scope);
    // if(decodedJwt.payload.client_id != poolData.ClientId){
    //     console.log("Not a valid clientID in JWT token");
    //     res.status(401);
    //     return res.send("Invalid token");
    // }
    const decodedKid = decodedJwt.header.kid;
    request({
        url: `https://cognito-idp.${poolRegion}.amazonaws.com/${poolData.UserPoolId}/.well-known/jwks.json`,
        json: true
    }, (errs, resp, bodie)=>{
        if(!errs && resp.statusCode == 200){
            let pems = {};
            const keys = bodie.keys;
            let alg = '';
            // console.log("keys: ", keys);
            for(let i = 0; i < keys.length; i++){
                alg = keys[i].alg;
                const keyId = keys[i].kid;
                const modulus = keys[i].n;
                const exponent = keys[i].e;
                const keyType = keys[i].kty;
                const jwk = { kty: keyType, n: modulus, e: exponent};
                const pem = jwkToPem(jwk);
                // console.log("pem-1: ", pem);
                pems[keyId] = pem;
            }
            // console.log("pems: ", pems);

            const pem = pems[decodedKid];
            // console.log("pem-2: ", pem);
            if(!pem){
                console.log('Invalid token-1');
                res.status(401);
                return res.send("Invalid token");              
            }
            jwt.verify(token, pem, {algorithms: [alg]}, (err, payload)=>{
                if(err){
                    console.log("Invalid Token-2");
                    res.status(401);
                    return res.send("Invalid tokern");
                }else{
                    console.log("Valid Token.");
                    return next();
                }
            });
        }else{
            console.log("Error! Unable to download JWKs");
            res.status(500);
            return res.send("Error! Unable to download JWKs");
        }
    });
}


const verifyToken = (req, res, next)=>{
    request({
        url: `https://dev-6bq-wpb9.us.auth0.com/.well-known/jwks.json`,
        json: true
    }, (errs, resp, bodie)=>{
        if(!errs && resp.statusCode == 200){
            const keys = bodie.keys;
            console.log("keys: ", keys);
            next();
        }
    });
}

module.exports = { validation }