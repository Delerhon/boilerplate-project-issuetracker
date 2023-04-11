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
        if (getKeyLength(req.body) > 0) {
          for (const key in req.body) {
            filter[key] = req.body[key]
          } 
        }
        try {
          foundIssues = await Issue.find(filter)
          res.json(foundIssues)
        } catch (error) {
          logAndSendError(400, 'onFind: unknown error', res)
        }
      })

    // ///////////////////////////////////////////////////////////////////////  POST

      .post(async function (req, res){
        const timer = Date.now()
        let project = req.params.project;
        const body = req.body
        const newIssue = new Issue({
          issue_title: body.issue_title,
          issue_text: body.issue_text,
          assigned_to: body.assigned_to,
          status_text: body.status_text,
          created_by: body.created_by
        })

        try {
          //await newIssue.validate()

          try {
            const savedIssue = await newIssue.save()
            if (savedIssue.errors) {
              logAndSendError(401, 'Invalid issue data', res)
              return
            }
            res.body = { _id: savedIssue._id }  
            res.status(201). send(res.body);
          } catch(error) {
            logAndSendError(400, 'Error on saving', res, error.message)

          }
        } catch(err) {
          logAndSendError(402, 'Invalid issue data', res, err)
          return
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
          logAndSendError(420, 'no fields to update', res)
          return
        }
        updatePack.updated_on = Date.now()

        if (!issueID) {
          logAndSendError(410, 'onUpdate: _id is missing', res)
          return
        }

        await updateOne(issueID, updatePack, res);
        
      })
      
    // ///////////////////////////////////////////////////////////////////////  DELETE

      .delete(async function (req, res){
        let project = req.params.project;
        if (!req.body._id && !req.body.message) {
          logAndSendError(404, 'error: missing _id', res)
          return
        }
        if(req.body.message == 'delete all') {
          await deleteAllTest(req, res);
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

const deleteOne = async (req, res) => {
  try {
    const deleteFeedback = await Issue.deleteOne({ _id: req.body._id });
    if (deleteFeedback.deletedCount === 0) {
      logAndSendError(401, 'error: issue with requested _id was not found', res);
    } else {
      console.log(' '.repeat(10) + 'successfull deleted'.bgGreen.white);
      res.status(200).send('successfull deleted');
    }
  } catch (error) {
    if (!!error.message.match(/Cast to ObjectId/)) {
      logAndSendError(401, 'error: issue with requested _id was not found', res)
    } else {
      logAndSendError(400, 'unknown error: issue could not deleted', res);
    }
  };
};



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
      res.status(202).send('Issue updated successfully');
    } else {
      logAndSendError(401, 'no match for update', res);
    }
  } catch (error) {
    if (!!error.message.match(/Cast to ObjectId/)) {
      logAndSendError(402, error.message, res)
    }else {
      logAndSendError(400, 'error on update', res);
    }
  }
}

