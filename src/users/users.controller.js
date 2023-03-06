const users = require('../data/users-data');

// validators
function userExists(req, res, next) {
    const { userId } = req.params;
    const foundUser = users.find((user) => user.id === +userId);

    if (foundUser) {
        res.locals.user = foundUser;
        return next();
    } else {
        next({
            status: 404,
            message: `User id not found: ${userId}`,
        });
    }
}

// main users

function list(req, res) {
    res.json({ data: users });
}

function read(req, res) {
    res.json({ data: res.locals.user });
}

module.exports = {
    list,
    read: [
        userExists,
        read,
    ],
    userExists,
};
