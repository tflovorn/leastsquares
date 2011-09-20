// Draw the coordinate grid.
// *lifted directly from http://raphaeljs.com/analytics.js
// (x, y) = position of top-right corner of grid
// (w, h) = width and height of grid
// (wv, hv) = number of grid boxes in the x/y direction
// color = color of grid lines
Raphael.fn.drawGrid = function (x, y, w, h, wv, hv, color) {
    color = color || "#000";
    var path = ["M", Math.round(x) + .5, Math.round(y) + .5, "L", Math.round(x + w) + .5, Math.round(y) + .5, Math.round(x + w) + .5, Math.round(y + h) + .5, Math.round(x) + .5, Math.round(y + h) + .5, Math.round(x) + .5, Math.round(y) + .5],
        rowHeight = h / hv,
        columnWidth = w / wv;
    for (var i = 1; i < hv; i++) {
        path = path.concat(["M", Math.round(x) + .5, Math.round(y + i * rowHeight) + .5, "H", Math.round(x + w) + .5]);
    }
    for (i = 1; i < wv; i++) {
        path = path.concat(["M", Math.round(x + i * columnWidth) + .5, Math.round(y) + .5, "V", Math.round(y + h) + .5]);
    }
    return this.path(path.join(",")).attr({stroke: color});
};

window.onload = function() {
    // Canvas dimensions
    var width = 800,
        height = 800;
    // Spce to leave on the borders of the graph
    var leftgutter = 40,
        rightgutter = 40,
        topgutter = 40,
        bottomgutter = 40;
    // Graph element colors.  A convenient chart is at:
    // http://www.december.com/html/spec/color3hex1.html
    var pointColor = "#000",
        gridColor = "#333";
        lineColors = ["#F00", "#0F0", "#00F", "#CF0", "#C0F", "#0CF"];
    // Which color should the next line created be?
    var lineColorIndex = 0;
    // temp. data
    var dataX = [1, 2, 3, 4, 5],
        dataY = [2, 4, 6, 8, 10];
    // Find the extrema of the data to calculate scaling
    var minX = Math.min.apply(null, dataX),
        maxX = Math.max.apply(null, dataX),
        minY = Math.min.apply(null, dataY),
        maxY = Math.max.apply(null, dataY);
    // Calculate the scaling (pixels per x and y) to be used in the graph
    var scaleX = (width - leftgutter - rightgutter) / (maxX - minX),
        scaleY = (height - topgutter - bottomgutter) / (maxY - minY);
    // Create the Rapael context inside div element "holder"
    var r = Raphael("holder", width, height);
    // Draw the grid (for reading off coordinates)
    r.drawGrid(leftgutter + .5, topgutter + .5, width - leftgutter - rightgutter, height - topgutter - bottomgutter, 10, 10, "#333");
};
