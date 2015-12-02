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
  },
  game_id: {
    type: String,
    required: 'Game must have an id'
  },
  early_end: {
    type: String,
    default: ''
  }
});

mongoose.model('Game', GameSchema);
