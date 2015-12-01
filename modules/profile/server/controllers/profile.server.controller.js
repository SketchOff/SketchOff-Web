'use strict';

/**
 * Module dependencies.
 */

var path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  friend_request = mongoose.model('friend_request'),
  // Article = mongoose.model('Article'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  GameRoomManager = require(path.resolve('./modules/games/server/controllers/game_room_manager.server.controller'));



/**
 * Show the current article
 */
exports.read = function (req, res) {
  res.json(req.Profile);
};

// exports.friendRequest = function(req,res) {
//   console.log("FRIEND REQUEST CALLED");
// };

export function deleteFriendship(profileId, userId, io) {
  isUserFriend(userId, profileId, function (userIsFriendOfProfile) {
    if (userIsFriendOfProfile) {
      console.log('delete friendship accessed2');
      var frUser = new User({'_id': userId});
      var frProfile = new User({'_id': profileId});
      var conFindUser = { '_id': frUser._id },
          conFindProfile = { '_id': frProfile._id },
          removeFriendProfile = { $pull: {'friends': frProfile._id}},
          removeFriendUser = { $pull: {'friends': frUser._id}},
          options = {};


          //these can be consolidated into one or two mongoose calls.
      User.update(conFindUser, removeFriendProfile, options, function(err, numAffected) {
        if (err) { console.log('deleteFriendship():update db for removeFriendProfile broke.', err); return false;}
        console.log(numAffected);
      });

      User.update(conFindProfile, removeFriendUser, options, function(err, numAffected) {
        if (err) { console.log('createFriendship():update db for addUserAsFriend broke.', err); return false;}
        console.log(numAffected);
      });
    }
  });
}
export function userExists() {} // not sure if I want to use this.

export function deleteFriendRequest(profileIdPending, userId, io) {

  var frProfile = new User( {'_id': profileIdPending});
  User.update({'_id': userId}, {$pull: {'pendingFriendRequests': { 'requestedBy': frProfile._id}}}, {}, function(err, numAffected) {
    if (err) { console.log('deleteFriendRequest():update db for addProfileAsFriend broke.', err); return false;}
    console.log(numAffected);
  });
  var user = User.findOne({'_id': userId});
  user.update('pendingFriendRequests');
  emitToUserId('return delete friend request', profileIdPending, userId, io);

}

export function emitToUserId(msg, data, userId, io) {
  getDisplayUserName(userId, function(displayname, username) {
    if (username) {
      console.log(username);
      emitToUsername(msg, data, username, io);
    } else {
      console.log("emitToUserId(): Error for username supplied: no username found/supplied");
    }
  });
}
export function emitToUsername(msg, data, username, io) {
  if (username) {
    var currentuser = GameRoomManager.ConnectedPlayers.get(username);
    if (currentuser) io.to(currentuser.socket_id).emit(msg, data);
    else console.log("emitToUsername(): Error finding socket for user: "+username);
  } else console.log("emitToUsername(): Error for username supplied: no username supplied");
  
}

//  Checks if userId is a friend with profileId.
//  true to callback if so, else false to callback
export function isUserFriend(profileId, userId, callback) {

  /*User.findById(userId).populate({path: 'friends', select: '_id username'})

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
User.findOne({'_id': userId});
*/

  var user = User.findOne( { '_id': userId });
  user.select('friends');
  user.exec(function(err, u) {
    if (err) {console.log('isuserFriend(): failure to execute mongoose query.', err); return false; }
    if (u.friends.length === 0) {
      callback(false);
    }
    console.log(u.friends);
    for (var i = 0, len = u.friends.length; i < len; i++) {
      if (String(u.friends[i]) === profileId) {
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


export function createFriendship(profileId, userId) {

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


          //these can be consolidated into one or two mongoose calls.
      User.update(conFindUser, addProfileAsFriend, options, function(err, numAffected) {
        if (err) { console.log('createFriendship():update db for addProfileAsFriend broke.', err); return false;}
        console.log('Find user, add profile as friend ');
        console.log(numAffected);
      });

      User.update(conFindProfile, addUserAsFriend, options, function(err, numAffected) {
        if (err) { console.log('createFriendship():update db for addUserAsFriend broke.', err); return false;}
        console.log('Find profile, add user as friend ');
        console.log(numAffected);
      });

      User.update(conFindUser, removeProfileFriendRequest, options, function(err, numAffected) {
        if (err) { console.log('createFriendship():update db for addUserAsFriend broke.', err); return false;}
        console.log('Find user, remove profile from friend requests ');
        console.log(numAffected);
      });

      isUserPendingFriendRequest(profileId, userId, function(otherHasFriendRequestFromMe) {
        if (otherHasFriendRequestFromMe) {
          User.update(conFindProfile, removeUserFriendRequest, options, function(err, numAffected) {
            if (err) { console.log('createFriendship():update db for addUserAsFriend broke.', err); return false;}
            console.log('Find profile, remove user from friend requests ');
            console.log(numAffected);
          });
        }
      });
    }
  });
}

export function isUserPendingFriendRequest(selectedUserId, fromUserId, callback) {
  var profile;
  //check if ID coming in is of type ObjectId or username
  if (selectedUserId.match(/^[0-9a-fA-F]{24}$/)) {
    profile = User.findOne( { '_id': selectedUserId});
  } else {
    profile = User.findOne( {'username': selectedUserId});
  }
  
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
        callback(true);
      });
}

export function initProfile(toProfileId, fromUserId, io) {
  console.log(toProfileId);
  console.log(fromUserId);
  if (toProfileId && fromUserId) {
  isUserPendingFriendRequest(toProfileId, fromUserId, function(foundinPendingRequests) {
    if (foundinPendingRequests) {
      console.log('Already sent friend request');
      getDisplayUserName(fromUserId, function(display, username) {
        var currentuser = GameRoomManager.ConnectedPlayers.get(username);
        console.log(currentuser);
        io.to(currentuser.socket_id).emit('return friend request pending', 'alreadysent');
      });
      return;
    }
});
}
}

export function friendRequest(toProfileId, fromUserId, io) {

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
      getDisplayUserName(fromUserId, function(display, username) {
        var currentuser = GameRoomManager.ConnectedPlayers.get(username);
        console.log(currentuser);
        io.to(currentuser.socket_id).emit('return friend request pending', 'alreadysent');
      });
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
            if (success) {
              console.log('Friend request submitted');
              getDisplayUserName(fromUserId, function(dname, uname) {
                var fromUser = {
                  _id: fromUserId,
                  username: uname,
                  displayName: dname
                };
                emitToUserId('friend request received', fromUser, toProfileId, io);
                emitToUsername('return friend request pending', 'success', uname, io);
              });
              
            } else {
              console.log('Friend request failed');
            }
          });
        }
      });
    }
  });
}

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
  var userFieldsToPopulate = '_id displayName username profileImageURL firstName lastName email friends created provider xp';

  // if user is loading own profile
  if (String(req.user._id) === id) {
    userFieldsToPopulate += ' pendingFriendRequests roles';
    profileSameAsUser = true;
  }

  query.select(userFieldsToPopulate);
  query.populate({
    path:'friends',
    select: '_id username displayName xp'
  });

  query.populate({
    path : 'pendingFriendRequests.requestedBy', 
    select : '_id username displayName xp'
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

