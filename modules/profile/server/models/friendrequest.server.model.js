'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Friend Request Schema
 */
var FriendRequestSchema = new Schema({
  created: {
    type: Date,
    default: Date.now
  },
  requestedBy: {
    type: Schema.ObjectId,
    ref: 'User'
  }
});

mongoose.model('friend_request', FriendRequestSchema);
