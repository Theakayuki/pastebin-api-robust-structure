const express = require('express');
const app = express();
const pastes = require('./data/pastes-data');

app.use(express.json());

// /paste routes
app.get('/pastes/:pasteId', (request, response, next) => {
    const { pasteId } = request.params;
    const foundPaste = pastes.find((paste) => paste.id === +pasteId);

    if (foundPaste) {
        response.json({ data: foundPaste });
    } else {
        next({status: 404, message:`Paste id not found: ${pasteId}`});
    }
});

app.get('/pastes', (request, response, next) => {
    response.json({ data: pastes });
});

let lastPasteId = pastes.reduce((maxId, paste) => Math.max(maxId, paste.id), 0);
app.post('/pastes', (req, res, next) => {
    const { data: { name, syntax, exposure, expiration, text, user_id } = {} } = req.body;
    if (text) {
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
    } else {
        next({status: 400, message:'Text is required.'});
    }
});

// Not found handler
app.use((request, response, next) => {
    next({status: 404, message:`Not found: ${request.originalUrl}`});
});

// Error handler
app.use((error, request, response, next) => {
    console.error(error);
    const { status = 500, message = 'Something went wrong!' } = error;
    response.status(status).send({ error: message });
});

module.exports = app;
