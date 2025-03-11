const jwt = require("jsonwebtoken");

const validateToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    
    if (!authHeader) {
        
        
      return res.status(401).json({ message: "Access Denied" });
    }
    const token = authHeader.split(" ")[1];
    
    if (!token) {
        console.log('validate Token Invalid');
        
      return res.status(401).json({ message: "Access Denied" });
    }
    const decryptObj = jwt.verify(token, process.env.TOKEN_SECRET);
    req.user = decryptObj;
    req.token = token;
    next();
  } catch (error) {
    console.error("Token validation error:", error.message);
    res.status(400).json({ message: "Invalid Token", error:error });
  }
};

module.exports = validateToken;