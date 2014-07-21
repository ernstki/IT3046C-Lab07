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

  var canvas       = $('#canvas');
  var xDisp        = $('#x-coord');
  var yDisp        = $('#y-coord');
  var pencilBtn    = $('button#pencil');
  var brushBtn     = $('button#airbrush');
  var brushMenu    = $('#paint-shapes');
  var brushSubMenu = $('#paint-shapes-submenu');
  var trashBtn     = $('button#trash');
  var saveBtn      = $('button#save');
  var g2           = canvas[0].getContext("2d"); // get element from jQuery obj
  var NUM_SIDES    = 3;                          // triangle-shaped brush
  var ERASER_SIZE  = 20;
  var BRUSH_SIZE   = 10;
  var PENCIL_SIZE  = 3;
  var SPLATTER     = 5;
  var drawTimeout  = 0;
  var penDown      = false;
  var ptbuf        = [];                         // buffer of points
  
  function updateCoords(event) {
    xDisp.text( parseInt(event.pageX - canvas.offset().left) );
    yDisp.text( parseInt(event.pageY - canvas.offset().top) );
  }

  // Handle penDown events for both tools
  function draw(event) {
    if (!penDown && event.type === 'mousemove') { return; }
    if (event.type === 'mouseup') {
      penDown = false;
      $(".palette").hide().removeClass('ignore-ptr-events').fadeIn(500);
      return;
    } // otherwise, start penDown:
    
    penDown = true;
    // Prevent palettes from intercepting events:
    $(".palette").addClass('ignore-ptr-events');
    
    var x = parseInt(event.pageX - canvas.offset().left);
    var y = parseInt(event.pageY - canvas.offset().top);
    
    g2.beginPath();
    g2.moveTo(x, y);
    g2.lineCap = 'round';
    g2.lineWidth = PENCIL_SIZE;
    g2.lineTo(event.pageX, event.pageY);
    g2.strokeStyle = 'black';
    g2.stroke();
    
  } // beginDrawing(evt)

  
  function paintShapeSubmenu(event) {
    switch (event.type) {
      case 'mouseover':
        brushMenu.addClass('submenu-open');
        brushSubMenu.show('slow');
        break;
      case 'mouseout':
        brushMenu.removeClass('submenu-open');
        brushSubMenu.hide('slow');
        break;
    } // switch (event.type)
  } // paintShapeSubmenu(event)

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

  canvas.bind('mousedown mouseup mousemove', draw);
  //brushMenu.bind('mouseover mouseout', paintShapeSubmenu);
  canvas.mousemove(updateCoords);
  //pencilBtn.bind('');
  //brushBtn.bind('');
  saveBtn.click(function() {
      // Source: http://www.html5canvastutorials.com/advanced/html5-canvas-save-penDown-as-an-image/
      // save canvas image as data url (png format by default)
      var dataURL = canvas[0].toDataURL();

      // set #save-preview image src to dataURL
      // so it can be saved as an image
      $('#save-preview').attr('src', dataURL);
  });
  trashBtn.click(function() {
    g2.clearRect(0, 0, canvas.width(), canvas.height());
  });

});
