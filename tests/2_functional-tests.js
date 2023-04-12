const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
const server = require("../server");
const { logAndSendError, logError } = require("../ErrorHandler/logError");

chai.use(chaiHttp);

const isValueInObject = (obj, value) => {
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const valueFromKey = obj[key].issue_title;
      if (valueFromKey === value) {
        return true;
      }
    }
  }
  return false;
};

suite("Functional Tests", function () {
  test("#1 Create an issue with every field: POST request to /api/issues/{project}", (done) => {
    chai
      .request(server)
      .post(`/api/issues/apitest`) 
      .send({
        issue_title: "Test 1",
        issue_text: "Wirhabenvielvor.",
        created_by: "chaiTest",
        assigned_to: "FreeCodeCamp",
        status_text: "test1",
      })
      .end(async (err, res) => {
        assert.equal(res.status, 201);
        assert.hasAllKeys(res.body, [
          "issue_title",
          "issue_text",
          "_id",
          "created_by",
          "created_on",
          "updated_on",
          "assigned_to",
          "open",
          "status_text",
        ]);
        done();
      });
  });

  test("#2 Create an issue with only required fields: POST request to /api/issues/{project}", (done) => {
    chai
      .request(server)
      .post(`/api/issues/apitest`)
      .send({
        issue_title: "Test 2",
        issue_text: "Wirhabenvielvor.",
        created_by: "chaiTest",
        open: false
      })
      .end(async (err, res) => {
        assert.equal(res.status, 201)
        assert.hasAllKeys(res.body, [
          "issue_title",
          "issue_text",
          "_id",
          "created_by",
          "created_on",
          "updated_on",
          "assigned_to",
          "open",
          "status_text",
        ]);
        done();
      });
  });

  test("#3 Create an issue with missing required fields: POST request to /api/issues/{project}", (done) => {
    chai
      .request(server)
      .post(`/api/issues/apitest`)
      .send({
        issue_title: "Test 2",
        issue_text: "Wirhabenvielvor.",
      })
      .end(async (err, res) => {
        assert.equal(res.body.status, 400);
        assert.equal(res.body.error, 'required field(s) missing');
        done();
      });
  });

  test("#10 View issues on a project: GET request to /api/issues/{project}", (done) => {
    Promise.all([
      chai
        .request(server)
        .post(`/api/issues/apitest2`)
        .send({
          issue_title: "Test 10",
          issue_text: "Wirhabenvielvor.",
          created_by: "notchaiTest",
          assigned_to: "FreeCodeCamp",
          status_text: "test#1",
        })
    ])
      .then(() => {
        chai
          .request(server)
          .get(`/api/issues/apitest`)
          .end(async (err, res) => {
            assert.lengthOf(res.body, 2)
            assert.isArray(res.body);
            done();
          });
      })
      .catch((error) => {
        logError(400, "unknown error in test 10");
        done();
      });
  });

  test("#20 View issues on a project with one filter: GET request to /api/issues/{project}", (done) => {
    Promise.all([
      chai
        .request(server)
        .post(`/api/issues/apitest`)
        .send({
          issue_title: "Test 20",
          issue_text: "nö",
          created_by: "chaiTest",
          assigned_to: "FreeCodeCamp",
          status_text: "test#1",
          open: true
        })
    ])
      .then(() => {
        chai
          .request(server)
          .get(`/api/issues/apitest?open=true`)
          .end(async (err, res) => {
            assert.equal(res.body.length, 2);
            assert.equal(res.body[0].issue_title, "Test 1");
            assert.equal(res.body[1].issue_title, "Test 20");
            done();
          });
      })
      .catch((err) => {
        console.log(err);
        done(err);
      });
  });

  test("#30 View issues on a project with multiple filters: GET request to /api/issues/{project}", (done) => {
    chai
      .request(server)
      .get(`/api/issues/apitest?issue_text=Wirhabenvielvor.&created_by=chaiTest`)
      .end(async (err, res) => {
        assert.lengthOf(res.body, 2);
        assert.equal(res.body[0].issue_title, "Test 1");
        assert.equal(res.body[1].issue_title, "Test 2");
        done();
      });

  });

  test("#40 Update one field on an issue: PUT request to /api/issues/{project}", (done) => {
    chai
      .request(server)
      .get('/api/issues/apitest?issue_title=Test 1')
      .end( (err, res) => {
        const testID = res.body["0"]._id
        chai
          .request(server)
          .put(`/api/issues/apitest`)
          .send({
            _id: testID,
            issue_text: "doch nicht",
          })
          .end(async (err, res) => {
            assert.equal(res.status, 202)
            assert.equal(res.body.result, 'successfully updated');
            assert.equal(res.body._id, testID)
            done();
          });
        })
  });

  test("#50 Update multiple fields on an issue: PUT request to /api/issues/{project}", (done) => {
    chai
      .request(server)
      .get('/api/issues/apitest?issue_title=Test 1')
      .end( (err, res) => {
        const testID = res.body["0"]._id
        chai
          .request(server)
          .put(`/api/issues/apitest`)
          .send({
            _id: testID,
            issue_text: "doch nicht",
            created_by: 'not me'
          })
          .end(async (err, res) => {
            assert.equal(res.status, 202)
            assert.equal(res.body.result, 'successfully updated');
            assert.equal(res.body._id, testID)
            done();
          });
        })
  });

  test("#60 Update an issue with missing _id: PUT request to /api/issues/{project}", (done) => {
    chai
    .request(server)
    .get('/api/issues/apitest?issue_title=Test 1')
    .end( (err, res) => {
      const testID = res.body["0"]._id
      chai
        .request(server)
        .put(`/api/issues/apitest`)
        .send({
          issue_text: "doch nicht",
          created_by: 'not me'
        })
        .end(async (err, res) => {
          assert.equal(res.body.status, 410);
          assert.equal(res.body.error, 'missing _id');
          done();
        });
      })
  });    

  test("#70   Update an issue with no fields to update: PUT request to /api/issues/{project}", (done) => {
    chai
    .request(server)
    .get('/api/issues/apitest?issue_title=Test 1')
    .end( (err, res) => {
      const testID = res.body["0"]._id
      chai
        .request(server)
        .put(`/api/issues/apitest`)
        .send({
          _id: testID,
        })          
        .end(async (err, res) => {
            assert.equal(res.body.status, 420);
            assert.equal(res.body.error, 'no update field(s) sent' )

            done();
          });
      })
  });

  test("#80   Update an issue with an invalid _id: PUT request to /api/issues/{project}", (done) => {
    chai
      .request(server)
      .put(`/api/issues/apitest`)
      .send({
        _id: 'eargae',
        issue_text: "doch nicht",
        created_by: 'not me'
      })
      .end(async (err, res) => {
        assert.equal(res.body.status, 402);
        assert.equal(res.body.error, 'could not update')
        done();
      });
  });

  test("#90   Delete an issue: DELETE request to /api/issues/{project}", (done) => {
    chai
    .request(server)
    .get('/api/issues/apitest?issue_title=Test 1')
    .end( (err, res) => {   
      const getID = res.body["0"]._id 
      chai
        .request(server)
        .delete(`/api/issues/apitest`)
        .send({
          _id: getID,
        })
        .end(async (err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.body.result, 'successfully deleted')
          assert.equal(res.body._id, getID)
          done();
        });
      })
  });

  test("#100   Delete an issue with an invalid _id: DELETE request to /api/issues/{project}", (done) => {
    chai
      .request(server)
      .delete(`/api/issues/apitest`)
      .send({
        _id: "198we1f",
      })
      .end(async (err, res) => {
        assert.equal(res.body.status, 401)
        assert.equal(res.body.error, 'could not delete')
        assert.equal(res.body._id, "198we1f")
        done();
      });
  });

  test("#110   Delete an issue with missing _id: DELETE request to /api/issues/{project}", (done) => {
    chai
      .request(server)
      .delete(`/api/issues/apitest`)
      .send({
      })
      .end((err, res) => {
        assert.equal(res.body.status, 404);
        assert.equal(res.body.error, 'missing _id')
        chai.request(server).delete('/api/issues/apitest').send({message: 'delete all'})
        .end((err, res) => {
          chai.request(server).delete('/api/issues/apitest2').send({message: 'delete all'})
        done();
        })
      })
  });

  // end of Suite()
});
