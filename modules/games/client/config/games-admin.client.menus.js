'use strict';

// Configuring the Articles module
angular.module('games.admin').run(['Menus',
  function (Menus) {
    Menus.addSubMenuItem('topbar', 'admin', {
      title: 'Queue Rooms Info',
      state: 'admin.queue-rooms-info'
    });
  }
]);
