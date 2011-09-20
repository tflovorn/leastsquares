"use strict";

// Data necessary to describe and draw a graph line.
function Line(leftY, rightY, color) {
    this.leftY = leftY;
    this.rightY = rightY;
    this.color = color;
}

// Draw the coordinate grid.
// *lifted directly from http://raphaeljs.com/analytics.js
// (x, y) = position of top-right corner of grid
// (w, h) = width and height of grid
// (wv, hv) = number of grid boxes in the x/y direction
// color = color of grid lines
Raphael.fn.drawGrid = function (x, y, w, h, wv, hv, color) {
    color = color || "#000";
    var path = ["M", Math.round(x) + 0.5, Math.round(y) + 0.5, "L", Math.round(x + w) + 0.5, Math.round(y) + 0.5, Math.round(x + w) + 0.5, Math.round(y + h) +0.5, Math.round(x) + 0.5, Math.round(y + h) + 0.5, Math.round(x) + 0.5, Math.round(y) + 0.5],
        rowHeight = h / hv,
        columnWidth = w / wv;
    for (var i = 1; i < hv; i++) {
        path = path.concat(["M", Math.round(x) + 0.5, Math.round(y + i * rowHeight) + 0.5, "H", Math.round(x + w) + 0.5]);
    }
    for (i = 1; i < wv; i++) {
        path = path.concat(["M", Math.round(x + i * columnWidth) + 0.5, Math.round(y) + 0.5, "V", Math.round(y + h) + 0.5]);
    }
    return this.path(path.join(",")).attr({"stroke": color});
};

// Draw each Line in lines.  The x coordinates on the ends are fixed at leftX
// and rightX.  convertY converts from coordinate space to pixel space.
// Return the path objects created.
Raphael.fn.drawLines = function (lines, leftX, rightX, convertY) {
    var paths = [];
    for (var i = 0; i < lines.length; i++) {
        var line = lines[i];
        // Extract line data; assume parameters could come uninitialized.
        var color = line.color || "#000",
            leftYCoord = line.leftY || 0,
            rightYCoord = line.rightY || 0,
            leftY = convertY(leftYCoord),
            rightY = convertY(rightYCoord);
        // Construct the SVG path string.
        var pathList = ["M", leftX, leftY, "L", rightX, rightY],
            path = this.path(pathList.join(",")).attr({"stroke": color, "stroke-width":0.5});
        paths = paths.concat(path);
    }
    return paths;
}

// Return the mean of the list of numbers xs
var findMean = function (xs) {
    var sum = 0;
    for (var i = 0; i < xs.length; i++) {
        sum += xs[i];
    }
    return sum / xs.length
}

window.onload = function() {
    // Canvas dimensions
    var width = 800,
        height = 800;
    // Space to leave on the borders of the graph
    var leftgutter = 40,
        rightgutter = 40,
        topgutter = 40,
        bottomgutter = 40;
    // Graph element colors.  A convenient chart is at:
    // http://www.december.com/html/spec/color3hex1.html
    var pointColor = "#000",
        gridColor = "#333",
        lineColors = ["#F00", "#0F0", "#00F", "#CF0", "#C0F", "#0CF"];
    // Index of lineColors to use for color of the next line created
    var lineColorIndex = 1;
    // temp. data
    var dataX = [1, 2, 3, 4,0.5],
        dataY = [2, 4, 6, 8, 10];
    // Find the extrema of the data to calculate scaling
    var minX = Math.min.apply(null, dataX),
        maxX = Math.max.apply(null, dataX),
        minY = Math.min.apply(null, dataY),
        maxY = Math.max.apply(null, dataY);
    // Get statistics for data    
    var meanY = findMean(dataY)
    // Calculate the scaling (pixels per x and y) to be used in the graph
    var scaleX = (width - leftgutter - rightgutter) / (maxX - minX),
        scaleY = (height - topgutter - bottomgutter) / (maxY - minY);
    // Create the Rapael context inside div element "holder"
    var r = Raphael("holder", width, height);
    // Draw the grid (for reading off coordinates)
    var gridX = leftgutter + 0.5,
        gridY = topgutter + 0.5,
        gridWidth = width - leftgutter - rightgutter,
        gridHeight = height - topgutter - bottomgutter;
    r.drawGrid(gridX, gridY, gridWidth, gridHeight, 10, 10, "#333");
    // Closure over the grid variables to convert a coordinate on the grid to 
    // pixel space.  For passing to r.drawLines().
    var coordToPixelsY = function(y) {
        return gridY + gridHeight - y * scaleY;
    }
    // Initialize the line list with one line.
    var lines = [new Line(meanY, meanY, lineColors[0])];
    // Draw the initial line
    r.drawLines(lines, gridX, gridX + gridWidth, coordToPixelsY);
};
