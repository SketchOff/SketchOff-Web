'use strict';

angular.module('games')
.directive('drawingPlayer', ['Socket', function (Socket) {
	return{
		restrict: "A",
		link: function(scope, element){
    	//console.log(element);
    	var ctx = element[0].getContext('2d');

      // var ctx2 = element[1].getContext('2d');

      // variable that indicates if in a gamestate where drawing is allowed
      var canDraw = false;
      
      // variable that decides if something should be drawn on mousemove
      var drawing = false;

      var cID = scope.getUserID();

      // the last coordinates before the current move
      var lastX;
      var lastY;
      
      // anchor coordinates for click
      var anchorX;
      var anchorY;

      // temp variables representing current xy coord
      var currentX;
      var currentY;

      // Tool data
      var socketQueue= [];

      // Tool enum:
      // 0 dot (line)
      // 1 line (2 point)
      // 2 eraser

      var activeTool = 0;
      var toolSize = 5;
      var toolColor = "#000000"; // filler

      // On mousedown, gather all information that would be relevant for any kind of tool used.
      element.bind('mousedown', function(event){
      	canDraw = !scope.amJudge();

      	anchorX = event.offsetX;
      	anchorY = event.offsetY;

      	lastX = event.offsetX;
      	lastY = event.offsetY;

      	currentX = event.offsetX;
      	currentY = event.offsetY;

      	if(canDraw) {

	        // Switch behavior based on active tool
	        // Determine correct socket data format (with socketPopulateDown) now.
	        switch(activeTool) {
	        	case 0:
	        	socketPopulateDown(0, [currentX, currentY, toolColor, toolSize]);
	        	drawDownDot(event.currentX, event.currentY, toolColor, toolSize);
	        	break;
	        	case 1:
	        	break;
	        	default:
	        	console.log('ERROR: No tool selected on mouseMove or invalid tool id: ' +activeTool);

	        }

	        drawing = true;
	    }
	});

      element.bind('mousemove', function(event){
      	// Update needed variables
      	currentX = event.offsetX;
      	currentY = event.offsetY;

      	if(drawing){

        // Switch behavior based on active tool
        // Update socketQueue if needed by tool
        switch(activeTool) {
        	case 0:
        	socketPushToolData([
        		currentX, currentY, toolColor, toolSize
        		]);
        	drawMoveDot(currentX, currentY, lastX, lastY, toolColor, toolSize);
        	break;
        	case 1:
        	break;
        	default:
        	console.log('ERROR: No tool selected on mouseMove or invalid tool id: ' +activeTool);
        }

    }

    lastX = event.offsetX;
    lastY = event.offsetY;
});

      element.bind('mouseup', function(event){
      	// TODO: For non-array tools, add 2nd data point
      	// TODO: BROADCAST EVENT via socket

      	if(drawing){
      		switch(activeTool) {
      			case 0:
      			socketPushToolData([
      				currentX, currentY, toolColor, toolSize
      				]);
      			drawUpDot(currentX, currentY, lastX, lastY, toolColor, toolSize);
      			socketSendMessage();
      			break;
      			case 1:
      			break;
      			default:
      			console.log('ERROR: No tool selected on mouseMove or invalid tool id: ' +activeTool);
      		}

      	}

        // stop drawing
        drawing = false;
    });

      function flushSocketQueueData() {
      	socketQueue = [];
      }

      // TODO: CLIENT IDS FOR >1 SKETCHPAD
      // Socket mouseDown behavior if drawing. Fills socketQueue with an initial tool format
      function socketPopulateDown(tool, tdata) {
      	socketQueue = {
      		sType:'pDiff',
      		data: {
      			clientID: cID,
      			diffTool:tool, 
      			toolData:[tdata]
      		}
      	};
      }

      // Pushes toolData (for tooltypes in an array) into socket data
      function socketPushToolData(data) {
      	socketQueue.data.toolData.push(data);
      }

      // Sends socket message
      function socketSendMessage() {
      	console.log('Attempting to send socketQueue ' + JSON.stringify(socketQueue));

      	scope.broadcastCanvasData(socketQueue);
      	// TODO: Implement
      	flushSocketQueueData();
      }

      // Sends sync image
      function socketSendSync() {
      	socketQueue = {
      		sType:'pSync',
      		data:{
      			clientID: cID, //TODO:
      			imageData: ''
      		}
      	};
      	// convert b64 image
      	var dt = element[0].toDataURL('image/png');
      	socketQueue.data.imageData = dt;

      	// send data
      	socketSendMessage();
      }

      	// On recieved S2P_pDiff, if you are the judge, display the canvas wrt to id
      	Socket.on('CLIENT_S2P_pDiff', function(data) {
      		console.log('client_s2p_pdiff received');

      		if(!canDraw) {
      			judgepDiff(data);
      		}
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