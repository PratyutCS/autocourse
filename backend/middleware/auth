const jwt = require("jsonwebtoken");
const Session = require("../models/session");

const auth = async (req, res, next) => {
  try {
    const token = req.header("x-auth-token");
    if (!token)
      return res.status(401).json({ msg: "No auth token, access denied" });

    const session = await Session.findOne({ session:token });
    if(!session){
      const verified = jwt.verify(token, "passwordKey");
      if (!verified)
        return res
          .status(401)
          .json({ msg: "Token verification failed, authorization denied!!." });
  
      req.user = verified.id;
      req.token = token;
    }
    else{
      return res.status(400).json({ msg: "Token verification failed, authorization denied!lol." });
    }
    next();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = auth;