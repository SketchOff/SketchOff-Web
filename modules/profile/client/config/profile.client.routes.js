'use strict';

// Setting up route
angular.module('profile').config(['$stateProvider',
  function ($stateProvider) {
    // Users state routing
    $stateProvider
      .state('profile', {
        abstract: true,
        url: '/profile',
        template: '<ui-view/>'
      })
      .state('profile.view', {
        url: '/:profileId',
        templateUrl: 'modules/profile/client/views/profile.client.view.html',
        data: {
          roles: ['user', 'admin']
        }
      })
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
