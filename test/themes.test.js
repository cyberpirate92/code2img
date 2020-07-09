const { themes } = require('../themes');

let chai = require('chai');
let chaiHttp = require('chai-http');
let expect = chai.expect;
chai.use(chaiHttp);

describe('/api/themes', () => {
    it('it should return list of themes', (done) => {
        chai.request('http://localhost:3000')
        .get('/api/themes')
        .end((err, res) => {
            expect(err).to.be.null;
            expect(res).to.have.status(200);
            expect(res).to.have.header('content-type', 'application/json; charset=utf-8');
            expect(res.body).to.haveOwnProperty('themes');
            expect(res.body.themes).to.have.all.members(themes);
            done();
        });
    });
});