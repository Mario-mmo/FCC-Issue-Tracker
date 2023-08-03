const mongoose = require('mongoose');
const { Schema } = mongoose;

const issueSchema = new Schema({
  issue_title: String,
  issue_text: String, 
  created_by: String,
  assigned_to: String,
  status_text: String,
  open: Boolean,
  created_on: Date,
  updated_on: Date
});

const projectSchema = new Schema({
  name: {type: String, required: true},
  issues: [issueSchema]
});

const Project = mongoose.model('Project', projectSchema);

const Issue = mongoose.model('Issue', issueSchema);

exports.Issue = Issue;
exports.Project = Project;