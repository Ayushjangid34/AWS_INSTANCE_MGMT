const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const sshController = require('../controllers/sshController');
const expressWs = require('express-ws'); 
expressWs(router); 

router.get('/dashboard', userController.getDashboard);
router.get('/getInstDetails', userController.fetchUserInstancesDetails);
router.get('/createinstance', userController.getInstanceCreationForm);
router.post('/launchinstance', userController.launchInstance);
router.get('/terminal/:id', userController.getTerminal);
router.post('/action', userController.handleActions);


// WS endpoint that proxies SSH to the client
router.ws('/sshinstance/:instanceId', sshController.handleConnection);


module.exports = router;