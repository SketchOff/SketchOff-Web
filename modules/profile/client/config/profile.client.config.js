'use strict';

angular.module('profile').run(['Menus',
  function (Menus) {
    // Todo: add actual profile display info
    //      eg. my profile, edit my profile, view for displaying friend profiles

    Menus.addMenuItem('topbar', {
      title: 'My Profile',
      state: "profile.viewMe",
      roles: ['user']   
    });
/*
    Menus.addMenuItem('topbar', {
      title: 'Friends',
      state: 'friends',
      type: 'dropdown',
      roles: ['user']
    });

    Menus.addSubMenuItem('topbar', 'friends', {
      title: 'List Friends',
      state: 'friends.list'
    });
    */
  }
  ]);
