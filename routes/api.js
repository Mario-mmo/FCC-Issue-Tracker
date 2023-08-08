'use strict';

const { Issue, Project } = require('../models/issueTracker.js');
const { ObjectId } = require('mongodb');

module.exports = function (app) {

  app.route('/api/issues/:project')
    .get(async function (req, res) {
      const project = req.params.project;

      const { assigned_to, status_text, open, _id, issue_title, issue_text, created_by, created_on, updated_on} = req.query;

      if (Object.keys(req.query).length === 0) {
        Project.findOne({ name: project })
          .then(p => {
            // console.log('PROJECT')
            // console.log(p);
            // console.log('ISSUES')
            // console.log(p.issues)
            res.json(p.issues);
          })
          .catch(() => {
            res.json([]) 
          });
          return
      }

      let openFix;

      if (open === 'true') openFix = true;
      else if (open === 'false') openFix = false;

      await Project.aggregate([
        { $match: { name: project } },
        { $unwind: '$issues' },
        assigned_to != undefined
          ? { $match: { 'issues.assigned_to': assigned_to }}
          : { $match: {} },
        status_text != undefined
          ? { $match: { 'issues.status_text': status_text }}
          : { $match: {} },
        open != undefined
          ? { $match: { 'issues.open': openFix }}
          : { $match: {} },
        _id != undefined
          ? { $match: { 'issues._id': new ObjectId(_id) }}
          : { $match: {} },
        issue_title != undefined
          ? { $match: { 'issues.issue_title': issue_title }}
          : { $match: {} },
        issue_text != undefined
          ? { $match: { 'issues.issue_text': issue_text }}
          : { $match: {} },
        created_by != undefined
          ? { $match: { 'issues.created_by': created_by }}
          : { $match: {} },
        created_on != undefined
          ? { $match: { 'issues.created_on': created_on }}
          : { $match: {} },
        updated_on != undefined
          ? { $match: { 'issues.updated_on': updated_on }}
          : { $match: {} },
      ])
        .then(data => {
          let issueArray = data.map(d => {
            return d.issues;
          });

          res.json(issueArray);
        })
        .catch((err) => {
          return res.json([]);
        })

    })

    .post(async function (req, res) {
      let project = req.params.project;

      const { issue_title, issue_text, created_by, assigned_to, status_text } = req.body;

      const issue = new Issue({
        'issue_title': issue_title,
        'issue_text': issue_text,
        'created_by': created_by,
        'assigned_to': assigned_to || '',
        'status_text': status_text || '',
        'open': true,
        'created_on': new Date(),
        'updated_on': new Date()
      });

      if (!issue_title | !issue_text | !created_by) return res.json({ 'error': 'required field(s) missing' });

      await Project.findOne({ name: project })
        .then(p => {
          if (!p) {
            const newProject = new Project({
              name: project,
            })
            newProject.issues.push(issue)

            newProject.save();
          }
          else {
            p.issues.push(issue);

            p.save();
          }
          issue.save().then(() => res.json(issue));
        })
    })

    .put(async function (req, res) {
      let project = req.params.project;

      const { _id, issue_title, issue_text, created_by, assigned_to, status_text, open } = req.body;

      if (!_id) return res.json({ 'error': 'missing _id' });

      if (!issue_title & !issue_text & !created_by & !assigned_to & !status_text & !open) {
        return res.json({ error: 'no update field(s) sent', '_id': _id });
      }


      await Project.findOne({ name: project })
        .then(p => {
          if (!p) return res.json({ 'error': 'could not update', '_id': _id });

          else {
            let issue = p.issues.id(_id);

            if (!issue) {
              return res.json({ 'error': 'could not update', '_id': _id });
            }

            else {
              issue.issue_title = issue_title || issue.issue_title;
              issue.issue_text = issue_text || issue.issue_text;
              issue.created_by = created_by || issue.created_by;
              issue.assigned_to = assigned_to || issue.assigned_to;
              issue.status_text = status_text || issue.status_text;
              issue.open = open || issue.open;
              issue.updated_on = new Date();

              p.save();

              Issue.findByIdAndUpdate(_id, {
                issue_title: issue_title || issue.issue_title,
                issue_text: issue_text || issue.issue_text,
                created_by: created_by || issue.created_by,
                assigned_to: assigned_to || issue.assigned_to,
                status_text: status_text || issue.status_text,
                open: open || issue.open,
                updated_on: new Date()
              }).then(() => res.json({  result: 'successfully updated', '_id': _id }))
            }
          }
        })
    })

    .delete(async function (req, res) {
      let project = req.params.project;

      const id = req.body._id;

      if (!id) return res.json({ error: 'missing _id'});

      await Project.findOneAndUpdate({ name: project }, {
        $pull: {
          'issues': {
            '_id': id
          }
        }
      })
        .then(() => {
          Issue.findByIdAndDelete(id)
            .then(i => {
              if (!i) return res.json({ 'error': 'could not delete', '_id': id });
              return res.json({ 'result': 'successfully deleted', '_id': id });
            })
        })
        .catch(() => res.json({ 'error': 'could not delete', '_id': id }))
    });
};