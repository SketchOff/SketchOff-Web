'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    path = require('path');


/**
 * Drawing Schema
 */
var DrawingSchema = new Schema({
    created: {
        type: Date,
        default: Date.now
    },
    author: {
        type: Schema.ObjectId,
        ref: 'User'
    },
    fileLocation: {
        type: String
    }

});

mongoose.model('Drawing', DrawingSchema);
