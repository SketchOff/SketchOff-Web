'use strict';

// Sketchpad [large blob] controller
angular.module('games').controller('SketchpadController', ['$scope', 'Authentication', 'Socket'
  function ($scope, $stateParams, $location, Authentication, Socket) {
    $scope.authentication = Authentication;
    $scope.messageQ = [];

    $scope.canvas = ''; // TODO: WTF DO I DO
    $scope.currentTool = '';

    // General click handler? This literally breaks how I wanted to do tool.
    $scope.handleClick = function(event) {
    	$scope.mouseX = event.pageX;
    	$scope.mouseY = event.pageY;
    	$scope.mouseTool = $scope.currentTool;
    }

    // Connect Socket if not connected
    if (!Socket.socket) {
    	Socket.connect();
    }
   
    // Add master event listener for draw events
    Socket.on('spMessage', function (data) {
    	$scope.messageQ.unshift(data);
    });

    // Method for sending data
    $scope.sendMessage = function() {
    	var spData = {
    		data: this.spData; // SEE DESIGN DOC 4.2.2
    	}

    	// TODO: Validate data

    	Socket.emit('spMessage', spData);

    	// Clear data queue
    	this.spData = '';
    };

    $scope.$on('$destroy', function() {
    	Socket.removeListener('spMessage');
    });

    $scope.logMessage = function(data) {
    	$scope.log.push(data);
    };
  }
]);
