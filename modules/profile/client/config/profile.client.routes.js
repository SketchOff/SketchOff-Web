'use strict';

// Setting up route
angular.module('profiles').config(['$stateProvider',
  function ($stateProvider) {
    // Users state routing
    $stateProvider
      .state('friends', {
        abstract: true,
        url: '/friends',
        template: '<ui-view/>'
      })
      .state('friends.list', {
        url: '/list',
        templateUrl: 'modules/profiles/client/views/friends/list-friends.client.view.html'
      });
  }
]);
