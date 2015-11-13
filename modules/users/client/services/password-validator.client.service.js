'use strict';


// PasswordValidator service used for testing the password strength
angular.module('users').factory('PasswordValidator', ['$window',
  function ($window) {


      var owaspPasswordStrengthTest = $window.owaspPasswordStrengthTest;
      owaspPasswordStrengthTest.config({
          allowPassphrases       : true,
          maxLength              : 128,
          minLength              : 6,
          minPhraseLength        : 20,
          minOptionalTestsToPass : 0,
      }); // doesnt work...

    return {
      getResult: function (password) {
        var result = owaspPasswordStrengthTest.test(password);
        return result;
      },
      getPopoverMsg: function () {
        var popoverMsg = 'Please enter a passphrase or password with greater than 6 characters.';
        return popoverMsg;
      }
    };
  }
]);
