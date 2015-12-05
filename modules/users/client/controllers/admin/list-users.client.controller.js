'use strict';

angular.module('users.admin').controller('UserListController', ['$scope', '$filter', 'Admin',
  function ($scope, $filter, Admin) {
    Admin.query(function (data) {
      $scope.users = data;
      $scope.buildPager();
    });

    $scope.sortBy = {
        "type": "select",
        "name": "Order",
        "value": "Date Created",
        "values": [ "Date Created", "Username", "Roles", "Number Of Flags" ]
    };

    $scope.buildPager = function () {
      $scope.pagedItems = [];
      $scope.itemsPerPage = 15;
      $scope.currentPage = 1;
      $scope.figureOutItemsToDisplay();
    };

    $scope.figureOutItemsToDisplay = function () {
      $scope.filteredItems = $filter('filter')($scope.users, {
        $: $scope.search
      });
      if($scope.flagChecked === 'YES'){
        $scope.filteredItems = $filter('filter')($scope.filteredItems, function(item) {
          return item.flags.length > 0;
        }, true);
      }
      if($scope.sortBy.value){
         switch ($scope.sortBy.value) {
           case "Username":
              $scope.filteredItems = $filter('orderBy')($scope.filteredItems, 'username');
              break;
           case "Roles":
              $scope.filteredItems = $filter('orderBy')($scope.filteredItems, function(item) {
                 return item.roles.toString();
              }, true);
              break;
           case "Number Of Flags":
              $scope.filteredItems = $filter('orderBy')($scope.filteredItems, function(item) {
                 return item.flags.length;
              }, true);
              break;
/* scrapping this case for now
           case "Most Recent Flags":
              $scope.filteredItems = $filter('orderBy')($scope.filteredItems, function(item) {
                 return item.flags.created;
              }, true);
              break;
*/
           default:
              $scope.filteredItems = $filter('orderBy')($scope.filteredItems, function(item) {
                 return item.created;
              }, true);
         }
      }
      $scope.filterLength = $scope.filteredItems.length;
      var begin = (($scope.currentPage - 1) * $scope.itemsPerPage);
      var end = begin + $scope.itemsPerPage;
      $scope.pagedItems = $scope.filteredItems.slice(begin, end);
    };

    $scope.pageChanged = function () {
      $scope.figureOutItemsToDisplay();
    };
  }
]);
