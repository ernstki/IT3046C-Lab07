/*
 * script.js for Prof. Wulf's 14SS_IT3046C
 * 
 * Project:  Lab 07 - HTML5 Canvas
 * Author:   Kevin Ernst <ernstki@mail.uc.edu>
 * Date:     2014-07-20
 * 
 */

// jQuery shorthand method:
$(function() {

  var canvas = $('#canvas');
  var xDisp = $('#x-coord');
  var yDisp = $('#y-coord');
  var brushBtn = $('button#brush');
  var clearBtn = $('button#clear');
  var saveBtn = $('button#save');
  var g2 = canvas[0].getContext("2d"); // get element from jQuery object
  var NUM_SIDES = 3;
  var ERASER_SIZE = 20;
  var BRUSH_SIZE = 10;
  var SPLATTER = 5;
  var drawTimeout = 0;
  var drawing = false;

  function paintbrush(event) {
    if (!drawing && event.type === 'mousemove') { return; }
    if (event.type === 'mouseup') {
      drawing = false;
      return;
    } // otherwise, start drawing:
    
    drawing = true;
    var x = parseInt(event.pageX - canvas.offset().left);
    var y = parseInt(event.pageY - canvas.offset().top);
    xDisp.text(x);
    yDisp.text(y);
    
    // g2.beginPath();
    // g2.strokeStyle = 'black';
    // g2.moveTo(x,     y - 5);
    // g2.lineTo(x,     y + 5);
    // g2.moveTo(x - 5, y);
    // g2.lineTo(x + 5, y);
    // g2.stroke();
    
    // g2.beginPath();
    // g2.arc(x, y, 10, 0, 2 * Math.PI, false);
    // g2.fillStyle = 'green';
    // g2.fill();
    // g2.lineWidth = 5;
    // g2.strokeStyle = '#003300';
    // g2.stroke();
    
    //g2.drawCircle(10,10)
  } // beginDrawing(evt)

  function polygon(x, y, radius, numSides) {  
    g2.beginPath();
    var angle = Math.PI * 2 / numSides;
    g2.translate(x,y);  //make x y the center
    g2.moveTo(radius,0);
    
    for (var i = 1; i < numSides; i++) {
      g2.lineTo(radius * Math.cos(angle * i),
                radius * Math.sin(angle * i));
    }
    g2.closePath();  // draws the last side
  } // function polygon(x,y,radius,numSides)

  canvas.bind('mousedown mouseup mousemove', paintbrush);
  clearBtn.bind('click', function() { g2.g})

});
