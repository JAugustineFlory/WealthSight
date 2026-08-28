
//middleware gets 'next' in addition to 'req' and 'res'
function checkAuth(req, res, next) {
    const userId = req.cookies.userId;

    if(!userId) {
        return res.status(401).json({ message: 'Not authenticated'});
    }
    //if cookie is present, attach it to the request object as 'req.userId'
    req.userId = userId;
    next();
}

module.exports = checkAuth;