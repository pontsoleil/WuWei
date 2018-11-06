import * as express from 'express';

import UserCtrl from './controllers/user';
import AgentCtrl from './controllers/agent';
import ResourceCtrl from './controllers/resource';
import AnnotationCtrl from './controllers/annotation';
import NodeCtrl from './controllers/node';
import LinkCtrl from './controllers/link';
import NoteCtrl from './controllers/note';
import FileCtrl from './controllers/file';
import S3Ctrl from './controllers/s3bucket';

export default function setRoutes(app) {

  const userCtrl = new UserCtrl();
  const agentCtrl = new AgentCtrl();
  const resourceCtrl = new ResourceCtrl();
  const annotationCtrl = new AnnotationCtrl();
  const nodeCtrl = new NodeCtrl();
  const linkCtrl = new LinkCtrl();
  const noteCtrl = new NoteCtrl();
  const fileCtrl = new FileCtrl();
  const s3Ctrl = new S3Ctrl();

  // S3
  app.route('/api/upload-s3').get(s3Ctrl.upload);
  app.route('/api/files-s3').get(s3Ctrl.getAll);
  app.route('/api/features-s3/').get(s3Ctrl.getFeatures);

  // Thumbnail
  // app.route('/api/thumbnail').get(fileCtrl.generate);
  // File
  app.route('/api/upload').post(fileCtrl.uploadFile);
  app.route('/api/files').get(fileCtrl.getAll);
  app.route('/api/features/').get(fileCtrl.getFeatures);

  // Users
  app.route('/api/login').post(userCtrl.login);
  app.route('/api/users').get(userCtrl.getAll);
  app.route('/api/users/count').get(userCtrl.count);
  app.route('/api/user').post(userCtrl.insert);
  app.route('/api/user/:_id').get(userCtrl.get);
  app.route('/api/user/:_id').put(userCtrl.update);
  app.route('/api/user/:_id').delete(userCtrl.delete);

  // Agents
  // app.route('/api/agents').get(agentCtrl.getAll);
  // app.route('/api/agents/count').get(agentCtrl.count);
  app.route('/api/agent').post(agentCtrl.insert);
  app.route('/api/agent/:_id').get(agentCtrl.get);
  app.route('/api/agent/:_id').put(agentCtrl.update);
  app.route('/api/agent/:_id').delete(agentCtrl.delete);
  // POST
  app.route('/api/agents').post(agentCtrl.getAll);
  app.route('/api/agents/count').post(agentCtrl.count);

  // Resources
  // app.route('/api/resources').get(resourceCtrl.getAll);
  // app.route('/api/resources/count').get(resourceCtrl.count);
  app.route('/api/resource').post(resourceCtrl.insert);
  app.route('/api/resource/:_id').get(resourceCtrl.get);
  app.route('/api/resource/:_id').put(resourceCtrl.update);
  app.route('/api/resource/:_id').delete(resourceCtrl.delete);
  // POST
  app.route('/api/resources').post(resourceCtrl.getAll);
  app.route('/api/resources/count').post(resourceCtrl.count);

  // Annotations
  // app.route('/api/annotations').get(annotationCtrl.getAll);
  // app.route('/api/annotations/count').get(annotationCtrl.count);
  app.route('/api/annotation').post(annotationCtrl.insert);
  app.route('/api/annotation/:_id').get(annotationCtrl.get);
  app.route('/api/annotation/:_id').put(annotationCtrl.update);
  app.route('/api/annotation/:_id').delete(annotationCtrl.delete);
  // POST
  app.route('/api/annotations').post(annotationCtrl.getAll);
  app.route('/api/annotations/count').post(annotationCtrl.count);

  // Node
  // app.route('/api/nodes').get(nodeCtrl.getAll);
  // app.route('/api/nodes/count').get(nodeCtrl.count);
  app.route('/api/node').post(nodeCtrl.insert);
  app.route('/api/node/:_id').get(nodeCtrl.get);
  app.route('/api/node/:_id').put(nodeCtrl.update);
  app.route('/api/node/:_id').delete(nodeCtrl.delete);
  // POST
  app.route('/api/nodes').post(nodeCtrl.getAll);
  app.route('/api/nodes/count').post(nodeCtrl.count);

  // Link
  app.route('/api/links').get(linkCtrl.getAll);
  app.route('/api/links/count').get(linkCtrl.count);
  app.route('/api/link').post(linkCtrl.insert);
  app.route('/api/link/:_id').get(linkCtrl.get);
  app.route('/api/link/:_id').put(linkCtrl.update);
  app.route('/api/link/:_id').delete(linkCtrl.delete);
  // POST
  app.route('/api/links').post(linkCtrl.getAll);
  app.route('/api/links/count').post(linkCtrl.count);

  // Note
  // app.route('/api/notes').get(noteCtrl.getAll);
  // app.route('/api/notes/count').get(noteCtrl.count);
  app.route('/api/note').post(noteCtrl.insert);
  app.route('/api/note/:_id').get(noteCtrl.get);
  app.route('/api/note/:_id').put(noteCtrl.update);
  app.route('/api/note/:_id').delete(noteCtrl.delete);
  // POST
  app.route('/api/notes').post(noteCtrl.getAll);
  app.route('/api/notes/count').post(noteCtrl.count);
}
