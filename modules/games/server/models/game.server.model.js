'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Game Schema
 */
var GameSchema = new Schema({
  created: {
    type: Date,
    default: Date.now
  },
  players: [{
    type: Schema.ObjectId,
    ref: 'User'
  }],
  judge: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  winner: {
    type: Schema.ObjectId,
    ref: 'User'
  }
});

mongoose.model('Game', GameSchema);
