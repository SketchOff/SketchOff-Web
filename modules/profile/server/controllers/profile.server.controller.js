'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  friend_request = mongoose.model('friend_request'),
  // Article = mongoose.model('Article'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));




/**
 * Show the current article
 */
exports.read = function (req, res) {
  res.json(req.Profile);
};

// exports.friendRequest = function(req,res) {
//   console.log("FRIEND REQUEST CALLED");
// };

export function isUserFriend(profileId, userId, callback) {

  var user = User.findOne( { '_id': userId });
  user.select('friends');
  user.exec(function(err, u) {
    if (err) {console.log('isuserFriend broke', err); return false; }
    for (var i = 0, len = u.friends.length; i < len; i++) {
      if (String(u.friends[i]._id) === profileId) {
        callback(true);
      }
    }
    callback(false);
  });

  //profile.select('pendingFriendRequests friends');
/*
  user.exec(function(err,u) {
    if (err) { console.log('something broke', err); return; }
    //console.log(u.pendingFriendRequests);
    //console.log(u.friends);
  });
*/

}

export function createFriends(profileId, userId) {
  // check to make sure either profile or user isUserPendingFriendRequest;
  isUserPendingFriendRequest(profileId, userId, function (isPendingRequest) {
    if (isPendingRequest) {
      var profile = User.findOne( {'_id': profileId});
      var user = User.findOne( {'_id': userId});
      profile.select('pendingFriendRequests friends');
      user.select('pendingFriendRequests friends');
      profile.friends.push(user);
      user.friends.push(profile);
      profile.pendingFriendRequests.pull( { requestedBy: userId});
      user.pendingFriendRequests.pull( { requestedBy: profileId});
      profile.save(function(err) {
        if (err) { console.log('save broke createfriends'); return; }
      });
      user.save(function(err) {
        if (err) { console.log('save broke createfriends'); return; }
      });
    }
  });
}

export function isUserPendingFriendRequest(profileId, userId, callback) {
  var profile = User.findOne( { '_id': profileId});
  profile.select('pendingFriendRequests');
  profile.exec(function(err,p) {
    if (err) { console.log('something broke', err); return false; }
    for(var i = 0, len = p.pendingFriendRequests.length; i < len; i++) {
        if (String(p.pendingFriendRequests[i].requestedBy) === userId) {
          callback(true);
        }
    }
    callback(false);
  });
}

export function createFriendRequest(profileId, userId, callback) {
  var profile = User.findOne( { '_id': profileId });
  profile.select('pendingFriendRequests');
  profile.pendingFriendRequests.push({ 'requestedBy': userId });
  profile.save(function (err) {
    if (err) { callback(false); return; }
    else { callback(true); }
  });
}

export function getPlayerName(profileId, callback) {
  var playerName = User.findOne( { '_id' : profileId });
  playerName.select('displayName');

  playerName.exec(function(err, p) {
    if (err) { console.log('something broke', err); return false;}
    callback(String(p.displayName));
  });
}

export function friendRequest(profileId, userId) {

  // profile/userid scanning
  // if (profileId === userId) {
  //   console.log("Cannot add self as friend");
  // }
  //console.log(profileId);
  //console.log(userId);
  //  TODO: more userId/profileId validation checking ):

  var req = new friend_request({ requestedBy: userId});
  //var user = User.findbyId(profileId);
  console.log('1');
  isUserPendingFriendRequest(profileId, userId, function(foundinPendingRequests) {
    if (foundinPendingRequests) {
      console.log('Already sent friend request');
    } else {
      console.log('3');
      isUserFriend(profileId, userId, function(foundinFriends) {
        console.log('4');
        if (foundinFriends) {
          console.log('Already friends with other');
        } else {
          console.log('5');
          createFriendRequest(profileId, userId, function(success) {
            if (success) console.log('Friend request submitted');
            else console.log('Friend request failed');
          });
        }
      });
    }
  });
/*
   User.findById(profileId).populate('user', 'displayName').exec(function (err, user) {
    if (err) {
      console.log(err);
      return;
    } else if (!user) {
      console.log("User DNE");
      return;
    }
    
    if (user.pendingFriendRequests.findById.populate('requester', 'displayName').exec (function (err, requester) {

    }))
    user.pendingFriendRequests.push(req);
    user.save(function (err) {
      console.log(err);
    })
    //next();
  });
*/
  //console.log(user);
  // console.log(req);
  // console.log(typeof(profileId));
  // console.log(typeof(userId));

  //console.log(User.findbyId(profileId));
  // User.findbyId(profileId).pendingFriendRequests.push({ requestedBy: userId });

  /*var req = new friend_request({ requestedBy: userId });
  User.findbyId(profileId).pendingFriendRequests

  
  parent.children[0].name = 'Matthew';
  parent.save(callback);
  */
}

/**
 * List of Articles
 
exports.list = function (req, res) {
  Article.find().sort('-created').populate('user', 'displayName').exec(function (err, articles) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(articles);
    }
  });
};

*/


/**
 * Profile middleware
 */
exports.profileByID = function (req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Profile is invalid'
    });
  }

  User.findById(id).populate('user', 'displayName').exec(function (err, user) {
    if (err) {
      return next(err);
    } else if (!user) { //  user dne
      return res.status(404).send({
        message: 'No profile with that identifier has been found'
      });
    }
    var strippedUser = {
      _id:user._id,
      displayName:user.displayName,
      username:user.username,
      profileImageURL:user.profileImageURL,
      firstName:user.firstName,
      lastName:user.lastName,
      email:user.email,
      friends:user.friends,
      created:user.created,
      provider:user.provider,
      same:false
    };
    if (String(req.user._id) === id) {
      strippedUser.pendingFriendRequests = user.pendingFriendRequests;
      strippedUser.roles = user.roles;
      strippedUser.same = true;
    }
    req.Profile = strippedUser;
    next();
  });
};
