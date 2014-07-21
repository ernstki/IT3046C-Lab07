/*
 * Builds upon advice from http://stackoverflow.com/a/3789278
 * 
 * Author:   Kevin Ernst <ernstki@mail.uc.edu>
 * Course:   14US_IT304C - Prof. Wulf
 */


$(function() {
    var canvas = $('canvas');
    var ctx = canvas[0].getContext('2d');
    var width  = window.innerWidth;
    var height = window.innerHeight;
    canvas.height = height;
    canvas.width = width;
    canvas.css('border', '1px solid white;');
    var pts = [];
  
  
    function drawPoint(evt) {
      var pt = {
        x: parseInt(evt.pageX - canvas.offset().left),
        y: parseInt(evt.pageY - canvas.offset().top)
      };
      circle(pt.x, pt.y, 2);
      pts.push(pt);
      
      if (pts.length == 3) {
        ctx.beginPath();
        ctx.moveTo(pts[0].x, pts[0].y);
        ctx.quadraticCurveTo(pts[1].x, pts[1].y, pts[2].x, pts[2].y);
        ctx.strokeStyle = '#ccc';
        ctx.stroke();
        pts.shift(); pts.shift();
      }
    } // drawPoint(evt)
    
    function circle(cx, cy, r) {
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, 2*Math.PI, false);
      ctx.strokeStyle = '#ffffff';
      ctx.fillStyle = 'white';
      ctx.fill();
      ctx.stroke();
    }
    
    function rgb() {
      color = 'rgb(';
      for(var i = 0; i< 3; i++) {
        color += Math.floor(Math.random() * 255)+',';
      }
      return color.replace(/\,$/,')');
    }
  
    $('canvas').mousedown(drawPoint);
    
  });