// grab the token that is sent through the forntend and validate using jwt function isValid,
//if isValid do the actual request, if if not return some error json
const {verify} = require("jsonwebtoken");


//function to run before a request
const validateToken = (req, res, next) => {
    const accessToken = req.header("accessToken"); //grab token from frontend and pass to backend through headers

    if(!accessToken) return res.json({error: "No user currently logged in!!1"});

    try{
        const validToken = verify(accessToken, "secretPrivateKey");
        //const username = validToken.username;
        req.user = validToken;

        if(validToken) {
            return next(); //continue with the request
        }
    } catch(error){
        return res.json({error: error});
    }
}

module.exports = { validateToken };