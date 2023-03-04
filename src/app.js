const express = require('express');
const app = express();
const pastes = require('./data/pastes-data');

// TODO: Follow instructions in the checkpoint to implement ths API.

app.use(express.json());

// /paste routes
app.get('/pastes/:pasteId', (request, response, next) => {
    const { pasteId } = request.params;
    const foundPaste = pastes.find((paste) => paste.id === +pasteId);

    if (foundPaste) {
        response.json({ data: foundPaste });
    } else {
        next(`Paste id not found: ${pasteId}`);
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
       const error = new Error('A "text" property is required.');
        error.status = 400;
        next(error);
    }
});

// Not found handler
app.use((request, response, next) => {
    next(`Not found: ${request.originalUrl}`);
});

// Error handler
app.use((error, request, response, next) => {
  const { status = 500, message = 'Something went wrong!' } = error;
  console.error(message);
    response.status(status).json({ error: message });
    
});

module.exports = app;
