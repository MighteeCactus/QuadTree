/**
 * Created by akato on 16.12.13.
 */
require(["QuadTree", "Drawer", "tilesForLayout"], function(QuadTree, Drawer, tilesForLayout) {

    var drawer = new Drawer("plot");

    var quadTree = new QuadTree(tilesForLayout);


    var xInput = document.getElementById("x"),
        yInput = document.getElementById("y"),
        wInput = document.getElementById("w"),
        hInput = document.getElementById("h"),
        submit = document.getElementById("draw")
    ;

    xInput.value = 0;
    yInput.value = 0;
    wInput.value = 2;
    hInput.value = 1;

    submit.onclick = function () {
        var rect = {
            x: parseInt(xInput.value),
            y: parseInt(yInput.value),
            w: parseInt(wInput.value),
            h: parseInt(hInput.value)
        };

        console.clear();

        console.log(rect);

        drawer.clearCanvas();
        drawer.drawRectForTiles(tilesForLayout, "lightgoldenrodyellow");
        drawer.drawTiles(quadTree.tilesInRect(rect));
    };

//    var tiles = quadTree.tilesInRect({x:0,y:0,w:4,h:2});
    var tiles = quadTree.tilesInRect({x:1,y:0,w:2,h:1});

    console.log("tiles:");
    console.log(tiles);

    drawer.clearCanvas();
    drawer.drawRectForTiles(tilesForLayout, "lightgoldenrodyellow");
    drawer.drawTiles(tiles);

});


