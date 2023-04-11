const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');
const { logAndSendError, logError } = require('../ErrorHandler/logError');

chai.use(chaiHttp);

const isValueInObject = (obj, value) => {
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const valueFromKey = obj[key].issue_title;
      if (valueFromKey === value) {return true}
    }
  }
  return false
}

suite('Functional Tests', function() {
  test('#1 Create an issue with every field: POST request to /api/issues/{project}', (done) => {
    chai
      .request(server)
      .post(`/api/issues/apitest`) // ?_id=test1&issue_title=Dertest&issue_text=Wirhabenvielvor.&created_by=chaiTest#1&assigned_to=FreeCodeCamp&status_text=test#1
      .send({
        issue_title: 'Test #1',
        issue_text:  'Wirhabenvielvor.',
        created_by:  'chaiTest',
        assigned_to: 'FreeCodeCamp',
        status_text: 'test#1'
      })
      .end(async(err, res) => {
        assert.equal(res.status, 201);
        //assert.equal(res.body.acknowledged, true); // Funktion, die die Daten verarbeitet und zurückgibt
        await chai.request(server).delete('/api/issues/apitest').send({ message: 'delete all'}),
        done()
      })
  })

   test('#2 Create an issue with only required fields: POST request to /api/issues/{project}', (done) => {
    chai
      .request(server)
      .post(`/api/issues/apitest`)
      .send({
        issue_title: 'Test #2',
        issue_text:  'Wirhabenvielvor.',
        created_by:  'chaiTest'
      })
      .end(async (err, res) => {
        assert.equal(res.status, 201);
        await chai.request(server).delete('/api/issues/apitest').send({ message: 'delete all'}),
        done()
      })
  })

  test('#3 Create an issue with missing required fields: POST request to /api/issues/{project}', (done) => {
    chai
      .request(server)
      .post(`/api/issues/apitest`)
      .send({
        issue_title: 'Test #2',
        issue_text:  'Wirhabenvielvor.'
      })
      .end(async (err, res) => {
        assert.equal(res.status, 400);
        await chai.request(server).delete('/api/issues/apitest').send({ message: 'delete all'}),
        done()
      })
  })

   test('#10 View issues on a project: GET request to /api/issues/{project}', (done) => {
    Promise.all([
      chai.request(server).post(`/api/issues/apitest`)
        .send({ issue_title:'Test #10',issue_text:'Wirhabenvielvor.',created_by:'chaiTest',assigned_to: 'FreeCodeCamp',status_text: 'test#1' }),
      chai.request(server).post(`/api/issues/apitest`)
        .send({ issue_title:'Test #11',issue_text:'Wirhabenvielvor.',created_by:'chaiTest',assigned_to: 'FreeCodeCamp',status_text: 'test#1' }),
      chai.request(server).post(`/api/issues/apitest`)
        .send({ issue_title:'Test #12',issue_text:'Wirhabenvielvor.',created_by:'chaiTest',assigned_to: 'FreeCodeCamp',status_text: 'test#1' }),
    ]).then(() => {

      chai
        .request(server)
        .get(`/api/issues/apitest`)
        .end(async (err, res) => {
          assert.equal(res.body.length, 3);
          await chai.request(server).delete('/api/issues/apitest').send({ message: 'delete all'}),
          done()
        })
      }).catch ((error) => {
      logError(400, 'unknown error in test #10')
      done()
    })
  })



  test('#20 View issues on a project with one filter: GET request to /api/issues/{project}', (done) => {
    Promise.all([
      chai.request(server).post(`/api/issues/apitest`)
      .send({ issue_title:'Test #20',issue_text:'Wirhabenvielvor.',created_by:'chaiTest',assigned_to: 'FreeCodeCamp',status_text: 'test#1' }),
      chai.request(server).post(`/api/issues/apitest`)
      .send({ issue_title:'Test #21',issue_text:'Dertest.',created_by:'NotchaiTest',assigned_to: 'FreeCodeCamp',status_text: 'test#1' }),
      chai.request(server).post(`/api/issues/apitest`)
      .send({ issue_title:'Test #22',issue_text:'kein Test',created_by:'chaiTest',assigned_to: 'FreeCodeCamp',status_text: 'test#1' }),
      chai.request(server).post(`/api/issues/apitest`)
      .send({ issue_title:'Test #23',issue_text:'kein Test',created_by:'chaiTest',assigned_to: 'FreeCodeCamp',status_text: 'test#1' })

    ]).then(() => {

      chai
        .request(server)
        .get(`/api/issues/apitest`)
        .send({
          issue_text: 'kein Test'
        })
        .end(async (err, res) => {
          assert.equal(res.body.length, 2);
          assert.isTrue(isValueInObject(res.body, 'Test #22'), 'is Test #22');
          assert.isTrue(isValueInObject(res.body, 'Test #23'), 'is Test #23');
          await chai.request(server).delete('/api/issues/apitest').send({ message: 'delete all'}),
          done()
        })
    }).catch((err) => {
      console.log(err);
      done(err)
    })
  })

  test('#30 View issues on a project with multiple filters: GET request to /api/issues/{project}', (done) => {
    Promise.all([
      chai.request(server).post(`/api/issues/apitest`)
      .send({ issue_title:'Test #30',issue_text:'Wirhabenvielvor.',created_by:'chaiTest',assigned_to: 'FreeCodeCamp',status_text: 'test#1' }),
      chai.request(server).post(`/api/issues/apitest`)
      .send({ issue_title:'Test #31',issue_text:'Dertest.',created_by:'notchaiTest',assigned_to: 'FreeCodeCamp',status_text: 'test#1' }),
      chai.request(server).post(`/api/issues/apitest`)
      .send({ issue_title:'Test #32',issue_text:'kein Test',created_by:'notchaiTest',assigned_to: 'FreeCodeCamp',status_text: 'test#1' }),
      chai.request(server).post(`/api/issues/apitest`)
      .send({ issue_title:'Test #33',issue_text:'kein Test',created_by:'notchaiTest',assigned_to: 'FreeCodeCamp',status_text: 'test#1' }),
      chai.request(server).post(`/api/issues/apitest`)
      .send({ issue_title:'Test #34',issue_text:'kein Test',created_by:'chaiTest',assigned_to: 'FreeCodeCamp',status_text: 'test#1' })

    ]).then(() => {
      chai
        .request(server)
        .get(`/api/issues/apitest`)
        .send({
          issue_text: 'kein Test',
          created_by: 'notchaiTest'
        })
        .end(async (err, res) => {
          assert.equal(res.body.length, 2);
          assert.isTrue(isValueInObject(res.body, 'Test #32'));
          assert.isTrue(isValueInObject(res.body, 'Test #33'));
          await chai.request(server).delete('/api/issues/apitest').send({ message: 'delete all'})
          done()
        })
    }).catch((err) => {
      console.log(err);
      done(err)
    })
  })

  test('#40 Update one field on an issue: PUT request to /api/issues/{project}', (done) => {
    Promise.all([
      chai.request(server).post(`/api/issues/apitest`)
      .send({ issue_title:'Test #40',issue_text:'Wirhabenvielvor.',created_by:'chaiTest',assigned_to: 'FreeCodeCamp',status_text: 'test#1' })

    ]).then(([res]) => {

      chai
        .request(server)
        .put(`/api/issues/apitest`)
        .send({
          _id: res.body._id,
          issue_text: 'doch nicht'
        })
        .end(async (err, res) => {
          assert.equal(res.status, 202);
          await chai.request(server).delete('/api/issues/apitest').send({ message: 'delete all'})
          done()
        })
    }).catch((err) => {
      console.log(err);
      done(err)
    })
  })


  test('#50 Update multiple fields on an issue: PUT request to /api/issues/{project}', (done) => {
    Promise.all([
      chai.request(server).post(`/api/issues/apitest`)
      .send({ issue_title:'Test #50',issue_text:'Wirhabenvielvor.',created_by:'chaiTest',assigned_to: 'FreeCodeCamp',status_text: 'test#1' })

    ]).then(([res]) => {

      chai
        .request(server)
        .put(`/api/issues/apitest`)
        .send({
          _id: res.body._id,
          issue_text: 'doch nicht',
          created_by: 'Salamander'
        })
        .end(async (err, res) => {
          assert.equal(res.status, 202);
          await chai.request(server).delete('/api/issues/apitest').send({ message: 'delete all'})
          done()
        })
    }).catch((err) => {
      console.log(err);
      done(err)
    })
  })

  test('#60 Update an issue with missing _id: PUT request to /api/issues/{project}', (done) => {
    Promise.all([
      chai.request(server).post(`/api/issues/apitest`)
      .send({ issue_title:'Test #60',issue_text:'Wirhabenvielvor.',created_by:'chaiTest',assigned_to: 'FreeCodeCamp',status_text: 'test#1' })

    ]).then(([res]) => {

      chai
        .request(server)
        .put(`/api/issues/apitest`)
        .send({
          issue_text: 'doch nicht',
          created_by: 'Salamander'
        })
        .end(async (err, res) => {
          assert.equal(res.status, 410);
          await chai.request(server).delete('/api/issues/apitest').send({ message: 'delete all'})
          done()
        })
    }).catch((err) => {
      console.log(err);
      done(err)
    })
  })

  test('#70   Update an issue with no fields to update: PUT request to /api/issues/{project}', (done) => {
    Promise.all([
      chai.request(server).post(`/api/issues/apitest`)
      .send({ issue_title:'Test #70',issue_text:'Wirhabenvielvor.',created_by:'chaiTest',assigned_to: 'FreeCodeCamp',status_text: 'test#1' })

    ]).then(([res]) => {

      chai
        .request(server)
        .put(`/api/issues/apitest`)
        .send({
          _id: res.body._id
        })
        .end(async (err, res) => {
          assert.equal(res.status, 420);
          await chai.request(server).delete('/api/issues/apitest').send({ message: 'delete all'})
          done()
        })
    }).catch((err) => {
      console.log(err);
      done(err)
    })
  })

  test('#80   Update an issue with an invalid _id: PUT request to /api/issues/{project}', (done) => {
    Promise.all([
      chai.request(server).post(`/api/issues/apitest`)
      .send({ issue_title:'Test #80',issue_text:'Wirhabenvielvor.',created_by:'chaiTest',assigned_to: 'FreeCodeCamp',status_text: 'test#1' })

    ]).then(([res]) => {

      chai
        .request(server)
        .put(`/api/issues/apitest`)
        .send({
          _id: '16w1erf9816981',
          issue_text: 'neu'
        })
        .end(async (err, res) => {
          assert.equal(res.status, 402);
          await chai.request(server).delete('/api/issues/apitest').send({ message: 'delete all'})
          done()
        })
    }).catch((err) => {
      console.log(err);
      done(err)
    })
  })

  test('#90   Delete an issue: DELETE request to /api/issues/{project}', (done) => {
    Promise.all([
      chai.request(server).post(`/api/issues/apitest`)
      .send({ issue_title:'Test #90',issue_text:'Wirhabenvielvor.',created_by:'chaiTest',assigned_to: 'FreeCodeCamp',status_text: 'test#1' })
    ]).then(([res]) => {

      chai
        .request(server)
        .delete(`/api/issues/apitest`)
        .send({
          _id: res.body._id
        })
        .end(async (err, res) => {
          assert.equal(res.status, 200);
          if (err){
            await chai.request(server).delete('/api/issues/apitest').send({ message: 'delete all'})
          }
          done()
        })
    }).catch((err) => {
      console.log(err);
      done(err)
    })
  })


  test('#100   Delete an issue with an invalid _id: DELETE request to /api/issues/{project}', (done) => {
    Promise.all([
      chai.request(server).post(`/api/issues/apitest`)
      .send({ issue_title:'Test #100',issue_text:'Wirhabenvielvor.',created_by:'chaiTest',assigned_to: 'FreeCodeCamp',status_text: 'test#1' })
    ]).then(([res]) => {

      chai
        .request(server)
        .delete(`/api/issues/apitest`)
        .send({
          _id: '198we1f'
        })
        .end(async (err, res) => {
          assert.equal(res.status, 401);
          if (err){
            await chai.request(server).delete('/api/issues/apitest').send({ message: 'delete all'})
          }
          done()
        })
    }).catch((err) => {
      console.log(err);
      done(err)
    })
  })

  test('#110   Delete an issue with missing _id: DELETE request to /api/issues/{project}', (done) => {
    chai
    .request(server)
    .delete(`/api/issues/apitest`)
    .send({
      _id: ''
    })
    .end((err, res) => {
      assert.equal(res.status, 404);
      done()
    })
  })

// end of Suite()
})
