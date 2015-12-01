'use strict';

angular.module('games')
.directive('drawingPlayerlt', ['Socket', function (Socket) {
	return{
		restrict: "A",
		link: function(scope, element){
    	// console.log(element);
      // console.log(element.children()[0].style);
      // console.log(window.getComputedStyle(element.children()[0], null).marginLeft);

      var ctxtemp = element[0].getContext('2d');
      var canDraw = false;

      var virtualCanvas = null;
      
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

       // On mousedown, gather all information that would be relevant for any kind of tool used.
      element.bind('mousedown', function(event){

        // console.log(event);
      	// canDraw = !scope.amJudge();

      	anchorX = event.offsetX;
      	anchorY = event.offsetY;

      	lastX = event.offsetX;
      	lastY = event.offsetY;

      	currentX = event.offsetX;
      	currentY = event.offsetY;

        var evt = new MouseEvent('mousedown', {
          clientX: event.clientX,
          clientY: event.clientY,
          offsetX: event.offsetX,
          offsetY: event.offsetY

        });
        virtualCanvas.dispatchEvent(evt);

        /*
        simulate(virtualCanvas, 'mousedown', {
          clientX: event.clientX,
          clientY: event.clientY,
          offsetX: event.offsetX,
          offsetY: event.offsetY
        });*/

        if(currentX < 0 || currentX > 640 || currentY < 0 || currentY > 480) {
          return;
        }

      	if(canDraw) {
	        switch(scope.playerVars.activeTool) {
	        	case 0:
  	        	break;
	        	case 1:
              break;
	        	case 2:
              break;
	        	default:
              console.log('ERROR: No tool selected on mouseMove or invalid tool id: ' +scope.playerVars.activeTool);
	        }

	        drawing = true;
	      }
    	});

      element.bind('mousemove', function(event){
      	// Update needed variables
      	currentX = event.offsetX;
      	currentY = event.offsetY;

        var evt = new MouseEvent('mousemove', {
          clientX: event.clientX,
          clientY: event.clientY,
          offsetX: event.offsetX,
          offsetY: event.offsetY
        });

        virtualCanvas.dispatchEvent(evt);

        /*
        simulate(virtualCanvas, 'mousemove', {
          clientX: event.clientX,
          clientY: event.clientY,
          offsetX: event.offsetX,
          offsetY: event.offsetY
        });*/

      	if(drawing){
          // Switch behavior based on active tool
          // Update socketQueue if needed by tool
          switch(scope.playerVars.activeTool) {
          	case 0:
          	  break;
          	case 1:
              drawMoveLine(currentX, currentY, anchorX, anchorY, scope.playerVars.toolColor, scope.playerVars.toolSize);
          	  break;
            case 2:
              break;
          	default:
          	  console.log('ERROR: No tool selected on mouseMove or invalid tool id: ' +scope.playerVars.activeTool);
          }
        }
        lastX = event.offsetX;
        lastY = event.offsetY;
      });

      element.bind('mouseup', function(event){
        var evt = new MouseEvent('mouseup', {
          clientX: event.clientX,
          clientY: event.clientY,
          offsetX: event.offsetX,
          offsetY: event.offsetY
          
        });
        virtualCanvas.dispatchEvent(evt);

        /*
        simulate(virtualCanvas, 'mouseup', {
          clientX: event.clientX,
          clientY: event.clientY,
          offsetX: event.offsetX,
          offsetY: event.offsetY
        });*/

      	if(drawing){
      		switch(scope.playerVars.activeTool) {
      			case 0:
      			  break;
      			case 1:
              drawUpLine(currentX, currentY, anchorX, anchorY, scope.playerVars.toolColor, scope.playerVars.toolSize);
              break;
            case 2:
              break;
      			default:
      			  console.log('ERROR: No tool selected on mouseMove or invalid tool id: ' +scope.playerVars.activeTool);
      		}
      	}
        // stop drawing
        drawing = false;
      });

      Socket.on('ESTABLISHING', function() {
        ctxtemp.clearRect(0,0,640,480);
      });

      function setVC(destroy) {
        console.log('vc attempted to be applied');
        if(scope.virtualCanvases.vc !== null) {
          console.log('vc attempted hooked');
          virtualCanvas = scope.virtualCanvases.vc;
        }
        else {
          console.log('vc not hooked');
        }
      }

      // Allow drawing state
      Socket.on('DRAWING', function() {
        ctxtemp.clearRect(0,0,640,480);
        canDraw = true;
        // canvas.style.border = '1px solid black';

        var tmpFunction = setTimeout(setVC(), 100);
      });

      // Disallow drawing state
      Socket.on('SELECTING_WINNER', function() {
        canDraw = false;
        // canvas.style.border = '1px solid red';
      });

      function drawMoveLine(currentX, currentY, anchorX, anchorY, toolColor, toolSize) {
        ctxtemp.clearRect(0,0,640,480);
        twoPointLine(ctxtemp, anchorX, anchorY, currentX, currentY, toolColor, toolSize);
        ctxtemp.fillStyle = toolColor;
        ctxtemp.beginPath();
        ctxtemp.arc(currentX, currentY, toolSize, 0, 2*Math.PI, true);
        ctxtemp.fill();
      }

      function drawUpLine(currentX, currentY, anchorX, anchorY, toolColor, toolSize) {
        ctxtemp.clearRect(0,0,640,480);
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

      function simulate(element, eventName) {
        var options = extend(defaultOptions, arguments[2] || {});
        var oEvent, eventType = null;

        for (var name in eventMatchers)
        {
            if (eventMatchers[name].test(eventName)) { eventType = name; break; }
        }

        if (!eventType)
            throw new SyntaxError('Only HTMLEvents and MouseEvents interfaces are supported');

        if (document.createEvent)
        {
            oEvent = document.createEvent(eventType);
            if (eventType === 'HTMLEvents')
            {
                oEvent.initEvent(eventName, options.bubbles, options.cancelable);
            }
            else
            {
                oEvent.initMouseEvent(eventName, options.bubbles, options.cancelable, document.defaultView,
                options.button, options.pointerX, options.pointerY, options.pointerX, options.pointerY,
                options.ctrlKey, options.altKey, options.shiftKey, options.metaKey, options.button, element);
            }
            element.dispatchEvent(oEvent);
        }
        else
        {
            options.clientX = options.pointerX;
            options.clientY = options.pointerY;
            var evt = document.createEventObject();
            oEvent = extend(evt, options);
            element.fireEvent('on' + eventName, oEvent);
        }
        return element;
      }

      function extend(destination, source) {
        for (var property in source)
          destination[property] = source[property];
        return destination;
      }

      var eventMatchers = {
        'HTMLEvents': /^(?:load|unload|abort|error|select|change|submit|reset|focus|blur|resize|scroll)$/,
        'MouseEvents': /^(?:click|dblclick|mouse(?:down|up|over|move|out))$/
      };

      var defaultOptions = {
        clientX: 0,
        clientY: 0,
        offsetX: 0,
        offsetY: 0,
        pointerX: 0,
        pointerY: 0,
        button: 0,
        ctrlKey: false,
        altKey: false,
        shiftKey: false,
        metaKey: false,
        bubbles: true,
        cancelable: true
      };
    }
};
}]);