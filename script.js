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
  'use strict';

  var canvas        = $('#canvas');
  var xDisp         = $('#x-coord');
  var yDisp         = $('#y-coord');
  var toolbar       = $('div#tools');
  var pencilBtn     = $('button#pencil');
  var airbrushBtn   = $('button#airbrush');
  var brushMenu     = $('#paint-shapes');
  var brushSubMenu  = $('#paint-shapes-submenu');
  var trashBtn      = $('button#trash');
  var saveBtn       = $('button#save');
  var previewBtn    = $('button#preview-toggle');
  var previewImg    = $('#save-preview');
  var previewArea   = $('div#preview');
  var g2            = canvas[0].getContext("2d"); // 1st element in collection
  var JITTER_TIMER  = 50;                         // msec
  var SAVE_FILENAME = 'image.png';
  var penDown       = false;
  var activeTool    = 'pencil';
  var previewOn     = true;
  var ptbuf         = [];            // buffer of points for smooth pencil
  var airbuf        = { itvls: [] }; // queue of interval timers for airbrush
  
  
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
          circle({ context: g2,
                   centerX: startX,
                   centerY: startY,
                   color: PENCIL_COLOR,
                   radius: PENCIL_SIZE });

          purgeBuffer();
        } // if the buffer isn't full'
      }, JITTER_TIMER);
    } // if activeTool == pencil
  }); // canvas.mousedown


  canvas.mouseup(function() {
    penDown = false;
    // Fade the tool palettes and preview back in
    $(".palette").hide().removeClass('ignore-ptr-events').fadeIn(500);

    // Purge the point buffer for the pencil
    purgePtBuf();

    // Clear ALL timer intervals (for the airbrush)
    //console.log('itvl.id inside mouseup='+itvl.id);
    clearAirbrushIntervals();

    console.log('ptbuf.length=' + ptbuf.length + ' ' + ptbuf.toString());
    updatePreview();
  }); // canvas.mouseup
  
  
  // =============================================================
  //         D R A W    H E L P E R    F U N C T I O N S
  // =============================================================
  function purgePtBuf() {
    // Clear the point buffer for the pencil tool
    for (var i = 0; i < ptbuf.length; i++) { ptbuf.pop(); }
  }
  function clearAirbrushIntervals() {
    // Clear all timer intervals for the airbrush
    for (var i = 0; i < airbuf.itvls.length; i++) {
      window.clearInterval(airbuf.itvls.shift());
    }
  } // clearAirbrushIntervals


  // ********************************************************************
  // *                   function draw(event)                           *
  // ********************************************************************
  // Handle penDown events for both tools
  function draw(event) {
    if (!penDown) { return; }
    
    var newX = event.pageX - $(this).offset().left;
    var newY = event.pageY - $(this).offset().top;
    
    switch (activeTool) {
      case 'airbrush':
        airbrush( { context: g2, x: newX, y: newY }, airbuf );
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

  // Now set draw functions to listen for canvas events
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
    //updatePreview(); // make sure the image is up-to-date (prob unnecessary)
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
    
    // Wrap a link with the HTML5 'download' attribute already set, so we can
    // 'click' on it with JavaScript later to trigger a download
    // Source: http://www.nihilogic.dk/labs/canvas2image/
    dataURL.replace('image/png', 'image/octet-stream');
    previewImg.wrap('<a href="'+dataURL+'" download="'+SAVE_FILENAME+'">');
  } // updatePreview


  // ============================================================
  //               B U T T O N    B I N D I N G S
  // ============================================================

  // Toggle the preview area on a mouse click
  previewBtn.click(togglePreviewArea);

  pencilBtn.click(function() {
    activeTool = 'pencil';
    // Remove the '.active' class from all buttons in the toolbar
    toolbar.children('button').removeClass('btn-active');
    $(this).addClass('btn-active');
    
  });
  airbrushBtn.click(function() {
    activeTool = 'airbrush';
    toolbar.children('button').removeClass('btn-active');
    $(this).addClass('btn-active');
  });

  saveBtn.click(function() {
    // probably unnecessary, since it's being redrawn on mouseup anyway
    //updatePreview(); 
    
    // This works (found in a library[1]) but then your user has to know that
    // they have to put a .png extension on the file for it to open in their
    // OS. [1] http://www.nihilogic.dk/labs/canvas2image/
    //window.open(previewImg.attrib('src')); 
    
    // By wrapping an anchor around the preview image with the HTML5
    // 'download' attribute, then synthesizing a click on the image (FIXME:
    // click events are currently being masked by some other element anyway),
    // you get the best of both worlds, and no pop-up blockers getting in the
    // way. Since the 'data:' URL changes every time (it *is* the image data)
    // it's best to update this link in updatePrevew(). Here we just do the
    // clicking
    
    // Source: http://techslides.com/html5-download-attribute-with-javascript/
    var clkEvt = document.createEvent("MouseEvent");
    // Most of these are screen x,y coords and status of modifier keys.
    // The last 0, null is which mouse button (0 = primary/left-click) and
    // property called relatedTarget which isn't used here (more info:
    // http://tinyurl.com/k9pdamt - MDN event.initMouseEvent)
    clkEvt.initMouseEvent("click", true, true, window, 0, 0, 0, 0, 0, false,
                          false, false, false, 0, null);

    // Get the element out of jQuery obj and send the click event to trigger
    // the download link
    previewImg[0].dispatchEvent(clkEvt); 
  }); // saveBtn.click

  // Clear the image when the trashcan icon is clicked
  trashBtn.click(function() {
    g2.clearRect(0, 0, canvas.width(), canvas.height());
    updatePreview();
  });
  
  
  // And update the preview area on load, to get rid of that pesky white
  // border in Chrome:
  updatePreview();

});
