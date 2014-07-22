// *************************************************
// *                                               *
// *   draw-tools.js                               *
// *                                               *
// *   Kevin Ernst for Prof. Wulf's 14US_IT3046C   *
// *   Lab 08 - HTML5 Canvas                       *
// *                                               *
// *************************************************
// 
// Global (yikes!) constants
// I know this is really poor encapsulation, and this should be a class.
// I'm a bit of a laggard on learning how to make "traditional" classes
// with JavaScript (at the moment), though.

// Eraser options
var ERASER_SIZE  = 20;
  
// Pencil options
var PENCIL_SIZE  = 3;
var PENCIL_COLOR = 'black';
var SMOOTHING    = true;

// Airbrush (default) options
var OPACITY      = 0.5;  // default opacity
var BRUSH_COLOR  = 'rgba(51,102,153,'+OPACITY+')'; // #336699
var BRUSH_SIZE   = 10;   // the max size of the brush
var DROPLETS     = 8;    // the max size of each droplet
var MAX_DROPS    = 100;  // when to stop painting droplets
//var SPLATTER     = 5;    // how dispersed the droplets are (avg px)
var FLOW_RATE    = 0.8;  // how much paint is laid down in each stroke
var NUM_SIDES    = 0;    // type of polygon for the "drops" (def; circle)

// Convert CSS-style hex triplet to rgba
// Source: http://www.javascripter.net/faq/hextorgb.htm
function hexToRGBA(trip, opacity) {
  if (typeof opacity == 'undefined') { opacity = OPACITY; }
  // Trim leading hash, if necessary
  if (trip.charAt(0)=="#") { trip = trip.substring(1,7); }

  return 'rgba(' +
         parseInt(trip.substring(0,2),16) +','+ //red
         parseInt(trip.substring(2,4),16) +','+ //green
         parseInt(trip.substring(4,6),16) +','+ //blue
         opacity + ')';
} // hexToRGBA

// ********************************************************************
// *                   function pencil(options)                       *
// ********************************************************************
function pencil(options) {
  // Draw a thin line on the given graphics context
  // Options hash expects: context, buf, color, width, smooth (bool)
  // See what we're missing:
  if (typeof options.color == 'undefined') { options.color = PENCIL_COLOR; }
  if (typeof options.width == 'undefined') { options.width = PENCIL_SIZE; }
  if (typeof options.smooth == 'undefined') { options.smooth = SMOOTHING; }
  
  options.context.beginPath();
  options.context.moveTo(options.buf[0].x, options.buf[0].y);
  if (options.smooth) {
    options.context.quadraticCurveTo(options.buf[1].x, options.buf[1].y,
                                     options.buf[2].x, options.buf[2].y);
  } else {
    options.context.lineTo(options.buf[1].x, options.buf[1].y);
    options.context.lineTo(options.buf[2].x, options.buf[2].y);
  }
  options.context.lineCap = 'round';
  options.context.lineWidth = options.width;
  options.context.strokeStyle = options.color;
  options.context.stroke();
} // pencil(options)


// ============================================================
//      A I R B R U S H    H E L P E R    F U N C T I O N S
// ============================================================
function rndBMT() {
  // Box-Muller Transform to get random points between -1 and 1 on a
  // Normal (a.k.a. Gaussian) distribution.
  //
  // Source:   http://www.protonfish.com/jslib/boxmuller.shtml
  // See also: http://en.wikipedia.org/w/index.php?title=Normal_distribution
  //                  #Generating_values_from_normal_distribution
  var x = 0, y = 0, rds, c;
  do {
    x = Math.random()*2-1;
    y = Math.random()*2-1;
    rds = x*x + y*y;
  } while (rds == 0 || rds > 1);

  c = Math.sqrt(-2*Math.log(rds)/rds);
  return [x*c, y*c];
} // rndBMT

function rndOffset(radius) {
  // Duh. Don't forget that the return value is an array.
  return rndBMT()[1] * radius;
}

function rndDropSize(dropSize) {
  return Math.ceil(Math.random() * dropSize);
}

// Math.hypot is an ECMAScript 6 feature. This polyfill makes it work in
// Chrome and other browsers.
//
// Source: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/
//                 Global_Objects/Math/hypot#Polyfill
if (!Math.hypot) {
  Math.hypot = function hypot() {
    var y = 0;
    var length = arguments.length;

    for (var i = 0; i < length; i++) {
      if(arguments[i] === Infinity || arguments[i] === -Infinity) {
        return Infinity;
      }
      y += arguments[i] * arguments[i];
    }
    return Math.sqrt(y);
  };
} // Math.hypot


