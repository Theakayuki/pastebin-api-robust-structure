const pastes = require('../data/pastes-data');

let lastPasteId = pastes.reduce((maxId, paste) => Math.max(maxId, paste.id), 0);

// validation for pastes

function bodyDataHas(propertyName) {
    return function (req, res, next) {
        const { data = {} } = req.body;
        if (data[propertyName]) {
            return next();
        }
        next({ status: 400, message: `A '${propertyName}' property is required` });
    };
}

function exposurePropertyIsValid(req, res, next) {
    const { data: { exposure } = {} } = req.body;
    const validExposure = ['private', 'public'];
    if (validExposure.includes(exposure)) {
        return next();
    }
    next({
        status: 400,
        message: `Value of the 'exposure' property must be one of ${validExposure}. Received: ${exposure}`,
    });
}

function syntaxPropertyIsValid(req, res, next) {
    const { data: { syntax } = {} } = req.body;
    const validSyntax = ['none', 'javascript', 'python', 'ruby', 'perl', 'c', 'scheme'];
    if (validSyntax.includes(syntax.toLowerCase())) {
        return next();
    }
    next({
        status: 400,
        message: `Value of the 'syntax' property must be one of ${validSyntax}. Received: ${syntax}`,
    });
}

function expirationIsValidNumber(req, res, next) {
    const { data: { expiration } = {} } = req.body;
    if (expiration <= 0 || !Number.isInteger(expiration)) {
        return next({
            status: 400,
            message: `Expiration requires a valid number`,
        });
    }
    next();
}

function pasteExists(req, res, next) {
    const { pasteId } = req.params;
    const foundPaste = pastes.find((paste) => paste.id === Number(pasteId));
    if (foundPaste) {
        res.locals.paste = foundPaste;
        return next();
    }
    next({
        status: 404,
        message: `Paste id not found: ${pasteId}`,
    });
}

// Main paste Handlers

function list(req, res) {
    const { userId } = req.params;
    res.json({ data: pastes.filter(userId ? (paste) => paste.user_id == userId : () => true) });
}

function read(req, res) {
    const foundPaste = res.locals.paste;
    res.json({ data: foundPaste });
}

function create(req, res, next) {
    const { data: { name, syntax, exposure, expiration, text, user_id } = {} } = req.body;
    const newPaste = {
        id: ++lastPasteId,
        name,
        syntax,
        exposure,
        expiration,
        text,
        user_id,
    };

    pastes.push(newPaste);
    res.status(201).json({ data: newPaste });
}

function update(req, res) {
    const foundPaste = res.locals.paste;
    const { data: { name, syntax, expiration, exposure, text } = {} } = req.body;

    // Update the paste
    foundPaste.name = name;
    foundPaste.syntax = syntax;
    foundPaste.expiration = expiration;
    foundPaste.exposure = exposure;
    foundPaste.text = text;

    res.json({ data: foundPaste });
}

function destroy(req, res) {
    const { pasteId } = req.params;
    const index = pastes.findIndex((paste) => paste.id === +pasteId);

    const deletedPastes = pastes.splice(index, 1);
    res.sendStatus(204);
}

module.exports = {
    list,
    create: [
        bodyDataHas('name'),
        bodyDataHas('syntax'),
        bodyDataHas('exposure'),
        bodyDataHas('expiration'),
        bodyDataHas('text'),
        bodyDataHas('user_id'),
        exposurePropertyIsValid,
        syntaxPropertyIsValid,
        expirationIsValidNumber,
        create,
    ],
    read: [pasteExists, read],
    update: [
        pasteExists,
        bodyDataHas('name'),
        bodyDataHas('syntax'),
        bodyDataHas('exposure'),
        bodyDataHas('expiration'),
        bodyDataHas('text'),
        exposurePropertyIsValid,
        syntaxPropertyIsValid,
        expirationIsValidNumber,
        update,
    ],
    delete: [pasteExists, destroy],
};
