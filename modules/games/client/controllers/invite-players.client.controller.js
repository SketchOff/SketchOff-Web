'use strict';

angular.module('games').controller('InvitePlayersCtrl', ['$scope', 'Authentication', '$modalInstance', 'Socket',
    function($scope, Authentication, $modalInstance, Socket) {
        // This provides Authentication context.
        $scope.authentication = Authentication;

        $scope.Test =  [{player:"HelloFam"}, {player:"Isketch"}, {player:"DrawSomething?"}, {player:"moreuselessnames"}, {player:"n0thing"}, {player:"flusha"}, {player:"hiko"}, {player:"pashaBiceps"}, {player:"bot allu"}, {player:"JWonderchild"}];

	$scope.totalItems = $scope.Test.length;
	$scope.currentPage = 1;
	$scope.numPerPage = 5;

	$scope.paginate = function(value) {
	    var begin, end, index;
	    begin = ($scope.currentPage - 1) * $scope.numPerPage;
	    end = begin + $scope.numPerPage;
	    index = $scope.Test.indexOf(value);
	    return (begin <= index && index < end);
  	};



        $scope.cancel = function() {
           $modalInstance.dismiss('cancel');
        };

        $scope.invite = function() {
            // $timeout(function() {
            //     modalInstance.close();
            // }, 3000);
        };



    }
]);


