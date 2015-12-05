'use strict';

// Articles controller
angular.module('profile').controller('ProfileController', ['$scope', '$stateParams', '$location', 'Authentication', 'Profiles', 'Socket',
    function($scope, $stateParams, $location, Authentication, Profiles, Socket) {
        $scope.authentication = Authentication;
        if (!Socket.socket) {
            Socket.connect();
        }

        Socket.on('return friendship delete', function(profileIdToRemove) {
            if (profileIdToRemove && $scope.Profile.isProfileUser) {
                if ($scope.Profile.friends) {
                    for (var i = 0; i < $scope.Profile.friends.length; i++) {
                        if ($scope.Profile.friends[i]._id === profileIdToRemove) {
                            console.log('found it!');
                            break;
                        }
                    }
                    if (i < $scope.Profile.friends.length) {
                        console.log("value of i:", i);
                        $scope.Profile.friends.splice(i, 1);
                    }

                    console.log($scope.Profile);
                    $scope.$apply();
                }
            }
        });

        Socket.on('return delete friend request', function(profileIdToRemove) {
            //code to remove list entry for friend
            if (profileIdToRemove && $scope.Profile.isProfileUser) {
                console.log('received socket call to remove ' + profileIdToRemove + ' from pending friend requests list');
                if ($scope.Profile.pendingFriendRequests) {
                    for (var i = 0; i < $scope.Profile.pendingFriendRequests.length; i++) {
                        if ($scope.Profile.pendingFriendRequests[i].requestedBy._id === profileIdToRemove) {
                            console.log('found it!');
                            break;
                        }
                    }
                    if (i < $scope.Profile.pendingFriendRequests.length) {
                        console.log("value of i:", i);
                        $scope.Profile.pendingFriendRequests.splice(i, 1);
                    }

                    $scope.$apply();
                }
                //$scope.Profile.pendingFriendRequests.splice($scope.Profile.pendingFriendRequests.indexOf())
                // var el = document.getElementById("req_"+profileIdToRemove);
                // el.style.display="none";
                //$document.find('#req_'+profileIdToRemove).style.display = "none";
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

        Socket.on('return friendship create', function(userToBefriend) {
            if (userToBefriend && $scope.Profile.isProfileUser) {
                $scope.Profile.friends.push(userToBefriend);
                $scope.$apply();
            }
        });

        Socket.on('friend request received', function(fromUser) {
            if (fromUser) console.log("friend request received from", fromUser);
            console.log($scope.Profile);
            if (fromUser && $scope.Profile.isProfileUser) {
                $scope.Profile.pendingFriendRequests.push({
                    requestedBy: fromUser
                });
                $scope.$apply();
            }

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
        $scope.findOne = function() {
            if (!$stateParams.profileId) {
                $stateParams.profileId = $scope.authentication.user._id;
            }
            $scope.Profile = Profiles.get({
                profileId: $stateParams.profileId
            });
            Socket.emit('init profile page', $stateParams.profileId);
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
