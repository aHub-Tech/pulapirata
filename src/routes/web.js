const express = require('express')
const router = express.Router()

const path = require('path')

router.get('/', (req, res) => {
    res.sendFile(path.resolve('./public/index.html'));
});
router.get('/login', (req, res) => {
    res.sendFile(path.resolve('./public/app/views/login.html'));
});
router.get('/register', (req, res) => {
    res.sendFile(path.resolve('./public/app/views/register.html'));
});
router.get('/lobby', (req, res) => {
    res.sendFile(path.resolve('./public/app/views/lobby.html'));
});

module.exports = router