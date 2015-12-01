'use strict';

// Articles controller
angular.module('profile').controller('ProfileController', ['$scope', '$stateParams', '$location', 'Authentication', 'Profiles', 'Socket',
  function ($scope, $stateParams, $location, Authentication, Profiles, Socket) {
    $scope.authentication = Authentication;
    if (!Socket.socket) {
      Socket.connect();
    }

    Socket.on('return delete friend request', function (profileIdToRemove) {
      //code to remove list entry for friend
      if (profileIdToRemove) {
        console.log('received socket call to remove ' + profileIdToRemove + ' from pending friend requests list');
        //$scope.Profile.friends.splice(profileIdToRemove, 1); 
        // var myEl = angular.element( document.querySelector( '#'+profileIdToRemove ) );
        // myEl.remove();
      }
    });

    Socket.on('return friend request pending', function(status) {
      console.log("socket received signal");
      console.log(status);
      if (status === 'alreadysent') {
        $scope.friendReqButton = "waiting";
      }
      if (status === 'success') {
        $scope.friendReqButton = "sent";  
      }
    });

    Socket.on('friend request received', function (fromUser) {
      if (fromUser) console.log("friend request received from",fromUser);
    });

    $scope.deleteFriend = function(friend) {
      Socket.emit('delete friend', friend);
    };

    $scope.ignoreFriendRequest = function(pendingFriendId) {
      Socket.emit('reject friend request', pendingFriendId);
    };

    $scope.acceptFriendRequest = function(pendingFriendId) {
      //console.log(requesterId.profileId);
      Socket.emit('accept friend request', pendingFriendId);
    };

/*
    $scope.getPlayerName = function(id) {
      Socket.emit('get player name', id);
    };

    Socket.on('return player name', function(id, profileName, userName) {
        //change anything with id to profileName
    });

*/
    $scope.inFriendsList = function() {
      //console.log($scope.Profile);
      if (Authentication.user.friends.indexOf($scope.Profile._id) > -1) {
        console.log("YUP!");
        return true;
      } else {
        console.log("NOPE!");
        return false;
      }
    };

    $scope.sendFriendRequestFromProfile = function() {
      // not safe, can server grab url from socket instead?
      Socket.emit('send friend request', $scope.Profile._id);
      /*
          things to check:
            is user the same person?
            is user already friends?
            is user banned/flagged?
            does other friend/user actually exist? (resolve check)
            ?max friend requests?

      */
    };

    // Find existing Article
    $scope.findOne = function () {
      if (!$stateParams.profileId) {
        $stateParams.profileId = Authentication.user._id;
      }
      $scope.Profile = Profiles.get({
        profileId: $stateParams.profileId
      });
      Socket.emit('init profile page',$stateParams.profileId);
      //$stateParams.profileId = $scope.Profile._id;
      //console.log($scope.Profile._id);
      //console.log($stateParams);
      //window.history.pushState("object or string", "Title", "/profile/"+$scope.Profile.profileId);
      //$location.path('/profile/'.concat($scope.Profile.profileId)).reload(false);
      //$location.replace();
      //$location.transitionTo('profile', {q: $scope.Profile._id}, { notify: false });
    };
  }
]);
