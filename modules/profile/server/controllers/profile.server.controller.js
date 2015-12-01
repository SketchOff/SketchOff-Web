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

export function userExists() {} // not sure if I want to use this.

export function isUserFriend(profileId, userId, callback) {

  var user = User.findOne( { '_id': userId });
  user.select('friends');
  user.exec(function(err, u) {
    if (err) {console.log('isuserFriend(): failure to execute mongoose query.', err); return false; }
    if (u.friends.length === 0) {
      callback(false);
    }
    for (var i = 0, len = u.friends.length; i < len; i++) {
      if (String(u.friends[i]._id) === profileId) {
        callback(true);
      } else if (i === len-1) {
        callback(false);
      }
    }
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

  isUserPendingFriendRequest(userId, profileId, function (isPendingRequest) {
    if (isPendingRequest) {
      var frUser= new User( {'_id': userId});
      var frProfile = new User( {'_id': profileId});
      var conFindUser = { '_id': frUser._id },
          conFindProfile = { '_id': frProfile._id },
          addUserAsFriend = { $push: {'friends': frUser._id } },
      //update = { $push: {'pendingFriendRequests': { 'requestedBy': userId}}},
          addProfileAsFriend = { $push: {'friends': frProfile._id } },
          removeProfileFriendRequest = { $pull: {'pendingFriendRequests': { 'requestedBy': frProfile._id}}},
          removeUserFriendRequest = { $pull: {'pendingFriendRequests': { 'requestedBy': frUser._id}}},
          options = {};

      User.update(conFindUser, addProfileAsFriend, options, function(err, numAffected) {
        if (err) { console.log('createFriends():update db for addProfileAsFriend broke.', err); return false;}
        console.log('Find user, add profile as friend ');
        console.log(numAffected);
      });

      User.update(conFindProfile, addUserAsFriend, options, function(err, numAffected) {
        if (err) { console.log('createFriends():update db for addUserAsFriend broke.', err); return false;}
        console.log('Find profile, add user as friend ');
        console.log(numAffected);
      });

      User.update(conFindUser, removeProfileFriendRequest, options, function(err, numAffected) {
        if (err) { console.log('createFriends():update db for addUserAsFriend broke.', err); return false;}
        console.log('Find user, remove profile from friend requests ');
        console.log(numAffected);
      });

      isUserPendingFriendRequest(profileId, userId, function(otherHasFriendRequestFromMe) {
        if (otherHasFriendRequestFromMe) {
          User.update(conFindProfile, removeUserFriendRequest, options, function(err, numAffected) {
            if (err) { console.log('createFriends():update db for addUserAsFriend broke.', err); return false;}
            console.log('Find profile, remove user from friend requests ');
            console.log(numAffected);
          });
        }
      });
    }
  });
}

export function isUserPendingFriendRequest(selectedUserId, fromUserId, callback) {
  var profile = User.findOne( { '_id': selectedUserId});
  profile.select('pendingFriendRequests');
  profile.exec(function(err,p) {
    if (err) { console.log('isUserPendingFriendRequest(): exec of finding profile ID failed.', err); return false; }
    if (p.pendingFriendRequests.length === 0) {
      callback(false);
    }
    for(var i = 0, len = p.pendingFriendRequests.length; i < len; i++) {
        if (String(p.pendingFriendRequests[i].requestedBy) === fromUserId) {
          callback(true);
        } else if (i === len-1) {
          callback(false);
        }
    }
  });
}

export function createFriendRequest(profileId, userId, callback) {
  
  /*var profile = User.findOne( { '_id': profileId });
  profile.select('pendingFriendRequests');
  profile.push({ requestedBy: userId });
  profile.save(function (err) {
    if (err) { callback(false); return; }
    else { callback(true); }
  });
  */

  var req = new friend_request({ 'requestedBy': userId});
  var condition = { _id: profileId },
      update = { $push: {'pendingFriendRequests': req}},
      options = {};

      User.update(condition, update, options, function(err, numAffected) {
        if (err) { console.log('createFriendRequest(): update of pushing friend request to profile failed.', err); return false;}
        console.log(numAffected);
        callback(true);
      });
}

/*
export function getDisplayName(profileId, callback) {
  var playerName = User.findOne( { '_id' : profileId });
  playerName.select('displayName');

  playerName.exec(function(err, p) {
    if (err) { console.log('getPlayerName(): mongoose query failed to execute.', err); return false;}
    callback(String(p.displayName));
  });
}
*/


export function friendRequest(toProfileId, fromUserId) {

  // profile/userid scanning
  // if (profileId === fromUserId) {
  //   console.log("Cannot add self as friend");
  // }
  //console.log(toProfileId);
  //console.log(fromUserId);
  //  TODO: more userId/profileId validation checking ):

  var req = new friend_request({ requestedBy: fromUserId});
  //var user = User.findbyId(profileId);
  console.log('1');
  isUserPendingFriendRequest(toProfileId, fromUserId, function(foundinPendingRequests) {
    if (foundinPendingRequests) {
      console.log('Already sent friend request');
      return;
    } else {
      console.log('3');
      isUserFriend(toProfileId, fromUserId, function(foundinFriends) {
        console.log('4');
        if (foundinFriends) {
          console.log('Already friends with other');
          return;
        } else {
          console.log('5');
          createFriendRequest(toProfileId, fromUserId, function(success) {
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
//get display name, and user name?
export function getDisplayUserName(userId, callback) {
    if (mongoose.Types.ObjectId.isValid(userId)) {
      User.findById(userId, function (err, user) {
        if (err) {console.log('getDisplayUserName(): mongoose query failed'); return;}
        callback(user.displayName, user.username);
      });
    }
} 

/**
 * Profile middleware
 */

//  Check if username (uname) exists, if so, return user._id for that user, otherwise
//  return -1.
export function getIdFromUsername(uname, callback) {
      User.findOne({username: uname}, function (err, user) {
        if (err) {console.log('getIdFromUsername(): mongoose query failed'); return;}
        if (user)
          callback(user._id);
        else
          callback(-1);
      });
}
export function profileByIDHelper(req, res, next, id) {

  //console.log(id);
  var query = User.findById(id);

  var profileSameAsUser = false;
  var userFieldsToPopulate = '_id displayName username profileImageURL firstName lastName email friends created provider';

  if (String(req.user._id) === id) {
    userFieldsToPopulate += ' pendingFriendRequests roles';
    profileSameAsUser = true;
  }

  query.select(userFieldsToPopulate);
  query.populate({
    path:'friends',
    select: '_id username displayName'
  });

  query.populate({
    path : 'pendingFriendRequests.requestedBy', 
    select : '_id username displayName'
  });
  query.lean().exec(function (err, user) {
      if (err) return next(err);
      else if (!user) return res.status(404).send({ message: 'No profile with that identifier has been found' });

      user.isProfileUser = profileSameAsUser;
      req.Profile = user;
      next();
    });
}


exports.profileByID = function (req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {   //  If id is not valid
    if (/^[a-z0-9_!@#$%&*]+$/i.test(id)) {      //  check if it fits username specifications
      
      getIdFromUsername(id, function(userId) {
        if (userId !== -1) {
          //res.location('/api/profile/'.concat(String(userId)));
          
          profileByIDHelper(req, res, next, String(userId));
          //console.log(res);
        } else {
          return res.status(400).send({message: 'Profile is invalid'});
        }
      });

    } else {
      return res.status(400).send({ message: 'Profile is invalid' });
    }
  } else {
    profileByIDHelper(req, res, next, id);
  }
};

