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

    var Point = function (x, y)
    {
        this.x = x;
        this.y = y;
    };
    var Size = function (w, h)
    {
        this.w = w;
        this.h = h;
    };
    /**
     * @param origin Point
     * @param size   Size
     * @constructor
     */
    var Rect = function (origin, size)
    {
        this.origin = origin;
        this.size = size;
    };
    /**
     * @param center  Point
     * @param halfDim Size
     * @constructor
     */
    var AABB = function (center, halfDim)
    {
        this.center = center;
        this.halfDim = halfDim;
    };
    /**
     * @param point Array [x,y]
     */
    AABB.prototype.containsPoint = function(point)
    {
        var x = point[0];
        var y = point[1];
        if ( (x >= ( this.center.x - this.halfDim.w ) && (x < ( this.halfDim.w + this.center.x ) )) &&
             (y >= ( this.center.y - this.halfDim.h ) && (y < ( this.halfDim.h + this.center.y ) )) ) {
            return true;
        }

        return false;
    };
    AABB.prototype.intersectsAABB = function (otherAABB)
    {
        var leftTop     = new Point(this.center.x - this.halfDim.w, this.center.y - this.halfDim.h), // -1
            rightTop    = new Point(this.center.x + this.halfDim.w, this.center.y - this.halfDim.h),
            rightBottom = new Point(this.center.x + this.halfDim.w, this.center.y + this.halfDim.h),
            leftBottom  = new Point(this.center.x - this.halfDim.w, this.center.y + this.halfDim.h)
        ;

        var oLeftTop     = new Point(otherAABB.center.x - otherAABB.halfDim.w, otherAABB.center.y - otherAABB.halfDim.h),
            oRightTop    = new Point(otherAABB.center.x + otherAABB.halfDim.w, otherAABB.center.y - otherAABB.halfDim.h),
            oRightBottom = new Point(otherAABB.center.x + otherAABB.halfDim.w, otherAABB.center.y + otherAABB.halfDim.h),
            oLeftBottom  = new Point(otherAABB.center.x - otherAABB.halfDim.w, otherAABB.center.y + otherAABB.halfDim.h)
        ;
        var otherPoints = [oLeftTop, oRightTop, oRightBottom, oLeftBottom];

        for (var i in otherPoints) {
            var point = otherPoints[i];
            if ( point.x > leftTop.x     && point.y > leftTop.y     &&
                 point.x < rightTop.x    && point.y > rightTop.y    &&
                 point.x < rightBottom.x && point.y < rightBottom.y &&
                 point.x > leftBottom.x  && point.y < leftBottom.y  ) {
                return true;
            }
        }

        return false;
    };

    /**
     * @param boundary AABB
     * @constructor
     */
    var QuadTreeNode = function (boundary)
    {
        log("QuadTreeNode AABB:", boundary);

        var center = new Point(boundary.center.x, boundary.center.y),
            halfSize = new Size(boundary.halfDim.w, boundary.halfDim.h)
        ;

        this.boundary = new AABB(center, halfSize);

        this.capacity = 4;

        this.points = [];

        this.northWest = undefined;
        this.northEast = undefined;
        this.southWest = undefined;
        this.southEast = undefined;
    };

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

        halfSize = new Size(this.boundary.halfDim.w / 2, this.boundary.halfDim.h / 2);
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
     * @param range AABB
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
     * @param tiles Array of pairs [x,y]
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


        var halfSize   = new Size((maxX - minX) / 2 + 1, (maxY - minY) / 2 + 1),
            center = new Point(minX + halfSize.w, minY + halfSize.h)
        ;
        var aabb = new AABB(center, halfSize);

        this.rootNode = new QuadTreeNode(aabb);

        var success = false;
        for (i in tiles) {
            success = this.rootNode.insert(tiles[i]);
        }

        log("success", success);

    };
    /**
     * @param rect Rect
     */
    QuadTree.prototype.tilesInRect = function (rect)
    {
        rect = new Rect(new Point(rect.x, rect.y), new Size(rect.w, rect.h));

        var halfSize = new Size(rect.size.w / 2, rect.size.h / 2),
            center   = new Point(rect.origin.x + halfSize.w, rect.origin.y + halfSize.h);

        var aabb = new AABB(center, halfSize);
        return this.rootNode.queryRange(aabb);
    };

    return QuadTree;
});

