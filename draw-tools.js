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

// Airbrush options
var BRUSH_SIZE   = 10;   // the max size of the brush
var DROPLETS     = 5;    // the max size of each droplet
var SPLATTER     = 5;    // how dispersed the droplets are
var FLOW_RATE    = 0.5;  // how much paint is laid down in each stroke
var NUM_SIDES    = 3;    // default type of polygon for the 'drops'


// Draw a thin line on the given graphics context
// Options hash expects: context, buf, color, width, smooth (bool)
function pencil(options) {
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


// 'options': context, x, y, r, dropSize, splatter, frenzy numSides
function airbrush(options) {
  if (typeof options.r == 'undefined') { options.r = BRUSH_SIZE; }
  if (typeof options.dropSize == 'undefined') { options.dropSize = DROPLETS; }
  if (typeof options.flowRate == 'undefined') { options.flowRate = FLOW_RATE; }
  if (typeof options.splatter == 'undefined') { options.splatter = SPLATTER; }
  if (typeof options.numSides == 'undefined') { options.numSides = NUM_SIDES; }

  
  
} // airbrush(options)

// Parameters: x,y (c)enter, (r)adius, # of (s)ides
function polygon(context, cx, cy, r, s, color) { 
  context.beginPath();
  var angle = Math.PI * 2 / s;
  context.translate(cx, cy);  //make x y the center
  context.moveTo(radius,0);
  
  for (var i = 1; i < numSides; i++) {
    context.lineTo(r * Math.cos(angle * i),
              r * Math.sin(angle * i));
  }
  context.closePath();  // draws the last side
  context.fillStyle = color;
  context.fill();
} // polygon(x,y,r,s)


function circle(context, cx, cy, r, color) {
  if (typeof color == 'undefined') { color = 'black'; }
  context.beginPath();
  context.arc(cx, cy, r, 0, 2*Math.PI, false);
  context.strokeStyle = '#ffffff';
  context.fillStyle = color;
  context.fill();
} // circle(cx,cy,r)