/**
 * Created by akato on 16.12.13.
 */
define(function () {

    var Drawer = function (contextId)
    {
        var canvas = document.getElementById(contextId);
        this.context =  canvas.getContext('2d');

        this.tileSize = {width: 43, height:43};
        this.tileInset = {width:6, height:6};

        this.offset = {x:this.tileInset.width, y:this.tileInset.height};
    };

    Drawer.prototype.clearCanvas = function()
    {
        this.context.canvas.width = this.context.canvas.width;
    };

    Drawer.prototype.drawRectForTiles = function (tiles, color)
    {
        var ctx = this.context;

        var i;
        var minX, maxX, minY, maxY;

        minX = maxX = tiles[0][0];
        minY = maxY = tiles[0][1];

        for (i in tiles) {
            minX = Math.min(minX, tiles[i][0]);
            maxX = Math.max(maxX, tiles[i][0]);
            minY = Math.min(minY, tiles[i][1]);
            maxY = Math.max(maxY, tiles[i][1]);
        }

        var width = maxX - minX + 1,
            height = maxY - minY + 1
        ;

        var tileSizeWithInsetX = ( this.tileSize.width +  this.tileInset.width    ),
            tileSizeWithInsetY = ( this.tileSize.height +  this.tileInset.height  )
        ;
        width  = width  * tileSizeWithInsetX + this.offset.x;
        height = height * tileSizeWithInsetY + this.offset.y;

        ctx.fillStyle = color;

        ctx.beginPath();

        var x = tileSizeWithInsetX * minX;
        var y = tileSizeWithInsetY * minY;

        ctx.rect(x, y, width, height);

        ctx.closePath();

        ctx.fill();
    };

    Drawer.prototype.drawTiles = function (tiles)
    {
        var ctx = this.context;

        this.drawRectForTiles(tiles, "darkgray");

        ctx.strokeStyle = '#000000';
        ctx.fillStyle = '#FFFF00';

        for(var i in tiles) {
            var tile = tiles[i];

            console.log(tile);
            ctx.beginPath();

            var x = this.offset.x + ( this.tileSize.width +  this.tileInset.width  ) * tile[0];
            var y = this.offset.y + ( this.tileSize.height + this.tileInset.height ) * tile[1];

            ctx.rect(x, y, this.tileSize.width, this.tileSize.height);

            ctx.closePath();

            ctx.stroke();
            ctx.fill();
        }
    };

    Drawer.prototype.drawTest = function ()
    {
        var ctx = this.context;

        ctx.strokeStyle = '#000000';
        ctx.fillStyle = '#FFFF00';

        ctx.beginPath();
        ctx.rect(10,10,50,50);
        ctx.closePath();

        ctx.stroke();
        ctx.fill();
    };

    return Drawer;
});