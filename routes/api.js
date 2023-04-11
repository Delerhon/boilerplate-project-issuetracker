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
        let foundIssues
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
        foundIssues = await find(foundIssues, filter, res);
      })

    // ///////////////////////////////////////////////////////////////////////  POST

      .post(async function (req, res){
        const timer = Date.now()
        let project = req.params.project;
        const body = req.body
        const newIssue = createNewIssue(body)

          try {
            const savedIssue = await newIssue.save()
            if (savedIssue.errors) {
              logAndSendError(401, 'Invalid issue data', res)
              return
            }
            res.body = createIssueForPostResponse(savedIssue)
            res.status(201).send(res.body);
          } catch(error) {
            const err = {error: 'required field(s) missing' }
            logAndSendError(400, 'required field(s) missing', res, err)

          }
        
      })
    
    // ///////////////////////////////////////////////////////////////////////  PUT

      .put(async function (req, res){
        const timer = Date.now()
        let project = req.params.project;
        const issueID = req.body._id
        const updatePack = createFilter(req)

        /* if (getKeyLength(req.body) === 1) {
          for (const key in req.body) {
            if (req.body[key] == '_id') {
              logAndSendError(430, 'no fields to update')
            }
          }
        }  */
        
        if (Object.keys(updatePack).length === 0) { 
          const error = {error: 'no update field(s) sent', '_id': req.body._id }
          logAndSendError(420, 'no update field(s) sent', res, error)
          return
        }
        updatePack.updated_on = Date.now()

        if (!issueID) {
          logAndSendError(410, 'missing _id', res, { error: 'missing _id' })
          return
        }

        await updateOne(issueID, updatePack, res);
        
      })
      
    // ///////////////////////////////////////////////////////////////////////  DELETE

      .delete(async function (req, res){
        let project = req.params.project;
        if (!req.body._id && !req.body.message) {
          const error = { error: 'missing _id' }
          logAndSendError(404, 'error: missing _id', res, error)
          return
        }
        if(req.body.message == 'delete all') {
          await deleteAllTest(req, res);
          return
        }
        if (req.body.message == 'delete all issues, i know what i am doing') {
          deleteAll(req, res)
          return
        }
        await deleteOne(req, res);
      })
};

const deleteAllTest = async (req, res) => {
  try {
    const deleteFeedback = await Issue.deleteMany({issue_title: /Test/i });
    if (deleteFeedback.deletedCount === 0) {
      logAndSendError(402, 'error: could not delete all', res);
    } else {
      res.status(200).send('successfull deleted all');
    }
  } catch (error) {
    logAndSendError(403, 'unexpected error onDeleteAll', res);
  }
};

const deleteAll = async (req, res) => {
  try {
    const deleteFeedback = await Issue.deleteMany({issue_title: /\w/i });
    if (deleteFeedback.deletedCount === 0) {
      logAndSendError(402, 'error: no issue was deleted', res);
    } else {
      res.status(200).send('successfull deleted all, really all!!!');
    }
  } catch (error) {
    logAndSendError(403, 'unexpected error onDeleteAll', res);
  }
};

const deleteOne = async (req, res) => {
  try {
    const deleteFeedback = await Issue.deleteOne({ _id: req.body._id });
    if (deleteFeedback.deletedCount === 0) {
      const error = { error: 'could not delete', _id: req.body._id }
      logAndSendError(401, 'error: issue with requested _id was not found', res,  error);
    } else {
      console.log(' '.repeat(10) + 'successfull deleted'.bgGreen.white);
      const deleteResponse = {
        result: 'successfully deleted',
        _id: req.body._id
      }
      res.status(200).send(deleteResponse);
    }
  } catch (error) {
    const err = {error: 'could not delete', _id: req.body._id}
    if (!!error.message.match(/Cast to ObjectId/)) {
      logAndSendError(401, 'error: issue with requested _id was not found', res, err)
    } else {
      logAndSendError(400, 'unknown error: issue could not deleted', res, err);
    }
  };
};



async function find(foundIssues, filter, res) {
  try {
    foundIssues = await Issue.find(filter);
    res.json(foundIssues);
  } catch (error) {
    logAndSendError(400, 'onFind: unknown error', res);
  }
  return foundIssues;
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

function createNewIssue(body) {
  return new Issue({
    issue_title: body.issue_title,
    issue_text: body.issue_text,
    assigned_to: body.assigned_to,
    status_text: body.status_text,
    created_by: body.created_by,
    open: body.open
  });
}

function createFilter(req) {
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


async function updateOne(issueID, updatePack, res) {
  try {
    const updateFeedback = await Issue.findOneAndUpdate({ _id: issueID }, updatePack, { new: true });
    if (updateFeedback) {
      const updateResponse = {
        result: 'successfully updated',
        _id: updateFeedback.id
      }
      res.status(202).send(updateResponse);
    } else {
      logAndSendError(401, 'no match for update', res);
    }
  } catch (error) {
    const err = { error: 'could not update', _id: issueID}
    if (!!error.message.match(/Cast to ObjectId/)) {
      logAndSendError(402, error.message, res, err)
    }else {
      logAndSendError(400, 'unknown error on update', res, err);
    }
  }
}