// ********************************************************************
// *                function airbrush(options, itvl)                  *
// ********************************************************************
function airbrush(options, airbuf) {
  // Paint with an "airbrush" effect (a lousy one):
  // 
  // 'options': context, x, y, r, color, opacity, dropSize, splatter, frenzy
  //            numSides
  // 'airbuf':  an object with one attribute (for pass-by-ref); maintains a
  //            queue of timer intervals that can be cleared later (to fix
  //            bug where paint would keep "bleeding through" after mouseup)

  if (typeof options.r == 'undefined')        { options.r = BRUSH_SIZE / 2; }
  if (typeof options.color == 'undefined')    { options.color = BRUSH_COLOR; }
  if (typeof options.opacity == 'undefined')  { options.opacity = OPACITY; }
  if (typeof options.dropSize == 'undefined') { options.dropSize = DROPLETS; }
  if (typeof options.flowRate == 'undefined') { options.flowRate = FLOW_RATE; }
  //if (typeof options.splatter == 'undefined') { options.splatter = SPLATTER; }
  if (typeof options.numSides == 'undefined') { options.numSides = NUM_SIDES; }
  
  var drops = 0;
  
  // Append this timer to the queue so it can be cleared by mouseup later:
  airbuf.itvls[airbuf.itvls.length] =
  window.setInterval(function() {
    // Randomly move the drops around on a normal distribution from the
    // center of the brush
    var rndOffX = rndOffset(options.r);
    var rndOffY = rndOffset(options.r);
    var rndDrop = DROPLETS + 1;   // to kick off while loop
    while (rndDrop > DROPLETS) {
      rndDrop = rndDropSize(options.dropSize/Math.hypot(rndOffX, rndOffY));
    }

    // Move the droplets to a random offset from the given (x,y) center
    options.context.translate(rndOffX, rndOffY);

    //   Circular brush
    // ------------------------------------------------------------
    if (options.numSides == 0 ) {
      circle({ context: options.context,
               centerX: options.x,
               centerY: options.y,
               color: hexToRGBA(options.color, options.opacity),
               radius: rndDrop });
      // Move the axes back to the original (x,y)
    } else { // draw a randomly-rotated polygon for a "drop"

    //   Polygonal (triangular) brush
    // ------------------------------------------------------------
      var rndRot = Math.random() * 2*Math.PI; // 0 to 2*pi radians
      polygon({ context: options.context,
                centerX: options.x,
                centerY: options.y,
                color: hexToRGBA(options.color, options.opacity),
                radius: rndDrop,
                rotation: rndRot });
    } // if circle or polygon
    options.context.translate(-rndOffX, -rndOffY);
    drops++;
    if (drops > MAX_DROPS) { window.clearInterval(airbuf.itvls.pop()); }
  }, 10/options.flowRate); // min is actually 4ms, so yeah, 10 is hard-coded
  
  //console.log('itvl.id inside draw-tools.js='+itvl.id);
  
} // airbrush(options)


// ********************************************************************
// *                   function polygon(options)                      *
// ********************************************************************
function polygon(options) { 
  // options hash := centerX, centerY, radius, numSides, color, rotation
  if (typeof options.numSides == 'undefined') { options.numSides = NUM_SIDES; } 
  if (typeof options.color == 'undefined') { options.color = BRUSH_COLOR; }
  if (typeof options.rotation == 'undefined') { options.rotation = 0; }
  
  // Rotate the axes by the given angle
  options.context.beginPath();
  var angle = Math.PI * 2 / options.numSides;
  // Make the provided (x, y) be the origin for the figure
  options.context.translate(options.centerX, options.centerY);
  options.context.rotate(options.rotation);
  options.context.moveTo(options.radius,0);
  
  for (var i = 1; i < options.numSides; i++) {
    options.context.lineTo(options.radius * Math.cos(angle * i),
                           options.radius * Math.sin(angle * i));
  }
  options.context.closePath();  // draws the last side
  options.context.fillStyle = options.color;
  options.context.fill();
} // polygon(options)


// ********************************************************************
// *                    function circle(options)                      *
// ********************************************************************
function circle(options) {
  // options hash := context, centerX, centerY, radius, color
  if (typeof options.color == 'undefined') { options.color = BRUSH_COLOR; }
  options.context.beginPath();
  options.context.arc(options.centerX, options.centerY, options.radius,
                      0, 2*Math.PI, false);
  options.context.strokeStyle = 'none'; // options.color;
  options.context.fillStyle = options.color;
  options.context.fill();
} // circle(options)