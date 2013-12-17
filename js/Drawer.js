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

    Drawer.prototype.drawTiles = function (tiles)
    {
        var ctx = this.context;

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