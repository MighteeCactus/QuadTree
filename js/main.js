/**
 * Created by akato on 16.12.13.
 */
require(["QuadTree", "Drawer", "tilesForLayout"], function(QuadTree, Drawer, tilesForLayout) {

    var drawer = new Drawer("plot");

    var quadTree = new QuadTree(tilesForLayout);

    var tiles = quadTree.tilesInRect({x:0,y:1,w:2,h:2});

    console.log("tiles:");
    console.log(tiles);

    drawer.drawTiles(tiles);

});


