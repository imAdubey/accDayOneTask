const AmazonCognitoIdentity = require('amazon-cognito-identity-js');
const AWS = require('aws-sdk');
const axios = require('axios').default;

AWS.config.update({
    accessKeyId: "AKIAZ5LZUVQYKWUI6D7T",
    secretAccessKey: "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",
    region: "ap-south-1"
})

const poolData = {
    UserPoolId: "ap-south-1_QQCBURYJb",
    ClientId: "11g98l4i1dlkfp2qadhf569q00"
};

const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

const getToken = async()=>{
    const axiosResponse = await axios({
        method: 'POST',
        url: 'https://abd-test.auth.ap-south-1.amazoncognito.com/oauth2/token?grant_type=client_credentials',
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        auth: {
            username: '1qi4qgbho97ebffm2ck18duen8',
            password: '1h1o87ng2q802pro3evrd3a0fmgaus9qd1knf7h7td01km43rri6'
        }
    });
    return axiosResponse;
}

const register = (body)=>{
    const name = body.name;
    const email = body.email;
    const password = body.password;
    const serReqId = body.serviceRequestId;
    const chanId = body.channelId;
    const attributeList = [];
    
    attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({ Name: "email", Value: email }));
    attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({ Name: "custom:serviceRequestId", Value: serReqId }));
    attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({ Name: "custom:channelId", Value: chanId }));

    return new Promise((resolve, reject)=>{
        userPool.signUp(name, password, attributeList, null, (err, result)=>{
            if(err){
                reject(err);
            }else{
                event = {
                    request: {
                        "userAttributes": {
                            "email": email
                        },
                        "validationData": {
                            "Name": "email",
                            "Value": email
                        }
                    },
                    response: {
                        autoVerifyEmail: true
                    }
                }
                const confirmParams = {
                    UserPoolId: poolData.UserPoolId, /* required */
                    Username: name /* required */
                };
                const cognitoIdentityServiceProvider = new AWS.CognitoIdentityServiceProvider();
                cognitoIdentityServiceProvider.adminConfirmSignUp(confirmParams, (errs, data)=>{
                    if(errs){
                        reject(errs);
                    }else{
                        console.log("data: ", data);
                        resolve(result);
                    }
                });
            }
        });
    });
}

const login = (body)=>{
    const userName = body.name;
    const password = body.password;
    const authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails({
        Username: userName,
        Password: password
    });
    const userData = {
        Username: userName,
        Pool: userPool
    }
    const cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
    return new Promise((resolve, reject)=>{
        cognitoUser.authenticateUser(authenticationDetails, {
            onSuccess:  (result)=>{
                console.log("idToken: ", result.getIdToken().getJwtToken());
                const accesstoken = result.getAccessToken().getJwtToken();
                resolve(accesstoken);
            },
            onFailure: ((err)=>{
                reject(err);
            })
        });
    });
 };

module.exports = { getToken, register, login }