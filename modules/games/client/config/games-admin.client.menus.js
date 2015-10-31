'use strict';

// Configuring the Articles module
angular.module('games.admin').run(['Menus',
  function (Menus) {
    Menus.addSubMenuItem('topbar', 'admin', {
      title: 'Queue Info',
      state: 'admin.queue-info'
    });
    Menus.addSubMenuItem('topbar', 'admin', {
      title: 'Game Rooms Info',
      state: 'admin.game-rooms-info'
    });
  }
]);
