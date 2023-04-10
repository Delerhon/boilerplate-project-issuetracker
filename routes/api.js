'use strict';
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
        return
      }
        
        newIssue.save({ validateBeforeSave: false })
        .then(savedIssue => {
          if (savedIssue.errors) {
            console.log(' '.repeat(10) + 'Issue created')
            res.status(400).send('Invalid issue data');
            return;
          }  
          res.status(201).send('Issue created successfully');
        })
        .catch((error) => {
          console.log('Error on saving'.bgRed.black)
          res.status(400).send('Error on saving')
    })
      
    })
  
  // ///////////////////////////////////////////////////////////////////////  PUT

    .put(async function (req, res){
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
      
      if (Object.keys(updatePack).length === 0) { 
        console.log('no fields to update'.bgRed.black);
        res.status(400).send('no fields to update')
      }

      updatePack.updated_on = Date.now()
      try {
        const updateFeedback = await Issue.findOneAndUpdate({ _id: issueID}, updatePack, {new: true})
        if (updateFeedback) {
          res.status(202).send('Issue updated successfully');
        } else {
          console.log('no match for update'.bgRed.black);
          res.status(400).send('no match for update')
        }
      } catch (error) {
        console.log('error on update'.bgRed.black);
        res.status(400).send('error on update')
      }
    })
    
  // ///////////////////////////////////////////////////////////////////////  DELETE

    .delete(async function (req, res){
      let project = req.params.project;
      
      Issue.deleteOne({ _id: req.query._id  })
      .then( (deletedIssue) => {
         if (deletedIssue.acknowledged === true) { 
          res.status.acknowledged = deletedIssue.acknowledged
          res.send()
          return
        }
         console.log(`Error: ` + deletedIssue)
         
      });
    })
    
};
