var express = require('express');
var router = express.Router();

const { resourceServer, getClientCredentials, token, registerUser, loginUser } = require('../controllers/authService');
const { validation } = require('../middleware/authService');

/* GET home page. */
router.get('/', validation, (req, res)=>{
  res.status(200).send({
    message: "success",
    data: "yess validation passed!"
  });
});
router.post('/createResourceServer', resourceServer);
router.post('/getClientCredentials', getClientCredentials);
router.get('/getToken', token);
router.post('/register', registerUser);
router.post('/login', loginUser);

module.exports = router;
