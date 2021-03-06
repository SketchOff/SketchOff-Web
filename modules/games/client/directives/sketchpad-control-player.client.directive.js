'use strict';

angular.module('games')
.directive('drawingPlayer', ['Socket', function (Socket) {
	return{
		restrict: "A",
		link: function(scope, element){
    	// console.log(element);
      // console.log(element.children()[0].style);
      // console.log(window.getComputedStyle(element.children()[0], null).marginLeft);

      var canvas = element[0];

    	var ctx = canvas.getContext('2d');

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
      var socketQueue = [];

      // Tool enum:
      // 0 dot (line)
      // 1 line (2 point)
      // 2 eraser

      // On mousedown, gather all information that would be relevant for any kind of tool used.
      element.bind('mousedown', function(event){

        // console.log(event);
      	// canDraw = !scope.amJudge();
        var bb = canvas.getBoundingClientRect();

        /*
      	anchorX = event.offsetX;
      	anchorY = event.offsetY;

      	lastX = event.offsetX;
      	lastY = event.offsetY;

      	currentX = event.offsetX;
      	currentY = event.offsetY;
        */

        anchorX = event.clientX-bb.left;
        anchorY = event.clientY-bb.top;

        lastX = event.clientX-bb.left;
        lastY = event.clientY-bb.top;

        currentX = event.clientX-bb.left;
        currentY = event.clientY-bb.top;

        if(currentX < 0 || currentX > 640 || currentY < 0 || currentY > 480) {
          return;
        }

      	if(canDraw) {
          savePrevState();
	        // Switch behavior based on active tool
	        // Determine correct socket data format (with socketPopulateDown) now.
	        switch(scope.playerVars.activeTool) {
	        	case 0:
  	        	socketPopulateDown(0, [currentX, currentY, scope.playerVars.toolColor, scope.playerVars.toolSize]);
  	        	drawDownDot(currentX, currentY, scope.playerVars.toolColor, scope.playerVars.toolSize);
  	        	break;
	        	case 1:
              socketPopulateDown(1, [currentX, currentY, scope.playerVars.toolColor, scope.playerVars.toolSize]);
	        	  drawLineDown(currentX, currentY, scope.playerVars.toolColor, scope.playerVars.toolSize);
              break;
	        	case 2:
              socketPopulateDown(2, [currentX, currentY, scope.playerVars.toolColor, scope.playerVars.toolSize]);
              drawEraseDown(currentX, currentY, scope.playerVars.toolColor, scope.playerVars.toolSize);
              break;
	        	default:
            console.log('ERROR: No tool selected on mouseMove or invalid tool id: ' +scope.playerVars.activeTool);
	        }

	        drawing = true;
	      }
    	});

      element.bind('mousemove', function(event){
        var bb = canvas.getBoundingClientRect();

        currentX = event.clientX-bb.left;
        currentY = event.clientY-bb.top;

      	// Update needed variables
      	// currentX = event.offsetX;
      	// currentY = event.offsetY;

      	if(drawing){
          // Switch behavior based on active tool
          // Update socketQueue if needed by tool
          switch(scope.playerVars.activeTool) {
          	case 0:
            	socketPushToolData([
            		currentX, currentY, scope.playerVars.toolColor, scope.playerVars.toolSize
            		]);
            	drawMoveDot(currentX, currentY, lastX, lastY, scope.playerVars.toolColor, scope.playerVars.toolSize);
          	  break;
          	case 1:
              // drawMoveLine(currentX, currentY, anchorX, anchorY, scope.playerVars.toolColor, scope.playerVars.toolSize);
          	  break;
            case 2:
              socketPushToolData([
                currentX, currentY, scope.playerVars.toolColor, scope.playerVars.toolSize
                ]);
              drawMoveErase(currentX, currentY, lastX, lastY, scope.playerVars.toolColor, scope.playerVars.toolSize);
              break;
          	default:
          	  console.log('ERROR: No tool selected on mouseMove or invalid tool id: ' +scope.playerVars.activeTool);
          }
        }

        lastX = event.clientX-bb.left;
        lastY = event.clientY-bb.top;

        /*
        lastX = event.offsetX;
        lastY = event.offsetY;*/
      });

      element.bind('mouseup', function(event){
      	// TODO: For non-array tools, add 2nd data point
      	// TODO: BROADCAST EVENT via socket

      	if(drawing){
      		switch(scope.playerVars.activeTool) {
      			case 0:
        			socketPushToolData([
        				currentX, currentY, scope.playerVars.toolColor, scope.playerVars.toolSize
        				]);
        			drawUpDot(currentX, currentY, lastX, lastY, scope.playerVars.toolColor, scope.playerVars.toolSize);
      			  break;
      			case 1:
              socketPushToolData([
                currentX, currentY, anchorX, anchorY, scope.playerVars.toolColor, scope.playerVars.toolSize
              ]);
              drawUpLine(currentX, currentY, anchorX, anchorY, scope.playerVars.toolColor, scope.playerVars.toolSize);
              break;
            case 2:
              socketPushToolData([
                currentX, currentY, scope.playerVars.toolColor, scope.playerVars.toolSize
                ]);
              drawUpErase(currentX, currentY, lastX, lastY, scope.playerVars.toolColor, scope.playerVars.toolSize);
              break;
      			default:
      			  console.log('ERROR: No tool selected on mouseMove or invalid tool id: ' +scope.playerVars.activeTool);
      		}
          // send socket data
          socketSendMessage();

          // ensure state manager has canvas ref
          if(scope.clientImageStates.canvas === null) {
            scope.clientImageStates.canvas = canvas;
          }

          // write state to undomanager
          writeUndoState();
      	}
        // stop drawing
        drawing = false;
      });

      // Saves previous state
      function savePrevState() {
        var dt = canvas.toDataURL('image/png');
        if(scope.clientImageStates.uStates.length < scope.MAX_UNDO_STATES) {
          scope.clientImageStates.uStates.push(dt);
        }
        else {
          // console.log('had to shift');
          scope.clientImageStates.uStates.shift();
          scope.clientImageStates.uStates.push(dt);
        }
      }

      function writeUndoState() {
        var dt = canvas.toDataURL('image/png');
        scope.clientImageStates.cState = dt;
        scope.clientImageStates.rStates = [];
      }

      Socket.on('ESTABLISHING', function() {
        ctx.clearRect(0,0,640,480);
      });

      // Allow drawing state
      Socket.on('DRAWING', function() {
        ctx.clearRect(0,0,640,480);
        canDraw = true;
        canvas.style.border = '1px solid black';
        scope.clientImageStates.uStates = [];
        scope.virtualCanvases.vc = canvas;
      });

      // Disallow drawing state
      Socket.on('SELECTING_WINNER', function() {
        canDraw = false;
        canvas.style.border = '1px solid red';
        socketSendSync();
      });

      function flushSocketQueueData() {
      	socketQueue = [];
      }

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
      	// console.log('Attempting to send socketQueue ' + JSON.stringify(socketQueue));

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
      	var dt = canvas.toDataURL('image/png');
      	socketQueue.data.imageData = dt;

      	// send data
      	socketSendMessage();
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

      function drawLineDown(downX, downY, color, thick) {
        drawDownDot(downX, downY, color, thick);
      }

      function drawEraseDown(downX, downY, color, thick) {
        ctx.clearRect(downX-thick, downY-thick, 2*thick, 2*thick);
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

      function drawMoveErase(currentX, currentY, lastX, lastY, toolColor, toolSize) {
        var tslopey = lastY - currentY;
        var tslopex = lastX - currentX;

        // Interpolate - validate this
        if(tslopex === 0) {
          ctx.clearRect(lastX-toolSize, lastY-toolSize, toolSize*2, Math.abs(tslopey) + 2*toolSize);
        }
        else {
          var slope = tslopey/tslopex;
          for(var i=0; i<Math.abs(tslopex); i++) {
            ctx.clearRect(lastX-toolSize+i, lastY-toolSize+i*slope, toolSize*2, toolSize*2);
          }
        }
      }

    	////////////////////////
    	// START UP TOOLS   //
    	////////////////////////

    	function drawUpDot(currentX, currentY, lastX, lastY, toolColor, toolSize) {
    		drawDownDot(currentX, currentY, toolColor, toolSize);
    	}

      function drawUpLine(currentX, currentY, anchorX, anchorY, toolColor, toolSize) {
        // ctxtemp.clearRect(0,0,640,480);
        twoPointLine(ctx, anchorX, anchorY, currentX, currentY, toolColor, toolSize);
        drawDownDot(currentX, currentY, toolColor, toolSize);
      }

      function drawUpErase(currentX, currentY, lastX, lastY, toolColor, toolSize) {
        drawEraseDown(currentX, currentY, toolColor, toolSize); 
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