'use strict';

angular.module('games')
.directive('drawingSp', ['Socket', function (Socket) {
	return{
		restrict: "A",
		link: function(scope, element){
      var canvas = element.children()[1];
      var ctx = canvas.getContext('2d');

      Socket.on('CLIENT_S2P_pSync', function(data) {
        // console.log('judge client_s2p_psync received ');
        // console.log('clientid ' + data.clientID);
        // console.log('elementid ' + element.children()[1].innerHTML);
        if(data.clientID === element.children()[1].innerHTML) {
          var img = new Image();
          img.src = null;
          img.onload = function() {
            ctx.clearRect(0,0,640,480);
            ctx.drawImage(img,0,0);
          };
          img.src = data.imageData;
        }
        else {
          // console.log("ERROR clientID =/= innerHTML id");
        }
      });

    }
  };
}]);