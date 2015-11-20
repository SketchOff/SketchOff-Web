'use strict';

angular.module('games')
.directive('drawingJudge', ['Socket', function (Socket) {
	return{
		restrict: "A",
		link: function(scope, element){
      var playersArray = [];
      // console.log(element);

      for(var i=0; i<scope.getNumPlayers(); i++) {
        if(scope.getNumPlayers() > 1) {
          alert("yeah unimplemented");
        }
        else {
          playersArray.push(
            {
              ctx:element.children().children()
                .children().children()
                .children()[1].getContext('2d'),
              uid:scope.getPlayer(1)
            }
          );
        }
      }

      console.log(playersArray);

    	// On recieved S2P_pDiff, display the canvas wrt to id
    	Socket.on('CLIENT_S2P_pDiff', function(data) {
    		// console.log('client_s2p_pdiff received');
        judgepDiff(data);
    	});

    	Socket.on('CLIENT_S2P_pSync', function(data) {
    		console.log('client_s2p_psync received');

          // TODO: implement
      });

      function getContextFromID(id) {
        for(var i=0; i<playersArray.length; i++) {
          if(playersArray[i].uid === id) {
            return playersArray[i].ctx;
          }
        }

        console.log("getContextFromID failed");
        console.log("lookupID: " + id);
        console.log("playersArray: " + playersArray);
      }

    	function judgepDiff(data) {
        console.log(data);
        var ctx = getContextFromID(data.clientID);

      	switch(data.diffTool) {
      		case 0:
      		  judgeDiffToolDot(data.toolData, ctx);
      		  break;
      		case 1: 
      			judgeDiffToolLine(data.toolData, ctx);
      			break;
          case 2:
            judgeDiffToolEraser(data.toolData, ctx);
            break;
      		default:
      			console.log('ERROR UNKNOWN TOOL ' + data.diffTool);
      			break;
      		}
      	}

      function judgeDiffToolDot(toolData, ctx) {
    		var cx, cy, lx, ly, color, thick;
    		var temp = toolData.pop();
    		cx = temp[0];
    		cy = temp[1];
    		color = temp[2];
    		thick = temp[3];

    		ctx.fillStyle = color;
    		ctx.beginPath();
    		ctx.arc(cx, cy, thick, 0, 2*Math.PI, true);
    		ctx.fill();

    		while(toolData.length > 0) {
    			lx = cx;
    			ly = cy;
    			temp = toolData.pop();
    			cx = temp[0];
    			cy = temp[1];
    			color = temp[2];
    			thick = temp[3];

    			ctx.beginPath();
    			ctx.arc(cx, cy, thick, 0, 2*Math.PI, true);
    			ctx.fill();

    			ctx.beginPath();
    			ctx.moveTo(lx, ly);
    			ctx.lineTo(cx, cy);

    			ctx.strokeStyle = color;
    			ctx.lineWidth = 2*thick;
    			ctx.stroke();
    		}
    	}

      function judgeDiffToolLine(toolData, ctx) {
        console.log("2pointline called");
        var x1, y1, x2, y2, color, thick;
        var temp = toolData[1];

        x1 = temp[0];
        y1 = temp[1];
        x2 = temp[2];
        y2 = temp[3];
        color = temp[4];
        thick = temp[5];

        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x1, y1, thick, 0, 2*Math.PI, true);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x2, y2, thick, 0, 2*Math.PI, true);
        ctx.fill();

        twoPointLine(ctx, x1, y1, x2, y2, color, thick);
      }

      function judgeDiffToolEraser(toolData, ctx) {
        var cx, cy, lx, ly, color, thick;
        var temp = toolData.pop();
        cx = temp[0];
        cy = temp[1];
        color = temp[2];
        thick = temp[3];

        ctx.clearRect(cx-thick, cy-thick, 2*thick, 2*thick);

        while(toolData.length > 0) {
          lx = cx;
          ly = cy;
          temp = toolData.pop();
          cx = temp[0];
          cy = temp[1];
          color = temp[2];
          thick = temp[3];

          var tslopey = ly - cy;
          var tslopex = lx - cx;

          // Interpolate - validate this
          if(tslopex === 0) {
            ctx.clearRect(lx-thick, ly-thick, thick*2, Math.abs(tslopey) + 2*thick);
          }
          else {
            var slope = tslopey/tslopex;
            for(var i=0; i<Math.abs(tslopex); i++) {
              ctx.clearRect(lx-thick+i, ly-thick+i*slope, thick*2, thick*2);
            }
          }
        }
      }


    	// Draws a 2 point line in _context_ from _x1, y1_ to _x2, y2_ with _color_ and _thick_.
    	// Takes a context argument in the event shit needs to be drawn on a temp canvas.
    	function twoPointLine(context, x1, y1, x2, y2, color, thick) {
    		context.beginPath();
    		context.moveTo(x1, y1);
    		context.lineTo(x2, y2);

    		context.strokeStyle = color;
    		context.lineWidth = 2*thick;
    		context.stroke();
    	}
    }
};
}]);