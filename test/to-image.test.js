let chai = require('chai');
let chaiHttp = require('chai-http');
let expect = chai.expect;
chai.use(chaiHttp);

const payload = `let x = 5;
let y = 10;
console.log(add(x, y));

function add(a, b) {
    return a+b;
}`;

describe('/api/to-image', () => {
    describe('With all params', () => {
        
        const queryParams = new URLSearchParams();
        queryParams.set('language', 'javascript');
        queryParams.set('theme', 'atom-dark');

        it('it should return image', (done) => {
            chai.request('http://localhost:3000')
            .post(`/api/to-image?${queryParams.toString()}`)
            .type('text')
            .send(payload)
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res).to.have.status(200);
                expect(res).to.have.header('content-type', 'image/png');
                done();
            });
        });
    });

    describe('Without code snippet', () => {

        const queryParams = new URLSearchParams();
        queryParams.set('language', 'javascript');
        queryParams.set('theme', 'atom-dark');
        
        it('it should return status 400, json response', (done) => {
            chai.request('http://localhost:3000')
            .post(`/api/to-image?${queryParams.toString()}`)
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res).to.have.status(400);
                expect(res).to.have.header('content-type', 'application/json; charset=utf-8');
                done();
            });
        });
    });

    describe('Without theme parameter', () => {

        const queryParams = new URLSearchParams();
        queryParams.set('language', 'javascript');

        it('it should return status 400, json response', (done) => {
            chai.request('http://localhost:3000')
            .post(`/api/to-image?${queryParams.toString()}`)
            .type('text')
            .send(payload)
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res).to.have.status(400);
                expect(res).to.have.header('content-type', 'application/json; charset=utf-8');
                done();
            });
        });
    });

    describe('Without language parameter', () => {

        const queryParams = new URLSearchParams();
        queryParams.set('theme', 'atom-dark');

        it('it should return status 400, json response', (done) => {
            chai.request('http://localhost:3000')
            .post(`/api/to-image?${queryParams.toString()}`)
            .type('text')
            .send(payload)
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res).to.have.status(400);
                expect(res).to.have.header('content-type', 'application/json; charset=utf-8');
                done();
            });
        });
    });

    describe('With invalid theme value', () => {

        const queryParams = new URLSearchParams();
        queryParams.set('language', 'javascript');
        queryParams.set('theme', 'xyzahbkjdbc');

        it('it should return status 400, json response', (done) => {
            chai.request('http://localhost:3000')
            .post(`/api/to-image?${queryParams.toString()}`)
            .type('text')
            .send(payload)
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res).to.have.status(400);
                expect(res).to.have.header('content-type', 'application/json; charset=utf-8');
                done();
            });
        });
    });

    describe('With invalid language value', () => {

        const queryParams = new URLSearchParams();
        queryParams.set('language', 'djkjsjds');
        queryParams.set('theme', 'atom-dark');

        it('it should return status 400, json response', (done) => {
            chai.request('http://localhost:3000')
            .post(`/api/to-image?${queryParams.toString()}`)
            .type('text')
            .send(payload)
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res).to.have.status(400);
                expect(res).to.have.header('content-type', 'application/json; charset=utf-8');
                done();
            });
        });
    });
});