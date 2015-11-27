'use strict';

angular.module('games')
.directive('drawingJudge', ['Socket', function (Socket) {
	return{
		restrict: "A",
		link: function(scope, element){
      var playersArray = [];
      // console.log(element);

      /*
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
      */

      var canvas = element[0];
      var ctx = canvas.getContext('2d');
      var my_cid = element[0].innerHTML;

      var uStates = [];
      var cState = null;
      var rStates = [];
      var MAX_UNDO_STATES = 10;

      // console.log(playersArray);

      Socket.on('ESTABLISHING', function() {
        my_cid = element[0].innerHTML;
      });

    	// On recieved S2P_pDiff, display the canvas wrt to id
    	Socket.on('CLIENT_S2P_pDiff', function(data) {
    		// console.log('client_s2p_pdiff received');
        // console.log(element[0]);
        // console.log(data.clientID, my_cid);
        if(data.clientID === element[0].innerHTML) {
          judgepDiff(data);
        }
    	});

    	Socket.on('CLIENT_S2P_pSync', function(data) {
    		console.log('client_s2p_psync received');
        if(data.clientID === element[0].innerHTML) {

          var ctx = getContextFromID(data.clientID);
          var img = new Image();
          img.src = null;
          img.src = data.imageData;

          ctx.clearRect(0,0,640,480);
          ctx.drawImage(img,0,0);
        }
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
        // console.log(data);
      	switch(data.diffTool) {
      		case 0:
            savePrevState();
      		  judgeDiffToolDot(data.toolData, ctx);
            pushUndoState();
      		  break;
      		case 1: 
            savePrevState();
      			judgeDiffToolLine(data.toolData, ctx);
            pushUndoState();
      			break;
          case 2:
            savePrevState();
            judgeDiffToolEraser(data.toolData, ctx);
            pushUndoState();
            break;
          case 3:
            judgeDiffToolUndo(data.toolData, ctx);
            break;
          case 4:
            judgeDiffToolRedo(data.toolData, ctx);
            break;
      		default:
      			console.log('ERROR UNKNOWN TOOL ' + data.diffTool);
      			break;
      	}
      }

      function savePrevState() {
        var dt = canvas.toDataURL('image/png');
        if(uStates.length < MAX_UNDO_STATES) {
          uStates.push(dt);
        }
        else {
          console.log('had to shift');
          uStates.shift();
          uStates.push(dt);
        }
      }

      function pushUndoState() {
        var dt = canvas.toDataURL('image/png');
        cState = dt;
        rStates = [];
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

      function judgeDiffToolUndo(toolData, ctx) {
        if(uStates.length > 0) {
          var img = new Image(640, 480);
          img.src = "";
          img.onload = function() {
            ctx.clearRect(0,0,640,480);
            ctx.drawImage(img,0,0);
          };
          var dt = uStates.pop();
          img.src = dt;

          rStates.push(cState);
          cState = dt;
        }
      }

      function judgeDiffToolRedo(toolData, ctx) {
        // console.log(rStates);
        if(rStates.length > 0) {
          // console.log('redo successful');
          var img = new Image(640, 480);
          img.src = "";
          img.onload = function() {
            ctx.clearRect(0,0,640,480);
            ctx.drawImage(img,0,0);
          };
          var dt = rStates.pop();
          img.src = dt;
          
          uStates.push(cState);
          cState = dt;
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