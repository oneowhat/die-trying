(function(exports) {

  function QuadTree (area, maxObjects, maxLevels, level) {
    if (area === undefined) {
      console.error('QuadTree missing area bounds');
    }
    this.area = area;
    this.maxObjects = maxObjects || 10;
    this.maxLevels = maxLevels || 4;
    this.level = level || 0;
    this.nodes = [];
    this.objects = [];
  }

  QuadTree.prototype.split = function() {
    var nodeLevel = this.level + 1;
    var nodeWidth = Math.round(this.area.width / 2);
    var nodeHeight = Math.round(this.area.height / 2);

    var topRight = {
      x: this.area.x + nodeWidth,
      y: this.area.y,
      height: nodeHeight,
      width: nodeWidth
    };

    var topLeft = {
      x: this.area.x,
      y: this.area.y,
      height: nodeHeight,
      width: nodeWidth
    };

    var bottomLeft = {
      x: this.area.x,
      y: this.area.y + nodeHeight,
      height: nodeHeight,
      width: nodeWidth
    };
    
    var bottomRight = {
      x: this.area.x + nodeWidth,
      y: this.area.y + nodeHeight,
      height: nodeHeight,
      width: nodeWidth
    };

    this.nodes.push(new QuadTree(topRight, this.maxObjects, this.maxLevels, nodeLevel));
    this.nodes.push(new QuadTree(topLeft, this.maxObjects, this.maxLevels, nodeLevel));
    this.nodes.push(new QuadTree(bottomLeft, this.maxObjects, this.maxLevels, nodeLevel));
    this.nodes.push(new QuadTree(bottomRight, this.maxObjects, this.maxLevels, nodeLevel));
  };

  QuadTree.prototype.indexOf = function(areaToFind) {
    var a = areaToFind;
    var verticalMidpoint = this.area.x + this.area.width / 2;
    var horizontalMidpoint = this.area.y + this.area.height / 2;

    var fitsTop = a.y < horizontalMidpoint && a.y + a.height < horizontalMidpoint;
    var fitsBottom = a.y > horizontalMidpoint;
    var fitsLeft = a.x < verticalMidpoint && a.x + a.width < verticalMidpoint;
    var fitsRight = a.x > verticalMidpoint;

    if (fitsTop && fitsRight) {
      return 0;
    } else if (fitsTop && fitsLeft) {
      return 1;
    } else if (fitsBottom && fitsLeft) {
      return 2;
    } else if (fitsBottom && fitsRight) {
      return 3;
    }

    return -1;
  };

  QuadTree.prototype.insert = function(item) {

    var i = 0, idx;

    // if we already split, add to children
    if (this.nodes[0] !== undefined) {
      idx = this.indexOf(item);
      if (idx !== -1) {
        this.nodes[idx].insert(item);
        return;
      }
    }

    this.objects.push(item);

    if (this.objects.length > this.maxObjects && this.level < this.maxLevels) {
      if (this.nodes[0] === undefined) {
        this.split();
      }

      while (i < this.objects.length) {
        idx = this.indexOf(this.objects[i]);
        if (idx !== -1) {
          this.nodes[idx].insert(this.objects.splice(i, 1)[0]);
        } else {
          i++;
        }
      }
    }
  };

  QuadTree.prototype.all = function() {
    var i = 0;
    var result = this.objects;

    for(i = 0; i < this.nodes.length; i++) {
      result = result.concat(this.nodes[i].all());
    }

    return result;

  };

  QuadTree.prototype.couldCollideWith = function (item) {
    var idx = this.indexOf(item);
    var result = this.objects;
    var i;

    if (this.nodes[0] !== undefined) {
      if (idx !== -1) {
        result = result.concat(this.nodes[idx].couldCollideWith(item));
      } else {
        for (i = 0; i < this.nodes.length; i++) {
          result = result.concat(this.nodes[i].couldCollideWith(item));
        }
      }
    }

    return result;
  };

  QuadTree.prototype.clear = function() {
    this.objects = [];

    this.nodes.forEach(function(node) {
      node.clear();
    });

    this.nodes = [];
  };

  exports.QuadTree = QuadTree;

})(this);

