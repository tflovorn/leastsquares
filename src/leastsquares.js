(function () {
    "use strict";

    // Global display parameters (see descriptions in initGlobals()).
    var width, height, leftGutter, rightGutter, topGutter, bottomGutter,
        pointColor, gridColor, lineColors;

    // Initialize global variables with default values.
    var initGlobals = function () {
        // Canvas dimensions
        width = 800;
        height = 800;
        // Space to leave on the borders of the graph
        leftGutter = 40;
        rightGutter = 40;
        topGutter = 40;
        bottomGutter = 40;
        // Graph element colors.  A convenient chart is at:
        // http://www.december.com/html/spec/color3hex1.html
        pointColor = "#000";
        gridColor = "#333";
        lineColors = ["#F00", "#0F0", "#00F", "#CF0", "#C0F", "#0CF"];
    };

    // Width / height of the coordinate grid.
    var gridWidth = function () {
        return width - leftGutter - rightGutter;
    };

    var gridHeight = function () {
        return height - topGutter - bottomGutter;    
    };

    // (X, Y) position in pixel space of the top-left corner of the grid.
    var gridX = function () {
        return leftGutter + 0.5;
    };

    var gridY = function () {
        return topGutter + 0.5;
    };

    // Data necessary to describe and draw a graph line.
    // leftY and rightY are given in coordinate (not pixel) space.
    function Line(leftY, rightY, color) {
        this.leftY = leftY;
        this.rightY = rightY;
        this.color = color;
    }

    // Add a new horizontal Line to lines with the given y coordinate.
    var createLine = function (y, lines) {
        var lineColorIndex = lines.length % lineColors.length,
            line = new Line(y, y, lineColors[lineColorIndex]);
        lines.push(line);
    };

    // Convert a coordinate on the grid to pixel space.
    var coordToPixelsY = function (y, scaleY) {
        return gridY() + gridHeight() - y * scaleY;
    };

    // Draw the coordinate grid.
    // *lifted directly from http://raphaeljs.com/analytics.js
    // (x, y) = position of top-right corner of grid
    // (w, h) = width and height of grid
    // (wv, hv) = number of grid boxes in the x/y direction
    // color = color of grid lines
    var drawGrid = function (paper, wv, hv) {
        var x = gridX(),
            y = gridY(),
            w = gridWidth(),
            h = gridHeight();
        var path = ["M", Math.round(x) + 0.5, Math.round(y) + 0.5, "L", Math.round(x + w) + 0.5, Math.round(y) + 0.5, Math.round(x + w) + 0.5, Math.round(y + h) + 0.5, Math.round(x) + 0.5, Math.round(y + h) + 0.5, Math.round(x) + 0.5, Math.round(y) + 0.5],
            rowHeight = h / hv,
            columnWidth = w / wv;
        for (var i = 1; i < hv; i++) {
            path = path.concat(["M", Math.round(x) + 0.5, Math.round(y + i * rowHeight) + 0.5, "H", Math.round(x + w) + 0.5]);
        }
        for (i = 1; i < wv; i++) {
            path = path.concat(["M", Math.round(x + i * columnWidth) + 0.5, Math.round(y) + 0.5, "V", Math.round(y + h) + 0.5]);
        }
        return paper.path(path.join(",")).attr({"stroke": gridColor});
    };

    // Draw each Line in lines. The x coordinates on the ends are fixed at 
    // leftX and rightX. convertY converts from coordinate space to pixel 
    // space. Return the path objects created.
    var drawLines = function (paper, lines, scaleY) {
        var leftX = gridX(),
            rightX = gridX() + gridWidth();
        var paths = [];
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            // Extract line data; assume parameters could come uninitialized.
            var color = line.color || "#000",
                leftYCoord = line.leftY || 0,
                rightYCoord = line.rightY || 0,
                leftY = coordToPixelsY(leftYCoord, scaleY),
                rightY = coordToPixelsY(rightYCoord, scaleY);
            // Construct the SVG path string.
            var pathList = ["M", leftX, leftY, "L", rightX, rightY],
                path = paper.path(pathList.join(",")).attr({"stroke": color, "stroke-width": 5});
            paths = paths.concat(path);
        }
        return paths;
    };

    // Return the mean of the list of numbers xs.
    var findMean = function (xs) {
        var sum = 0;
        for (var i = 0; i < xs.length; i++) {
            sum += xs[i];
        }
        return sum / xs.length;
    };

    window.onload = function () {
        // Set global display parameters to their default values.
        initGlobals();
        // temp. data
        var dataX = [1, 2, 3, 4, 5],
            dataY = [2, 4, 6, 8, 10];
        // Find the extrema of the data to calculate scaling.
        var maxX = Math.max.apply(null, dataX),
            maxY = Math.max.apply(null, dataY);
        // Get statistics for data.
        var meanY = findMean(dataY);
        // Calculate the scaling (pixels per x and y) to be used in the graph.
        var scaleX = (width - leftGutter - rightGutter) / maxX,
            scaleY = (height - topGutter - bottomGutter) / maxY;
        // Create the Rapael context inside div element "holder".
        var paper = Raphael("holder", width, height);
        // Draw the coordinate grid.
        drawGrid(paper, 10, 10);
        // Initialize the line list.
        var lines = [];
        // Create the first line.
        createLine(meanY, lines);
        // Draw the initial lines.
        drawLines(paper, lines, scaleY);
    };

})();
