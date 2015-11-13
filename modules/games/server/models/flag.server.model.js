'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Flag Schema
 */
var FlagSchema = new Schema({
  created: {
    type: Date,
    default: Date.now
  },
  /* schema value removed: user, type schema.objectid, ref 'User' */
  reason: {
    type: String,
    enum: ['aborted']
  }
});

mongoose.model('Flag', FlagSchema);
