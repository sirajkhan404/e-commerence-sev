const jwt = require("jsonwebtoken");

const { JWT_SECRET } = process.env;


const verifyToken = (req, res, next) => {
    try {

        const token = req.headers["authorization"].split(" ")[1];

        if (!token) return res.status(401).json({ message: "Unauthorized", isError: true });

        jwt.verify(token, JWT_SECRET, (err, result) => {

            if (err) return res.status(401).json({ message: "Unauthorized", isError: true });

            req.uid = result.uid;
            req.role = result.role;

            next();
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Internal server error", isError: true });

    }
}

module.exports = { verifyToken };