'use strict';
const { logError, logAndSendError } = require('../ErrorHandler/logError');

const Issue = require('../MongoDB/schemas.js');
const mongodb = require('mongodb');
const express = require('express')
const app = express()
const myDB = require('../MongoDB/connection')
const mongoose = require('mongoose');
const { response } = require('../server.js');
const color = require('color');
const ObjectID = mongoose.Types.ObjectId

const getKeyLength = (obj) => Object.keys(obj).length;
const getKey = (obj, index) => Object.keys(obj)[index]

const logDuration = (startingTime) => {
  const duration = (Date.now() - startingTime) / 1_000
  console.log(' '.repeat(10) + `${duration}`.bgYellow.black)
}

module.exports = (app, myDataBase) => {
    app.route('/api/issues/:project')
    
    // ///////////////////////////////////////////////////////////////////////  GET
      .get(async function (req, res){
        let project = req.params.project;
        const filter = {}

        if (getKeyLength(req.query) > 0) {
          for (const key in req.query) {
            filter[key] = req.query[key];        
          }
        } else {
          if (getKeyLength(req.body) > 0) {
            for (const key in req.body) {
              filter[key] = req.body[key]
            } 
          }
        }
        await find(project, filter, res);
      })

    // ///////////////////////////////////////////////////////////////////////  POST

      .post(async function (req, res){
        const timer = Date.now()
        let project = req.params.project;
        const body = req.body
        const newIssue = createNewIssue(project, body)

          try {
            const savedIssue = await newIssue.save()
            if (savedIssue.errors) {
              logAndSendError('Invalid issue data', res)
              return
            }
            res.body = createIssueForPostResponse(savedIssue)
            res.status(200).json(res.body);
          } catch(error) {
            if (error.code == 11000) {
              const err = { error: 'duplicate error' }
              logAndSendError(err, res, err)
            } else {
              const err = {error: `required field(s) missing` }
              logAndSendError(err, res, err)
          }
          }
        
      })
    
    // ///////////////////////////////////////////////////////////////////////  PUT

      .put(async function (req, res){
        const timer = Date.now()
        let project = req.params.project;
        const issueID = req.body._id
        const updatePack = createFilter(project, req)

        if (!issueID) {
          const error = { error: 'missing _id' }
          logAndSendError(error, res, error)
          return
        }

        if (Object.keys(updatePack).length === 0) { 
          const error = {error: 'no update field(s) sent', '_id': issueID }
          logAndSendError(error, res, error)
          return
        }
        updatePack.updated_on = Date.now()



        await updateOne(req, updatePack, res);
        
      })
      
    // ///////////////////////////////////////////////////////////////////////  DELETE

      .delete(async function (req, res){
        let project = req.params.project;
        if (!req.body._id && !req.body.message) {
          const error = { error: 'missing _id' }
          logAndSendError(error, res, error)
          return
        }
        if(req.body.message == 'delete all') {
          await deleteAllTest(project, req, res);
          return
        }
        if (req.body.message == 'delete all issues, i know what i am doing') {
          deleteAll(project, req, res)
          return
        }
        await deleteOne(project, req, res);
      })
};

const deleteAllTest = async (project, req, res) => {
  try {
    const deleteFeedback = await Issue.deleteMany({issue_title: /Test/i });
    if (deleteFeedback.deletedCount === 0) {
      logAndSendError('error: could not delete all', res);
    } else {
      res.status(200).json('successfull deleted all');
    }
  } catch (error) {
    logAndSendError('unexpected error onDeleteAll', res);
  }
};

const deleteAll = async (project, req, res) => {
  try {
    const deleteFeedback = await Issue.deleteMany({issue_title: /\w/i });
    if (deleteFeedback.deletedCount === 0) {
      logAndSendError('error: no issue was deleted', res);
    } else {
      res.status(200).json('successfull deleted all, really all!!!');
    }
  } catch (error) {
    logAndSendError('unexpected error onDeleteAll', res);
  }
};

const deleteOne = async (project, req, res) => {
  try {
    const deleteFeedback = await Issue.deleteOne({ project, _id: req.body._id });
    if (deleteFeedback.deletedCount === 0) {
      const error = { error: 'could not delete', _id: req.body._id }
      logAndSendError(error, res,  error);
    } else {
      console.log(' '.repeat(10) + 'successfull deleted'.bgGreen.white);
      const deleteResponse = {
        result: 'successfully deleted',
        _id: req.body._id
      }
      res.status(200).json(deleteResponse);
    }
  } catch (error) {
    const err = {error: 'could not delete', _id: req.body._id}
    if (!!error.message.match(/Cast to ObjectId/)) {
      logAndSendError(err, res, err)
    } else {
      logAndSendError(err, res, err);
    }
  };
};

async function find(project, filter, res) {
  let foundIssues
  try {
    Issue.find(filter).byProject(project).exec()
    .then((foundIssues) => {
      //console.log(JSON.stringify(foundIssues));
      res.json(foundIssues)
    })
    .catch((err) => logAndSendError(401, 'onFind: unknown error', res));
  } catch (error) {
    logAndSendError('onFind: unknown error', res);
  }
}

function createIssueForPostResponse(savedIssue) {
  return {
    assigned_to: savedIssue.assigned_to,
    status_text: savedIssue.status_text,
    open: savedIssue.open,
    _id: savedIssue._id,
    issue_title: savedIssue.issue_title,
    issue_text: savedIssue.issue_text,
    created_by: savedIssue.created_by,
    created_on: savedIssue.created_on,
    updated_on: savedIssue.updated_on
  };
}

function createNewIssue(project, body) {
  return new Issue({
    project,
    issue_title: body.issue_title,
    issue_text: body.issue_text,
    assigned_to: body.assigned_to,
    status_text: body.status_text,
    created_by: body.created_by,
    open: body.open
  });
}

function createFilter(project, req) {
  const updatePack = {}
  if (getKeyLength(req.body) > 1) {
    for (const key in req.body) {
      if (key !== '_id') {
        updatePack[key] = req.body[key];
      }
    }
  }
  return updatePack
}


async function updateOne(req, updatePack, res) {
  try {
    const updateFeedback = await Issue.findOneAndUpdate({ _id: req.body._id }, updatePack, { new: true });
    if (updateFeedback) {
      const updateResponse = {
        result: 'successfully updated',
        _id: updateFeedback.id
      }
      res.status(200).json(updateResponse);
    } else {
      logAndSendError('no match for update', res);
    }
  } catch (error) {
    const err = { error: 'could not update', '_id': req.body._id }
    if (!!error.message.match(/Cast to ObjectId/)) {
      logAndSendError(err, res, err)
    }else {
      logAndSendError(err, res, err);
    }
  }
}

