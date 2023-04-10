const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

const isValueInObject = (obj, value) => {
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const valueFromKey = obj[key]._id;
      if (valueFromKey === value) {return true}
    }
  }
  return false
}

suite('Functional Tests', function() {
  /* test('#1 Create an issue with every field: POST request to /api/issues/{project}', (done) => {
    chai
      .request(server)
      .post(`/api/issues/apitest?_id=test1&issue_title=Dertest&issue_text=Wirhabenvielvor.&created_by=chaiTest#1&assigned_to=FreeCodeCamp&status_text=test#1`)
      .end((err, res) => {
        assert.equal(res.status, 201);
        //assert.equal(res.body.acknowledged, true); // Funktion, die die Daten verarbeitet und zurückgibt
        chai.request(server).delete('/api/issues/test?_id=test1').end()
        done()
      })
  })

  test('#2 Create an issue with only required fields: POST request to /api/issues/{project}', (done) => {
    chai
      .request(server)
      .post(`/api/issues/apitest?_id=test2&issue_title=Dertest&issue_text=Wirhabenvielvor.&created_by=chaiTest`)
      .end((err, res) => {
        assert.equal(res.status, 201);
        chai.request(server).delete('/api/issues/test?_id=test2').end()
        done()
      })
  })

  test('#3 Create an issue with only required fields: POST request to /api/issues/{project}', (done) => {
    chai
      .request(server)
      .post(`/api/issues/apitest3?_id=test3&issue_title=Dertest&issue_text=Wirhabenvielvor.`)
      .end((err, res) => {
        assert.equal(res.status, 400);
        done()
      })
  }) */

  /* test('#10 View issues on a project: GET request to /api/issues/{project}', (done) => {
    Promise.all([
      chai.request(server).post(`/api/issues/apitest?_id=test10&issue_title=Dertest&issue_text=Wirhabenvielvor.&created_by=chaiTest`),
      chai.request(server).post(`/api/issues/apitest?_id=test11&issue_title=Dertest&issue_text=Wirhabenvielvor.&created_by=chaiTest`),
      chai.request(server).post(`/api/issues/apitest?_id=test12&issue_title=Dertest&issue_text=Wirhabenvielvor.&created_by=chaiTest`)
    ]).then(() => {

      chai
        .request(server)
        .get(`/api/issues/apitest`)
        .end((err, res) => {
          assert.equal(res.body[0]._id, 'test10');
          assert.equal(res.body[1]._id, 'test11');
          assert.equal(res.body[2]._id, 'test12');
          Promise.all([
            chai.request(server).delete('/api/issues/apitest?_id=test10'),
            chai.request(server).delete('/api/issues/apitest?_id=test11'),
            chai.request(server).delete('/api/issues/apitest?_id=test12')
          ]).then(
            done()
          ).catch((err) => {
            console.log(err);
            done(err)
          })
          
        })
    }).catch((err) => {
      console.log(err);
      done(err)
    })
  }) */



  /* test('#20 View issues on a project with one filter: GET request to /api/issues/{project}', (done) => {
    Promise.all([
      chai.request(server).post(`/api/issues/apitest?_id=test20&issue_title=Dertest&issue_text=Wirhabenvielvor.&created_by=chaiTest`),
      chai.request(server).post(`/api/issues/apitest?_id=test21&issue_title=Dertest&issue_text=Wirhabenvielvor.&created_by=chaiTest`),
      chai.request(server).post(`/api/issues/apitest?_id=test22&issue_title=kein Test&issue_text=Wirhabenvielvor.&created_by=chaiTest`),
      chai.request(server).post(`/api/issues/apitest?_id=test23&issue_title=kein Test&issue_text=bald.&created_by=chaiTest`)

    ]).then(() => {

      chai
        .request(server)
        .get(`/api/issues/apitest?issue_title=kein Test`)
        .end((err, res) => {
          assert.equal(res.body.length, 2);
          assert.isTrue(isValueInObject(res.body, 'test22'));
          assert.isTrue(isValueInObject(res.body, 'test23'));
          Promise.all([
            chai.request(server).delete('/api/issues/apitest?_id=test20'),
            chai.request(server).delete('/api/issues/apitest?_id=test21'),
            chai.request(server).delete('/api/issues/apitest?_id=test22'),
            chai.request(server).delete('/api/issues/apitest?_id=test23')
          ]).then(
            done()
          ).catch((err) => {
            console.log(err);
            done(err)
          })
          
        })
    }).catch((err) => {
      console.log(err);
      done(err)
    })
  }) */

  /* test('#30 View issues on a project with multiple filters: GET request to /api/issues/{project}', (done) => {
    Promise.all([
      chai.request(server).post(`/api/issues/apitest?_id=test30&issue_title=Dertest&issue_text=Wirhabenvielvor&created_by=chaiTest`),
      chai.request(server).post(`/api/issues/apitest?_id=test31&issue_title=Dertest&issue_text=Wirhabenvielvor&created_by=chaiTest`),
      chai.request(server).post(`/api/issues/apitest?_id=test32&issue_title=kein Test&issue_text=Wirhabenvielvor&created_by=chaiTest`),
      chai.request(server).post(`/api/issues/apitest?_id=test33&issue_title=kein Test&issue_text=bald.&created_by=chaiTest`),
      chai.request(server).post(`/api/issues/apitest?_id=test34&issue_title=kein Test&issue_text=Wirhabenvielvor&created_by=notChai`)

    ]).then(() => {

      chai
        .request(server)
        .get(`/api/issues/apitest?issue_title=kein Test&issue_text=Wirhabenvielvor`)
        .end((err, res) => {
          assert.equal(res.body.length, 2);
          assert.isTrue(isValueInObject(res.body, 'test32'));
          assert.isTrue(isValueInObject(res.body, 'test34'));
          Promise.all([
            chai.request(server).delete('/api/issues/apitest?_id=test30'),
            chai.request(server).delete('/api/issues/apitest?_id=test31'),
            chai.request(server).delete('/api/issues/apitest?_id=test32'),
            chai.request(server).delete('/api/issues/apitest?_id=test33'),
            chai.request(server).delete('/api/issues/apitest?_id=test34')
          ]).then(
            done()
          ).catch((err) => {
            console.log(err);
            done(err)
          })
          
        })
    }).catch((err) => {
      console.log(err);
      done(err)
    })
  }) */

  /* test('#40 Update one field on an issue: PUT request to /api/issues/{project}', (done) => {
    Promise.all([
      chai.request(server).post(`/api/issues/apitest?_id=test40&issue_title=Dertest&issue_text=Wirhabenvielvor&created_by=chaiTest`)

    ]).then(() => {

      chai
        .request(server)
        .put(`/api/issues/apitest?_id=test40&issue_text=Wirhab`)
        .end((err, res) => {
          assert.equal(res.status, 202);
          Promise.all([
            chai.request(server).delete('/api/issues/apitest?_id=test40')
          ]).then(
            done()
          ).catch((err) => {
            console.log(err);
            done(err)
          })
        })
    }).catch((err) => {
      console.log(err);
      done(err)
    })
  }) */
});

test('#50 Update multiple fields on an issue: PUT request to /api/issues/{project}', (done) => {
  Promise.all([
    chai.request(server).post(`/api/issues/apitest?_id=test50&issue_title=Dertest&issue_text=Wirhabenvielvor&created_by=chaiTest`)

  ]).then(() => {

    chai
      .request(server)
      .put(`/api/issues/apitest?_id=test50&issue_text=Wirhab&created_by=NewUser`)
      .end((err, res) => {
        assert.equal(res.status, 202);
        Promise.all([
          chai.request(server).delete('/api/issues/apitest?_id=test50')
        ]).then(
          done()
        ).catch((err) => {
          console.log(err);
          done(err)
        })
      })
  }).catch((err) => {
    console.log(err);
    done(err)
  })
})
