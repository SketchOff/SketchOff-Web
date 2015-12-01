'use strict';

angular.module('games')
.directive('drawingSp', ['Socket', function (Socket) {
	return{
		restrict: "A",
		link: function(scope, element){
      var canvas = element.children()[1];
      var ctx = canvas.getContext('2d');

    	Socket.on('CLIENT_S2P_pSync', function(data) {
    		console.log('syncplayer client_s2p_psync received');
        if(data.clientID === element.children()[1].innerHTML) {
          var img = new Image();
          img.src = null;
          img.src = data.imageData;

          ctx.clearRect(0,0,640,480);
          ctx.drawImage(img,0,0);
        }
        else {
          console.log("ERROR clientID =/= innerHTML id");
        }
      });

    }
  };
}]);