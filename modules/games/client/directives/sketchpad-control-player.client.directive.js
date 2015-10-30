'use strict';

angular.module('games')
  	.directive('drawing-player', function () {
  	return{
  		restrict: "A",
    	link: function(scope, element){
      var ctx = element[0].getContext('2d');
      var ctx2 = element[1].getContext('2d');

      // variable that indicates if in a gamestate where drawing s allowed
      var canDraw = true;
      
      // variable that decides if something should be drawn on mousemove
      var drawing = false;
      
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
      			clientID:0,
      			diffTool:tool, 
      			toolData:[tdata]
      		}
      	};
      }

      // Pushes toolData (for tooltypes in an array) into socket data
      function socketPushToolData(data) {
      	socketQueue.data.toolData.push(data);
      }
        
     	////////////////////////
    	// START DOWN TOOLS   //
    	////////////////////////
    	    
    	function drawDownDot(downX, downY, color, thick) {
    		console.log('mousedown at ' + downX + ',' + downY);

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
    		context.lineWidth = thick;
    		context.stroke();
    	}
    }
  };
 });