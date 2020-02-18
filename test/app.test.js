const { expect } = require('chai');
const supertest = require('supertest');

const app = require('../app');

describe('GET /', () => {

  it('should return a message from GET /', () => {
    return(
      supertest(app)
        .get('/')
        .expect(
          200, 
          'App is running successfully'
        )
    );
  });

});

describe('GET /apps', () => {

  it('should return 20 results with no params passed', () => {
    return(
      supertest(app)
        .get('/apps')
        .then(res => {

          expect(res.body)
            .to.be.an('array');

          expect(res.body)
            .to.have.length(20);
        })

    );
  });

  it('should only return valid genres even when multiple are present', () => {
    const query = {
      genre: 'Casual'
    }
    return(
      supertest(app)
        .get('/apps')
        .query(query)
        .then(res => {
          res.body.map((i) => {
            const genresArr = i.Genres.split(';');
            expect(genresArr)
              .to.include(query.genre);
          });
        })
    );
  });

  it('should only return apps that contain a substring', () => {
    const query = {
      search: 'rob'
    };
    return(
      supertest(app)
        .get('/apps')
        .query(query)
        .then(res => {
          res.body.map((i) => {
            const containSubstr = i.App.toLowerCase().includes(query.search);
            expect(containSubstr)
              .to.eql(true);
          });
        })
    );
  });

  it('should accept all query params at the same time', () => {
    const query = {
      search: 'a',
      sort: 'App',
      genre: 'Action'
    };
    return(
      supertest(app)
        .get('/apps')
        .query(query)
        .then(res => {

          expect(res.body)
            .to.be.an('array');
        })
    );
  });

  it('should accurately sort from highest to lowest rating', () => {
    const query = {
      sort: 'Rating'
    };
    return(
      supertest(app)
        .get('/apps')
        .query(query)
        .then(res => {
          let ceil = res.body[0].Rating;
          res.body.map((i) => {
            expect(ceil)
              .to.be.at.least(i.Rating);
            ceil = i.Rating;
          });
        })
    );
  });

});