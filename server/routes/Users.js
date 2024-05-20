const express = require('express');
const router = express.Router();

const bcrypt = require('bcrypt');
const { sign } = require("jsonwebtoken");

const {Users} = require("../models");
const { validateToken } = require('../middleware/AuthMiddleware');


router.post("/", async (req, res) => {
    const { username, password } = req.body;


    bcrypt.hash(password, 10).then((resultedHash) => { // put the user with the hased password in the table
        Users.create({
            username: username,
            password: resultedHash
        });
        res.json("Success");
    });
});

router.post("/login", async (req, res) => {
    const { username, password } = req.body;
    const user = await Users.findOne({where: {username: username}});

    if(!user){
        return res.json({error: "user does not exist"});
    }
    
    bcrypt.compare(password, user.password).then((match) => {
        if(!match) return res.json({error: "wrong username and password combination"});

        //GENERATE ACCESS TOKEN
        const accessToken = sign({username: user.username, id: user.id}, "secretPrivateKey");

        return res.json({token: accessToken, username: user.username, id: user.id});
        //return res.json("You logged in succesfully");
    });

});

router.put("/changePassword", validateToken, async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const username = req.user.username; //got also using the validate token
    const user = await Users.findOne({
        where: {username: username}
    });

    bcrypt.compare(oldPassword, user.password).then((match) => {
        if(!match) return res.json({error: "wrong old password"});

        bcrypt.hash(newPassword, 10).then((resultedHash) => { // put the user with the hased password in the table
            Users.update({
                password: resultedHash
            },
            {
                where: {username: username}
            });
            res.json("Success");
        }); 
        //return res.json("You logged in succesfully");
    });
});


router.get("/auth", validateToken, (req, res) => { //for preventing writing in console fake token
    res.json(req.user);
});






// PROFILE ROUTES
router.get("/basicInfo/:id", async (req, res) => {
    const id = req.params.id;
    const basicInfo = await Users.findByPk(id, {
        attributes: {exclude: ['password']}
    });

    res.json(basicInfo);
});


module.exports = router;