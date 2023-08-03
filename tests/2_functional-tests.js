const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

let idToDelete;

suite('Functional Tests', function () {
    suite('POST tests', function () {
        test('Create an issue with every field: POST request to /api/issues/{project}', function (done) {
            chai
                .request(server)
                .keepOpen()
                .post('/api/issues/:project')
                .set('content-type', 'application/json')
                .send({
                    issue_title: 'Issue to test',
                    issue_text: 'Functional test 1',
                    created_by: 'chai',
                    assigned_to: 'test',
                    status_text: 'testing'
                })
                .end(function (err, res) {
                    assert.equal(res.status, 200);
                    assert.equal(res.body.issue_title, 'Issue to test');
                    assert.equal(res.body.issue_text, 'Functional test 1');
                    assert.equal(res.body.created_by, 'chai');
                    assert.equal(res.body.assigned_to, 'test');
                    assert.equal(res.body.status_text, 'testing');
                    idToDelete = res.body._id;
                    done();
                })
        })

        test('Create an issue with only required fields: POST request to /api/issues/{project}', function (done) {
            chai
                .request(server)
                .keepOpen()
                .post('/api/issues/:project')
                .set('content-type', 'application/json')
                .send({
                    issue_title: 'Issue to test',
                    issue_text: 'Functional test 1',
                    created_by: 'chai',
                    assigned_to: '',
                    status_text: ''
                })
                .end(function (err, res) {
                    assert.equal(res.status, 200);
                    assert.equal(res.body.issue_title, 'Issue to test');
                    assert.equal(res.body.issue_text, 'Functional test 1');
                    assert.equal(res.body.created_by, 'chai');
                    assert.equal(res.body.assigned_to, '');
                    assert.equal(res.body.status_text, '');
                    done();
                })
        })

        test('Create an issue with missing required fields: POST request to /api/issues/{project}', function (done) {
            chai
                .request(server)
                .keepOpen()
                .post('/api/issues/:project')
                .set('content-type', 'application/json')
                .send({
                    issue_title: '',
                    issue_text: '',
                    created_by: '',
                    assigned_to: '',
                    status_text: ''
                })
                .end(function (err, res) {
                    assert.equal(res.status, 200);
                    assert.equal(res.body.error, 'required field(s) missing');
                    done();
                })
        })
    });

    suite('GET Tests', function () {
        test('View issues on a project: GET request to /api/issues/{project}', function (done) {
            chai
                .request(server)
                .keepOpen()
                .get('/api/issues/testProject')
                .end((err, res) => {
                    assert.equal(res.status, 200);
                    assert.typeOf(res.body, 'array');
                    assert.equal(res.body.length, 2);
                    done();
                })
        })

        test('View issues on a project with one filter: GET request to /api/issues/{project}', function (done) {
            chai
                .request(server)
                .keepOpen()
                .get('/api/issues/testProject?open=true')
                .end((err, res) => {
                    assert.equal(res.status, 200);
                    assert.typeOf(res.body, 'array');
                    assert.deepEqual(res.body, [
                        {
                            "assigned_to": "",
                            "status_text": "",
                            "open": true,
                            "_id": "64cb9096f92ffb928a89e7ae",
                            "issue_title": "Title",
                            "issue_text": "text",
                            "created_by": "chai",
                            "created_on": "2023-08-03T11:33:42.521Z",
                            "updated_on": "2023-08-03T12:06:00.439Z"
                        },
                        {
                            "assigned_to": "you",
                            "status_text": "testing functional ",
                            "open": true,
                            "_id": "64cb90a7f92ffb928a89e7b5",
                            "issue_title": "Title 2",
                            "issue_text": "text 2",
                            "created_by": "chai 2",
                            "created_on": "2023-08-03T11:33:59.823Z",
                            "updated_on": "2023-08-03T11:33:59.823Z"
                        }
                    ]);
                    done();
                })
        })

        test('View issues on a project with multiple filters: GET request to /api/issues/{project}', function (done) {
            chai
                .request(server)
                .keepOpen()
                .get('/api/issues/testProjectMultipleQuery?open=true&created_by=me&assigned_to=you')
                .end((err, res) => {
                    assert.equal(res.status, 200);
                    assert.typeOf(res.body, 'array');
                    assert.deepEqual(res.body, [
                        {
                            "assigned_to": "you",
                            "status_text": "",
                            "open": true,
                            "_id": "64cb95712301c39586c36cfd",
                            "issue_title": "title",
                            "issue_text": "hello",
                            "created_by": "me",
                            "created_on": "2023-08-03T11:54:25.366Z",
                            "updated_on": "2023-08-03T11:54:25.366Z"
                        },
                        {
                            "assigned_to": "you",
                            "status_text": "",
                            "open": true,
                            "_id": "64cb958b2301c39586c36d0b",
                            "issue_title": "title2",
                            "issue_text": "testing",
                            "created_by": "me",
                            "created_on": "2023-08-03T11:54:51.046Z",
                            "updated_on": "2023-08-03T11:54:51.046Z"
                        }
                    ]);
                    done();
                })
        })
    });

    suite('PUT Tests', function () {
        test('Update one field on an issue: PUT request to /api/issues/{project}', function (done) {
            chai
                .request(server)
                .keepOpen()
                .put('/api/issues/testProjectPut')
                .send({
                    _id: '64cb983ef98768a04a8f1b6c',
                    issue_text: 'Issue text Updated'
                })
                .end((err, res) => {
                    assert.equal(res.status, 200);
                    assert.equal(res.body.result, 'successfully updated');
                    done();
                })
        })

        test('Update multiple fields on an issue: PUT request to /api/issues/{project}', function (done) {
            chai
                .request(server)
                .keepOpen()
                .put('/api/issues/testProjectPut')
                .send({
                    _id: '64cb98bc9b18aa1d09bd3b72',
                    issue_title: 'Issue updated (PUT request test 2)',
                    open: 'false',
                    status_text: 'I GOT AN UPDATE!'
                })
                .end((err, res) => {
                    assert.equal(res.status, 200);
                    assert.equal(res.body.result, 'successfully updated');
                    done();
                })
        })

        test('Update an issue with missing _id: PUT request to /api/issues/{project}', function (done) {
            chai
                .request(server)
                .keepOpen()
                .put('/api/issues/testProjectPut')
                .send({
                    _id: '',
                    issue_title: 'Issue updated (PUT request test 2)',
                    open: 'false',
                    status_text: 'I GOT AN UPDATE!'
                })
                .end((err, res) => {
                    assert.equal(res.status, 200);
                    assert.equal(res.body.error, 'missing _id');
                    done();
                })
        })

        test('Update an issue with no fields to update: PUT request to /api/issues/{project}', function (done) {
            chai
                .request(server)
                .keepOpen()
                .put('/api/issues/testProjectPut')
                .send({
                    _id: '64cb98bc9b18aa1d09bd3b72',
                    issue_title: '',
                    status_text: '',
                    created_by: '',
                    assigned_to: '',
                    status_text: ''
                })
                .end((err, res) => {
                    assert.equal(res.status, 200);
                    assert.equal(res.body.error, 'no update field(s) sent');
                    assert.equal(res.body._id, '64cb98bc9b18aa1d09bd3b72');
                    done();
                })
        })

        test('Update an issue with an invalid _id: PUT request to /api/issues/{project}', function (done) {
            chai
                .request(server)
                .keepOpen()
                .put('/api/issues/testProjectPut')
                .send({
                    _id: 'hgishgushgo',
                    issue_title: 'Luis',
                    status_text: 'Hello',
                    created_by: '',
                    assigned_to: '',
                    status_text: ''
                })
                .end((err, res) => {
                    assert.equal(res.status, 200);
                    assert.equal(res.body.error, 'could not update');
                    assert.equal(res.body._id, 'hgishgushgo');
                    done();
                })
        })
    });

    suite('DELETE Tests', function() {
        test('Delete an issue: DELETE request to /api/issues/{project}', function(done) {
            chai
                .request(server)
                .keepOpen()
                .delete('/api/issues/testProjectDelete')
                .send({
                    _id: idToDelete
                })
                .end((err, res) => {
                    assert.equal(res.status, 200);
                    assert.equal(res.body.result, 'successfully deleted');
                    done();
                })
        });

        test('Delete an issue with an invalid _id: DELETE request to /api/issues/{project}', function(done) {
            chai
                .request(server)
                .keepOpen()
                .delete('/api/issues/testProjectDelete')
                .send({
                    _id: 'fhsafajfa'
                })
                .end((err, res) => {
                    assert.equal(res.status, 200);
                    assert.equal(res.body.error, 'could not delete');
                    assert.equal(res.body._id, 'fhsafajfa');
                    done();
                });
        });

        test('Delete an issue with missing _id: DELETE request to /api/issues/{project}', function(done) {
            chai
                .request(server)
                .keepOpen()
                .delete('/api/issues/testProjectDelete')
                .send({
                    _id: ''
                })
                .end((err, res) => {
                    assert.equal(res.status, 200);
                    assert.equal(res.body.error, 'missing _id');
                    done();
                })
        });
    });
});
