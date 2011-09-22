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
    function LineData(leftY, rightY, color) {
        this.leftY = leftY;
        this.rightY = rightY;
        this.color = color;
    }

    // Convert a coordinate on the grid to pixel space.
    var coordToPixelsY = function (y, scaleY) {
        return gridY() + gridHeight() - y * scaleY;
    };

    // Convert a coordinate in pixel space to the grid coordinates.
    var pixelsToCoord = function (y, scaleY) {
        return (gridHeight() - (y - topGutter)) / scaleY;
    };

    // Holds a line and its associated circles.
    function Line(lineData, linePath, leftCircle, rightCircle) {
        // Line object holding the data for this line.
        this.lineData = lineData;
        // Raphael graphics objects.
        this.linePath = linePath;
        this.leftCircle = leftCircle;
        this.rightCircle = rightCircle;
    }

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

    // Return the SVG path string for a line from (leftX, leftY) to
    // (rightX, rightY).
    var linePathString = function (leftX, leftY, rightX, rightY) {
        return ["M", leftX, leftY, "L", rightX, rightY].join(",");
    };

    // Draw a single Line. The x coordinates on the ends are fixed at 
    // leftX and rightX. scaleY is the scale factor from coordinate space to
    // pixel space. Return the Raphael path object created.
    var drawLine = function (paper, lineData, scaleY) {
        // Pull global display parameters.
        var leftX = gridX(),
            rightX = gridX() + gridWidth();
        // Extract line data; assume parameters could come uninitialized.
        var color = lineData.color || "#000",
            leftYCoord = lineData.leftY || 0,
            rightYCoord = lineData.rightY || 0,
            leftY = coordToPixelsY(leftYCoord, scaleY),
            rightY = coordToPixelsY(rightYCoord, scaleY);
        // Create the Raphel path object.
        var path = paper.path(linePathString(leftX, leftY, rightX, rightY));
        path.attr({"stroke": color, "stroke-width": 5});
        return path;
    };

    // Event handlers for dragging circles and their associated lines.
    // (see http://groups.google.com/group/raphaeljs/browse_thread/thread/295d5f3d2c835134#)
    // dragStart is called once when the drag begins.
    var dragStart = function () {
        // Store starting coordinates to use when moving.
        this.oy = this.attr("cy");
        // Make the circle opaque.
        this.attr({"opacity": 1});
    };

    // dragMove is called whenever the position is changed when dragging.
    var dragMove = function (dx, dy) {
        var newY = this.oy + dy,
            minY = gridY(),
            maxY = gridY() + gridHeight();
        // Don't let the circles leave the grid.
        if (newY < minY) {
            newY = minY;
        }
        if (newY > maxY) {
            newY = maxY;
        }
        // Move the circle (but only in the y direction).
        this.attr({"cy": newY});
        // Tell the circle's associated line to move.
        this.lineMove(newY);
    };

    // dragUp is called once at the end of dragging.
    var dragUp = function () {
        // Make the circle transparent.
        this.attr({"opacity": 0.5});
    };

    // Add draggable circles onto the ends of the line.
    var createCircles = function (paper, line, scaleY, radius) {
        var data = line.lineData,
            color = data.color,
            leftX = gridX(),
            rightX = gridX() + gridWidth(),
            initialLeftY = coordToPixelsY(data.leftY, scaleY),
            initialRightY = coordToPixelsY(data.rightY, scaleY),
            circleAttrs = {"fill": color, "stroke": color,
                           "stroke-width": 5, "opacity": 0.5},
            leftCircle = paper.circle(gridX(), initialLeftY, radius),
            rightCircle = paper.circle(gridX() + gridWidth(), initialRightY, radius);
        leftCircle.attr(circleAttrs);
        leftCircle.drag(dragMove, dragStart, dragUp);
        leftCircle.lineMove = function (newLeftY) {
            data.leftY = pixelsToCoord(newLeftY, scaleY);
                // rightY may have changed, so recalculate it
            var newRightY = coordToPixelsY(data.rightY, scaleY),
                pathString = linePathString(leftX, newLeftY, rightX, newRightY);
            line.linePath.attr({"path": pathString});
        };
        rightCircle.attr(circleAttrs);
        rightCircle.drag(dragMove, dragStart, dragUp);
        rightCircle.lineMove = function (newRightY) {
            data.rightY = pixelsToCoord(newRightY, scaleY);
            var newLeftY = coordToPixelsY(data.leftY, scaleY),
                pathString = linePathString(leftX, newLeftY, rightX, newRightY);
            line.linePath.attr({"path": pathString});
        };
        return line;
    };

    // Add a new horizontal Line to lines with the given y coordinate.
    var createLine = function (paper, y, scaleY, lines) {
        var lineColor = lineColors[lines.length % lineColors.length],
            lineData = new LineData(y, y, lineColor),
            linePath = drawLine(paper, lineData, scaleY),
            line = new Line(lineData, linePath, null, null);
        createCircles(paper, line, scaleY, 15, lineColor);
        lines.push(line);
        return line;
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
        var gridPaths = drawGrid(paper, 10, 10);
        // Initialize the line list.
        var lines = [];
        createLine(paper, meanY, scaleY, lines);
        createLine(paper, meanY / 2, scaleY, lines);
        createLine(paper, meanY / 4, scaleY, lines);
    };

})();
