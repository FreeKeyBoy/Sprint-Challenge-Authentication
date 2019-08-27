const jwt = require('jsonwebtoken');
const jwtKey = require('../_secrets/keys').jwtKey;

module.exports = {
    authenticate,
};

// implementation details
function authenticate(req, res, next) {
    const token = req.get('Authorization');

    if (token) {
        jwt.verify(token, jwtKey, (err, decoded) => {
            if (err){
                return res.status(401).json(err);
            }else{
                req.decoded = decoded;
                next();
            }
        });
    }else{
        return res.status(401).json({
            error: 'No token provided.'
        });
    }
}