var express = require('express');
var router = express.Router();

const { token, registerUser, loginUser } = require('../controllers/authService');
const { validation } = require('../middleware/authService');

/* GET home page. */
router.get('/', validation, (req, res)=>{
  res.status(200).send({
    message: "success",
    data: "yess validation passed!"
  });
});
router.get('/getToken', token);
router.post('/register', registerUser);
router.post('/login', loginUser);

module.exports = router;
