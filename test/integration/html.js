const aden = require('../../lib/aden');
const path = require('path');
const request = require('supertest');
const expect = require('expect');

describe('HTML', () => {
  she('has a root route with index.html entry point', (done) => {
    aden().init(path.resolve(__dirname, '../tmpdata/html'))
      .then((an) => an.run('dev'))
      .then((an) => {
        request(an.app)
          .get('/')
          .expect(200, () => {
            an.shutdown(done);
          });
      });
  });

  she('delivers index.html at root path', (done) => {
    aden().init(path.resolve(__dirname, '../tmpdata/html'))
      .then((an) => an.run('dev'))
      .then((an) => {
        request(an.app)
          .get('/')
          .end((err, res) => {
            if (err) done(err);
            expect(res.text).toMatch(/^<!DOCTYPE html>/);
            an.shutdown(done);
          });
      });
  });

  she('delivers index.html at sub path', (done) => {
    aden().init(path.resolve(__dirname, '../tmpdata/html'))
      .then((an) => an.run('dev'))
      .then((an) => {
        request(an.app)
          .get('/sub')
          .end((err, res) => {
            if (err) done(err);
            expect(res.text).toMatch(/^<!DOCTYPE html>/);
            an.shutdown(done);
          });
      });
  });
});