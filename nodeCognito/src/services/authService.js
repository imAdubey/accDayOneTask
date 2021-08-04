const AmazonCognitoIdentity = require('amazon-cognito-identity-js');
const AWS = require('aws-sdk');
const axios = require('axios').default;
const { createClientValidate } = require('../validation/joiValidation')

AWS.config.update({
    accessKeyId: "",
    secretAccessKey: "",
    region: ""
})

const poolData = {
    UserPoolId: ""
};

const cognitoIdentityServiceProvider = new AWS.CognitoIdentityServiceProvider();

const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

const createResourceServer = async(body)=>{
    const params = {
        Identifier: body.name,
        Name: body.name,
        UserPoolId: poolData.UserPoolId,
        Scopes: body.scopes
    };
    const result = await cognitoIdentityServiceProvider.createResourceServer(params).promise();
    return result;
}

const fetchResource = async()=>{
    const params = {
        UserPoolId: poolData.UserPoolId,
        MaxResults: 50
    }
    const result = await cognitoIdentityServiceProvider.listResourceServers(params).promise();
    return result;
}
const fetchResourceRes = fetchResource().then((data)=>{
    const scopesArray = [];
    data.ResourceServers.map((i)=>{
        // console.log("resourceServer: ", i);
        let scopeObj = {};
        i.Scopes.map((j)=>{
            scopeObj = `${i.Identifier}/${j.ScopeName}`;
            scopesArray.push(scopeObj);
        });
    });
    console.log("scopesArray: ", scopesArray);
    return scopesArray;
}).catch((err)=>{
    throw err
});

const fetchClients = async()=>{
    const params = {
        UserPoolId: poolData.UserPoolId,
        MaxResults: 50
    }
    const result = await cognitoIdentityServiceProvider.listUserPoolClients(params).promise();
    return result;
}
const fetchClientsRes = fetchClients().then((data)=>{
    const clientNamesArray = []
    data.UserPoolClients.map((i)=>{
        clientNamesArray.push(i.ClientName)
    });
    console.log("clientNamesArray: ", clientNamesArray)
    return clientNamesArray;
}).catch((e)=>{
    throw e;
})

const createClient = async(body)=>{
    const clientNames = await fetchClientsRes
    // console.log("clientNames", clientNames);
    const schema = await createClientValidate(fetchResourceRes);
    const { error } = schema.validate(body);
    if(error){
        // console.log("joiError: ", error);
        throw error.message;
    }
    // console.log("##asvg##", clientNames.includes(body.clientName))
    if(clientNames.includes(body.clientName)){
        const errs = new Error("client name already exists");
        throw errs.message;
    }
    const params = {
        ClientName: body.clientName,
        UserPoolId: poolData.UserPoolId,
        AccessTokenValidity: '1', // 1 day
        AllowedOAuthFlows: ['client_credentials'],
        AllowedOAuthFlowsUserPoolClient: true,
        AllowedOAuthScopes: body.scopes, // ['demo/apiOne', 'demo/apiTwo']
        ExplicitAuthFlows: ['ALLOW_CUSTOM_AUTH', 'ALLOW_USER_SRP_AUTH', 'ALLOW_REFRESH_TOKEN_AUTH'],
        EnableTokenRevocation: true,
        GenerateSecret: true,
        IdTokenValidity: '1', // 1 day
        PreventUserExistenceErrors: 'ENABLED',
        RefreshTokenValidity: '30' // 30 days
    }
    const result = await cognitoIdentityServiceProvider.createUserPoolClient(params).promise();
    return result;
}

const getToken = async()=>{
    const axiosResponse = await axios({
        method: 'POST',
        url: 'https://abd-demo.auth.ap-south-1.amazoncognito.com/oauth2/token?grant_type=client_credentials',
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        auth: {
            username: '3kuja26kim4928m4urbgphgju',
            password: '1e5e2tqorrd78hj7nt2e5cu9m9tjuqinjuip6022t0g9341vts38'
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

module.exports = { createResourceServer, createClient, getToken, register, login }