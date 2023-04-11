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
          filter[key] = req.query[key]
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
      const query = req.query
      const newIssue = new Issue({
        _id: query._id,
        issue_title: query.issue_title,
        issue_text: query.issue_text,
        assigned_to: query.assigned_to,
        status_text: query.status_text,
        created_by: query.created_by
      })

      try {
      await newIssue.validate()
      } catch(err) {
        logAndSendError(400, 'Invalid issue data', res)
        return
      }
        
        newIssue.save({ validateBeforeSave: false })
        .then(savedIssue => {
          if (savedIssue.errors) {
            logAndSendError(400, 'Invalid issue data', res)
          }  
          res.status(201).send('Issue created successfully');
        })
        .catch((error) => {
          logAndSendError(400, 'Error on saving', res)
    })
      
    })
  
  // ///////////////////////////////////////////////////////////////////////  PUT

    .put(async function (req, res){
      const timer = Date.now()
      let project = req.params.project;
      const issueID = req.query._id
      const updatePack = {}
      if (getKeyLength(req.query) > 1) {
        for (const key in req.query) {
          if (key !== '_id') {
          updatePack[key] = req.query[key]
          }
        } 
      }

      if (getKeyLength(req.query) === 1) {
        for (const key in req.query) {
          if (req.query[key] == '_id') {
            
          }
        }
      }
      
      if (Object.keys(updatePack).length === 0) { 
        logAndSendError(420, 'no fields to update', res)
        return
      }
      updatePack.updated_on = Date.now()

      if (!issueID) {
        logAndSendError(410, 'onUpdate: _id is missing', res)
      }else {
        try {
          const updateFeedback = await Issue.findOneAndUpdate({ _id: issueID}, updatePack, {new: true})
          if (updateFeedback) {
            res.status(202).send('Issue updated successfully');
          } else {
            logAndSendError(401, 'no match for update', res)
          }
        } catch (error) {
          logAndSendError(400, 'error on update', res)
        }
      }
    })
    
  // ///////////////////////////////////////////////////////////////////////  DELETE

    .delete(async function (req, res){
      let project = req.params.project;
      
      if (!req.query._id) {
        logAndSendError(402, 'error: missing _id', res)
        return
      }

      try {
      const deleteFeedback = await Issue.deleteOne({ _id: req.query._id  })
         if (deleteFeedback.deletedCount === 0) {
          logAndSendError(401, 'error: issue with requested _id was not found', res)
        } else { 
          console.log(' '.repeat(10) + 'successfull deleted'.bgGreen.white);
          res.status(200).send('successfull deleted')
        }
      } catch(error) {
        logAndSendError(400, 'unknown error: issue could not deleted', res)
          console.log(' '.repeat(10) + `couldn't delete Issue`)
          res.status(400).send('unknown error: issue could not deleted' )
        };
    })
    
};
