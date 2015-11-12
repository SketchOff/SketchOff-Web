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
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  reason: {
    type: String,
    enum: ['aborted']
  }
});

mongoose.model('Flag', FlagSchema);
