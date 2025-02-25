const express = require('express');
const app = express();
const pastesRouter = require('./pastes/pastes.router');
const userRouter = require('./users/users.router');

app.use(express.json());

// /paste routes
app.use('/pastes', pastesRouter);

// /users routes
app.use('/users', userRouter)

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
