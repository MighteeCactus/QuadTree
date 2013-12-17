/**
 * Created by akato on 16.12.13.
 */
define(function () {

    var log = function (message, what)
    {
        console.log(message);
        console.log(what);
    };
    var logOne = function (message)
    {
        console.log(message);
    };

//---------- Классы QuadTree ----------------

    /**
     * @param x {int}
     * @param y {int}
     * @constructor
     */
    var Point = function (x, y)
    {
        this.x = x;
        this.y = y;
    };
    Point.prototype.copy = function ()
    {
        return new Point(this.x, this.y);
    };
    /**
     * @param w {int}
     * @param h {int}
     * @constructor
     */
    var Size = function (w, h)
    {
        w = w ? w : 1;
        h = h ? h : 1;
        this.w = w;
        this.h = h;
    };
    Size.prototype.copy = function ()
    {
        return new Size(this.w, this.h);
    };
    /**
     * @param origin {Point}
     * @param size   {Size}
     * @constructor
     */
    var Rect = function (origin, size)
    {
        this.origin = origin.copy();
        this.size = size.copy();
    };
    Rect.prototype.copy = function ()
    {
        return new Rect(this.origin, this.size);
    };
    /**
     * @param center    {Point}
     * @param halfSize  {Size}
     * @constructor
     */
    var AABB = function (center, halfSize)
    {
        this.center = center.copy();
        this.halfSize = halfSize.copy();
    };
    AABB.prototype.copy = function ()
    {
        return new AABB(this.center, this.halfSize);
    };
    /**
     * @param point {[x,y]}
     */
    AABB.prototype.containsPoint = function(point)
    {
        var x = point[0];
        var y = point[1];

        var leftTop     = new Point(this.center.x - this.halfSize.w, this.center.y - this.halfSize.h), // -1
            rightBottom = new Point(this.center.x + this.halfSize.w, this.center.y + this.halfSize.h)
        ;

        var a = {
            x:point[0],
            y:point[1],
            leftX:leftTop.x,
            leftY:leftTop.y,
            rightX:rightBottom.x,
            rightY:rightBottom.y
        }
        log("comparing:", a);

        if ( (x >= leftTop.x && x < rightBottom.x) &&
             (y >= leftTop.y && y < rightBottom.y)) {
            return true;
        }

        return false;
    };
    /**
     * @param otherAABB     {AABB}
     * @returns {boolean}
     */
    AABB.prototype.intersectsAABB = function (otherAABB)
    {
        var leftTop     = new Point(this.center.x - this.halfSize.w, this.center.y - this.halfSize.h), // -1
            rightTop    = new Point(this.center.x + this.halfSize.w, this.center.y - this.halfSize.h),
            rightBottom = new Point(this.center.x + this.halfSize.w, this.center.y + this.halfSize.h),
            leftBottom  = new Point(this.center.x - this.halfSize.w, this.center.y + this.halfSize.h)
        ;

        var oLeftTop     = new Point(otherAABB.center.x - otherAABB.halfSize.w, otherAABB.center.y - otherAABB.halfSize.h),
            oRightTop    = new Point(otherAABB.center.x + otherAABB.halfSize.w, otherAABB.center.y - otherAABB.halfSize.h),
            oRightBottom = new Point(otherAABB.center.x + otherAABB.halfSize.w, otherAABB.center.y + otherAABB.halfSize.h),
            oLeftBottom  = new Point(otherAABB.center.x - otherAABB.halfSize.w, otherAABB.center.y + otherAABB.halfSize.h)
        ;
        var otherPoints = [oLeftTop, oRightTop, oRightBottom, oLeftBottom];

        if ( leftTop.x  == oLeftTop.x  && leftTop.y  == oLeftTop.y     &&
             rightTop.x == oRightTop.x && rightTop.y == oRightTop.y    &&
             rightBottom.x == oRightBottom.x && rightBottom.y == oRightBottom.y &&
             leftBottom.x  == oLeftBottom.x  && leftBottom.y  == oLeftBottom.y ) {
            return true;
        }

        for (var i in otherPoints) {
            var point = otherPoints[i];
            if ( point.x >= leftTop.x     && point.y >= leftTop.y     &&
                 point.x <= rightTop.x    && point.y >= rightTop.y    &&
                 point.x <= rightBottom.x && point.y <= rightBottom.y &&
                 point.x >= leftBottom.x  && point.y <= leftBottom.y  ) {
                return true;
            }
        }

        return false;
    };

    /**
     * @param boundary {AABB}
     * @constructor
     */
    var QuadTreeNode = function (boundary)
    {
        log("QuadTreeNode AABB:", boundary);

        this.boundary = boundary.copy();

        this.capacity = 4;

        this.points = [];

        this.northWest = undefined;
        this.northEast = undefined;
        this.southWest = undefined;
        this.southEast = undefined;
    };
    /**
     * @param point {Point}
     * @returns     {boolean}
     */
    QuadTreeNode.prototype.insert = function (point)
    {
        log("point", point);

        if (!this.boundary.containsPoint(point)) { return false; }

        logOne("insert to points");
        if (this.points.length < this.capacity) {
            this.points.push(point);
            log("points", this.points.length);
            return true;
        }

        if ( !this.northWest ) {
            logOne("insert Subdividing");
            this.subdivide();
        }

        logOne("insert to child");
        logOne("insert to northWest");
        if (this.northWest.insert(point)) { return true; }
        logOne("insert to northEast");
        if (this.northEast.insert(point)) { return true; }
        logOne("insert to southWest");
        if (this.southWest.insert(point)) { return true; }
        logOne("insert to southEast");
        if (this.southEast.insert(point)) { return true; }

        logOne("insert wrong...");

        return false;
    };
    QuadTreeNode.prototype.subdivide = function ()
    {
        var aabb, center, halfSize, oldCenter;

        halfSize = new Size(this.boundary.halfSize.w / 2, this.boundary.halfSize.h / 2);
        oldCenter = this.boundary.center;

        center = new Point(oldCenter.x - halfSize.w, oldCenter.y - halfSize.h);
        aabb = new AABB(center, halfSize);
        this.northWest = new QuadTreeNode(aabb);

        center = new Point(oldCenter.x + halfSize.w, oldCenter.y - halfSize.h);
        aabb = new AABB(center, halfSize);
        this.northEast = new QuadTreeNode(aabb);

        center = new Point(oldCenter.x - halfSize.w, oldCenter.y + halfSize.h);
        aabb = new AABB(center, halfSize);
        this.southWest = new QuadTreeNode(aabb);

        center = new Point(oldCenter.x + halfSize.w, oldCenter.y + halfSize.h);
        aabb = new AABB(center, halfSize);
        this.southEast = new QuadTreeNode(aabb);
    };
    /**
     * @param range {AABB}
     */
    QuadTreeNode.prototype.queryRange = function (range)
    {
        var pointsInRange = [];

        log("range", range);
        if (!this.boundary.intersectsAABB(range)) { return pointsInRange; }
        logOne("intersects");
        for(var i in this.points) {
            var point = this.points[i];
            log("pick point", point);
            if (range.containsPoint(point)) {
                logOne("got point");
                pointsInRange.push(point);
            }
        }

        logOne("finished with current");
        if ( !this.northWest ) {
            log("no childs found", pointsInRange);
            return pointsInRange;
        }

        pointsInRange = pointsInRange.concat(this.northWest.queryRange(range));
        log("childs from northWest", pointsInRange);
        pointsInRange = pointsInRange.concat(this.northEast.queryRange(range));
        log("childs from northEast", pointsInRange);
        pointsInRange = pointsInRange.concat(this.southWest.queryRange(range));
        log("childs from southWest", pointsInRange);
        pointsInRange = pointsInRange.concat(this.southEast.queryRange(range));
        log("childs from southEast", pointsInRange);

        log("final childs", pointsInRange);
        return pointsInRange;
    };

//---------- end Классы QuadTree ----------------

    /**
     * @param tiles {[[x,y], [x,y],...]}
     * @constructor
     */
    var QuadTree = function (tiles) {
        // определяем границы
        var minX = 0,
            maxX = 0,
            minY = 0,
            maxY = 0
        ;

        var i;

        for (i in tiles) {
            minX = Math.min(minX, tiles[i][0]);
            maxX = Math.max(maxX, tiles[i][0]);
            minY = Math.min(minY, tiles[i][1]);
            maxY = Math.max(maxY, tiles[i][1]);
        }

        var width = maxX - minX + 1,
            height = maxY - minY + 1
        ;
//        width  = minX > 0 ? width  : width  + 1;
//        height = minY > 0 ? height : height + 1;

        var rect = new Rect(new Point(minX, minY), new Size(width, height));
        this.rootNode = new QuadTreeNode(this.aabbFromRect(rect));

        var success = false;
        for (i in tiles) {
            success = this.rootNode.insert(tiles[i]);
        }

        log("success", success);

    };
    /**
     * @param rect  {Rect}
     * @returns     {AABB}
     */
    QuadTree.prototype.aabbFromRect = function (rect)
    {
        var halfSize = new Size(rect.size.w / 2, rect.size.h / 2),
            center   = new Point(rect.origin.x + halfSize.w, rect.origin.y + halfSize.h);

        return new AABB(center, halfSize);
    };
    /**
     * @param rect {{x:, y:, w:, h:}}
     */
    QuadTree.prototype.tilesInRect = function (rect)
    {
        var rect = new Rect(new Point(rect.x, rect.y), new Size(rect.w, rect.h));

        return this.rootNode.queryRange(this.aabbFromRect(rect));
    };

    return QuadTree;
});

