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
  ended_early: {
    type: Boolean,
    default: true
  },
  drawings: [{
    type: Schema.ObjectId,
    ref: 'Drawing'
  }],
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
