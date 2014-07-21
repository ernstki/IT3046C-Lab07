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
  var previewBtn   = $('button#preview-toggle');
  var previewImg   = $('#save-preview');
  var previewArea  = $('div#preview');
  var g2           = canvas[0].getContext("2d"); // get element from jQuery obj
  var JITTER_TIMER = 50;                         // msec
  var drawTimeout  = 0;
  var penDown      = false;
  var activeTool   = 'pencil';
  var previewOn    = true;
  var ptbuf        = [];                         // buffer of points
  

  
  // ============================================================
  //        D R A W I N G    A R E A    B I N D I N G S
  // ============================================================
  
  canvas.mousedown(function(evt) {
    penDown = true;
    $(".palette").addClass('ignore-ptr-events');
    var startX = evt.pageX - $(this).offset().left;
    var startY = evt.pageY - $(this).offset().top;
    ptbuf.push( { x: startX, y: startY } );
                  
    // If the buffer isn't full after 50 msecs and the last point in the
    // buffer hasn't moved very much (the width of the pencil stroke):
    if (activeTool == 'pencil') {
      window.setTimeout(function() {
        if (ptbuf.length < 3
            && Math.abs(ptbuf[ptbuf.length-1].x - startX) < PENCIL_SIZE
            && Math.abs(ptbuf[ptbuf.length-1].y - startY) < PENCIL_SIZE) {
          // Don't wait for three points, just draw a dot and empty the buffer:
          circle(g2, startX, startY, PENCIL_SIZE);
          for (var i = 0; i < ptbuf.length; i++) { ptbuf.pop(); }
        } // if the buffer isn't full'
      }, JITTER_TIMER);
    } // if activeTool == pencil
  }); // canvas.mousedown


  canvas.mouseup(function() {
    penDown = false;
    $(".palette").hide().removeClass('ignore-ptr-events').fadeIn(500);
    // Purge the point buffer:
    for (var i = 0; i < ptbuf.length; i++) { ptbuf.pop(); }
    console.log(ptbuf.length + ' ' + ptbuf.toString());
    updatePreview();
  }); // canvas.mouseup


  // Handle penDown events for both tools
  function draw(event) {
    if (!penDown) { return; }
    
    var newX = event.pageX - $(this).offset().left;
    var newY = event.pageY - $(this).offset().top;
    
    switch (activeTool) {
      case 'airbrush':
        break;
      case 'pencil':
      default:
        ptbuf.push( { x: newX, y: newY } );
        if (ptbuf.length == 3) {
          // console.log('Drawing...');
          pencil( { context: g2, buf: ptbuf, } );
          ptbuf.shift(); ptbuf.shift();  // last point is now first
        } // if there are three points in the buffer
    } // switch activeTool
  } // draw(evt)
  
  
  canvas.bind('mousemove', draw);


  // ============================================================
  //       P A L E T T E  /  S U B M E N U     A C T I O N S
  // ============================================================

  // Update mouse coordinates in the coordinates palette
  canvas.mousemove(function(event) {
    xDisp.text( parseInt(event.pageX - canvas.offset().left) );
    yDisp.text( parseInt(event.pageY - canvas.offset().top) );
  });
  

  // Toggle the paint shapes submenu
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

  
  // Toggle the preview area (set the enclosed image to display:none and
  // the height/width of the <div> to 'auto') when the "eye" icon is clicked:
  function togglePreviewArea(event) {
    if (previewOn) {
      previewImg.hide();
      // Hopefully collapse the containing div to just hug the toggle button
      previewArea.addClass('collapsed');
      previewBtn.addClass('collapsed');
      previewOn = false;
      return;
    } // otherwise, show it again
    previewImg.show();
    previewArea.removeClass('collapsed');
    previewBtn.removeClass('collapsed');
    previewOn = true;
  } // togglePreviewArea(event)
  
  function updatePreview() {
    // Source: http://www.html5canvastutorials.com/advanced/html5-canvas-save-penDown-as-an-image/
    // save canvas image as data url (png format by default)
    var dataURL = canvas[0].toDataURL();
    // set #save-preview image src to dataURL so it can be saved as an image
    previewImg.attr('src', dataURL);
  } // updatePreview


  // ============================================================
  //               B U T T O N    B I N D I N G S
  // ============================================================

  // Toggle the preview area on a mouse click
  previewBtn.click(togglePreviewArea);

  //pencilBtn.bind('');
  //brushBtn.bind('');
  saveBtn.click(function() {
    updatePreview();

  });

  // Clear the image when the trashcan icon is clicked
  trashBtn.click(function() {
    g2.clearRect(0, 0, canvas.width(), canvas.height());
  });

});
