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
      } catch (error) {
        console.log('unknown error'.bgRed.black);
        res.status(400).send('unknown error')
        return
      }

      res.json(foundIssues)
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
        console.log(' '.repeat(10) + 'Invalid issue data'.bgRed.black)
        res.status(400).send('Invalid issue data')
        logDuration(timer)
        return
      }
        
        newIssue.save({ validateBeforeSave: false })
        .then(savedIssue => {
          if (savedIssue.errors) {
            console.log(' '.repeat(10) + 'Issue not created'.bgRed.black)
            res.status(400).send('Invalid issue data');
            return;
          }  
          res.status(201).send('Issue created successfully');
          logDuration(timer)
        })
        .catch((error) => {
          console.log(' '.repeat(10) + '400 Error on saving'.bgRed.black)
          res.status(400).send('400 Error on saving')
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
        /* console.log(' '.repeat(10) + '420 no fields to update'.bgRed.black);
        res.status(420).send('420 no fields to update'.bgRed.black) */
        return
      }
      updatePack.updated_on = Date.now()

      if (!issueID) {
        console.log(' '.repeat(10) + 'onUpdate: _id is missing'.bgRed.black)
        res.status(410).send('onUpdate: _id is missing')
      }else {
        try {
          const updateFeedback = await Issue.findOneAndUpdate({ _id: issueID}, updatePack, {new: true})
          if (updateFeedback) {
            res.status(202).send('Issue updated successfully');
          } else {
            console.log(' '.repeat(10) + 'no match for update'.bgRed.black);
            res.status(401).send('no match for update')
          }
        } catch (error) {
          console.log(' '.repeat(10) + 'error on update'.bgRed.black);
          res.status(400).send('unexpected error on update')
        }
      }
    })
    
  // ///////////////////////////////////////////////////////////////////////  DELETE

    .delete(async function (req, res){
      let project = req.params.project;
      
      try {
      const deleteFeedback = await Issue.deleteOne({ _id: req.query._id  })
         if (deleteFeedback.deletedCount === 0) {
          logAndSendError(400, 'error: issue with requested _id was not found')
/*        console.log(' '.repeat(10) + 'error: issue with requested _id was not found'.bgRed.black);
          res.status(400).send('error: issue with requested _id was not found') */
        } else { 
          console.log(' '.repeat(10) + 'successfull deleted'.bgGreen.white);
          res.status(200).send('successfull deleted')
        }
      } catch(error) {
          console.log(' '.repeat(10) + `couldn't delete Issue`)
          res.status(400).send('unknown error: issue could not deleted' )
        };
    })
    
};
