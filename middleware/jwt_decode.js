const { sendResponse } = require('../utils/responseHandler'); 
const jwt = require('jsonwebtoken');
module.exports = function (req, res, next) {
  const token = req.header('Authorization')?.replace('Bearer ', '');
    try {
        
        if (!token) {
            return sendResponse(res, 401, "No token, authorization denied");
        }   
       
        let privateKey = process.env.privateKey;
        const decoded = jwt.verify(token, privateKey);
        req.user = decoded;   
        next(); 

    } catch (error) {
        console.error(error);
        return sendResponse(res, 401, "No token, authorization denied");
    }
};