'use strict';

// Setting up route
angular.module('sketchpad').config(['$stateProvider',
  function ($stateProvider) {
    // Articles state routing
    $stateProvider
      .state('sketchpad', {
        abstract: true,
        url: '/sketchpad',
        templateUrl: 'modules/sketchpad/client/views/sketchpad.client.player.view.html'
      });
  }
]);
