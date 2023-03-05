const request = require('supertest');
const app = require('../src/app');
const pastes = require('../src/data/pastes-data');

describe('app', () => {
    describe('path /pastes', () => {
        beforeEach(() => {
            pastes.splice(0, pastes.length);
        });
        describe('GET', () => {
            it('should respond with 200 and all pastes', async () => {
                const expected = [
                    {
                        id: 1,
                        user_id: 1,
                        name: 'Hello',
                        syntax: 'None',
                        expiration: 10,
                        exposure: 'private',
                        text: 'Hello World!',
                    },
                    {
                        id: 2,
                        user_id: 1,
                        name: 'Hello World in Python',
                        syntax: 'Python',
                        expiration: 24,
                        exposure: 'public',
                        text: 'print(Hello World!)',
                    },
                    {
                        id: 3,
                        user_id: 2,
                        name: 'String Reverse in JavaScript',
                        syntax: 'Javascript',
                        expiration: 24,
                        exposure: 'public',
                        text: "const stringReverse = str => str.split('').reverse().join('');",
                    }
                ];
                pastes.push(...expected);
                const response = await request(app).get('/pastes');
                expect(response.status).toBe(200);
                expect(response.body.data).toEqual(pastes);
            });
        });
        describe('POST', () => {
            it('should respond with 201 and the new paste', async () => {
                const newPaste = {
                    name: 'New Paste',
                    syntax: 'javascript',
                    exposure: 'public',
                    expiration: '1 hour',
                    text: 'const x = 1;',
                    user_id: 1,
                };
                const response = await request(app).post('/pastes').send({ data: newPaste });
                expect(response.status).toBe(201);
                expect(response.body.data).toEqual({
                    id: 5,
                    ...newPaste,
                });
            });
            it('should respond with 400 if text is missing', async () => {
                const newPaste = {
                    name: 'New Paste',
                    syntax: 'javascript',
                    exposure: 'public',
                    expiration: '1 hour',
                    user_id: 1,
                };
                const response = await request(app).post('/pastes').send({ data: newPaste });
                expect(response.status).toBe(400);
                expect(response.body.error).toBe('Text is required.');
            });

            it('should respond with 400 if result is empty', async () => {
                const response = await request(app)
                    .post('/pastes')
                    .set('Accept', 'application/json')
                    .send({ data: { result: ""}});

                expect(response.status).toBe(400);
            });

            it('should respond with 400 if result is missing', async () => {
                const response = await request(app)
                    .post('/pastes')
                    .set('Accept', 'application/json')
                    .send({ data: { message: "Missing result" }});

                expect(response.status).toBe(400);
                expect(response.body.error).toBe('Text is required.');
            });

        });
    });

    describe('unknown path', () => {
        it('should respond with 404', async () => {
            const response = await request(app).get('/unknown-path');
            expect(response.status).toBe(404);
            expect(response.body.error).toBe('Not found: /unknown-path');
        });
    });
});