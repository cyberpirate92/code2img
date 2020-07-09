const { languages } = require('../languages');
let chai = require('chai');
let chaiHttp = require('chai-http');
let expect = chai.expect;
chai.use(chaiHttp);

describe('/api/languages', () => {
    it('it should return list of languages', (done) => {
        chai.request('http://localhost:3000')
        .get('/api/languages')
        .end((err, res) => {
            expect(err).to.be.null;
            expect(res).to.have.status(200);
            expect(res).to.have.header('content-type', 'application/json; charset=utf-8');
            expect(res.body).to.haveOwnProperty('languages');
            expect(res.body.languages).to.have.all.members(languages);
            done();
        });
    });
});