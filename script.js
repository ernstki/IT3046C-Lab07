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

  var g2 = canvas.getContext("2d");
  var NUM_SIDES = 3;
  

  function beginDrawing() {


  }

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



  $('#canvas').bind('mousedown', function() {
    window.setTimeout
  });


});
