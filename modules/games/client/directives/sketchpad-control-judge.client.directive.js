'use strict';

angular.module('games')
.directive('drawingJudge', ['Socket', function (Socket) {
	return{
		restrict: "A",
		link: function(scope, element){
      var ctx = '';

    	// On recieved S2P_pDiff, if you are the judge, display the canvas wrt to id
    	Socket.on('CLIENT_S2P_pDiff', function(data) {
    		console.log('client_s2p_pdiff received');
    	});

    	Socket.on('CLIENT_S2P_pSync', function(data) {
    		console.log('client_s2p_psync received');

          // TODO: implement
      });

    	function judgepDiff(data) {
      	// TODO: Find canvas with correct cID

      	switch(data.diffTool) {
      		case 0:
      		  judgeDiffToolDot(data.toolData);
      		  break;
      		case 1: 
      			// TODO:
      			break;
      		default:
      			console.log('ERROR UNKNOWN TOOL ' + data.diffTool);
      			break;
      		}
      	}

      function judgeDiffToolDot(toolData) {
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

    			ctx.strokeColor = color;
    			ctx.lineWidth = 2*thick;
    			ctx.stroke();
    		}
    	}

     	////////////////////////
    	// START DOWN TOOLS   //
    	////////////////////////

    	function drawDownDot(downX, downY, color, thick) {
    		// console.log('mousedown at ' + downX + ',' + downY);

    		ctx.fillStyle = color;
    		ctx.beginPath();
    		ctx.arc(downX, downY, thick, 0, 2*Math.PI, true);
    		ctx.fill();
    	}

    	////////////////////////
    	// START MOVE TOOLS   //
    	////////////////////////

    	function drawMoveDot(currentX, currentY, lastX, lastY, toolColor, toolSize) {

    		// Draw end point
    		ctx.beginPath();
    		ctx.arc(currentX, currentY, toolSize, 0, 2*Math.PI, true);
    		ctx.fill();

    		// Interpolate
    		twoPointLine(ctx, lastX, lastY, currentX, currentY, toolColor, toolSize);

    	}

    	////////////////////////
    	// START UP TOOLS   //
    	////////////////////////

    	function drawUpDot(currentX, currentY, lastX, lastY, toolColor, toolSize) {
    		drawMoveDot(currentX, currentY, lastX, lastY, toolColor, toolSize);
    	}

    	// Draws a 2 point line in _context_ from _x1, y1_ to _x2, y2_ with _color_ and _thick_.
    	// Takes a context argument in the event shit needs to be drawn on a temp canvas.
    	function twoPointLine(context, x1, y1, x2, y2, color, thick) {
    		context.beginPath();
    		context.moveTo(x1, y1);
    		context.lineTo(x2, y2);

    		context.strokeColor = color;
    		context.lineWidth = 2*thick;
    		context.stroke();
    	}
    }
};
}]);