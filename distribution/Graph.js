/*
Graph implemented as a modified incidence list. O(1) for every typical
operation, even `removeNode()` ( **O(1) amortized** ).

## Overview example:

```js
var graph = new Graph;
graph.addNode('A'); // => a node object. For more info, log the output or check
                    // the documentation for addNode
graph.addNode('B');
graph.addNode('C');
graph.addEdge('A', 'C'); // => an edge object
graph.addEdge('A', 'B');
graph.getEdge('B', 'A'); // => undefined. Directed edge!
graph.getEdge('A', 'B'); // => the edge object previously added
graph.getInEdgesOf('B'); // => array of edge objects, in this case only one;
                         // connecting A to B
graph.getOutEdgesOf('A'); // => array of edge objects, one to B and one to C
graph.getAllEdgesOf('A'); // => all the in and out edges. Edge directed toward
                          // the node itself are only counted once
forEachNode(function(nodeObject) {
  console.log(node);
});
forEachEdge(function(edgeObject) {
  console.log(edgeObject);
});
graph.removeNode('C'); // => 'C'. The edge between A and C also removed
graph.removeEdge('A', 'B'); // => the edge object removed
```

## Properties:

- nodeSize: total number of nodes.
- edgeSize: total number of edges.
*/


(function() {
  var Graph;

  Graph = (function() {
    function Graph() {
      this._nodes = {};
      this.nodeSize = 0;
      this.edgeSize = 0;
    }

    Graph.prototype.addNode = function(id) {
      /*
      The `id` is a unique identifier for the node, and should **not** change
      after it's added. It will be used for adding, retrieving and deleting
      related edges too.
      
      Note that JavaScript's object hashes the id `'2'` and `2` to the same key,
      so please stick with one single id data type for a same graph.
      
      _Returns:_ the node object. Feel free to attach additional custom properties
      on it for graph algorithms' needs. **Undefined if node id already exists**,
      as to avoid accidental overrides.
      */
      if (!this._nodes[id]) {
        this.nodeSize++;
        return this._nodes[id] = {
          _id: id,
          _outEdges: {},
          _inEdges: {},
          _edgeCount: 0
        };
      }
    };

    Graph.prototype.getNode = function(id) {
      /*
      _Returns:_ the node object. Feel free to attach additional custom properties
      on it for graph algorithms' needs.
      */
      return this._nodes[id];
    };

    Graph.prototype.removeNode = function(id) {
      /*
      _Returns:_ the node object removed, or undefined if it didn't exist in the
      first place.
      */

      var nodeToRemove;

      nodeToRemove = this._nodes[id];
      if (!nodeToRemove) {

      } else {
        this.edgeSize -= this._nodes[id]._edgeCount;
        this.nodeSize--;
        delete this._nodes[id];
        return nodeToRemove;
      }
    };

    Graph.prototype.addEdge = function(fromId, toId, weight) {
      var edgeToAdd, fromNode, toNode;

      if (weight == null) {
        weight = 1;
      }
      /*
      `fromId` and `toId` are the node id specified when it was created using
      `addNode()`. `weight` is optional and defaults to 1. Ignoring it effectively
      makes this an unweighted graph. Under the hood, `weight` is just a normal
      property of the edge object.
      
      _Returns:_ the edge object created. Feel free to attach additional custom
      properties on it for graph algorithms' needs. **Or undefined** if the nodes
      of id `fromId` or `toId` aren't found, or if an edge already exists between
      the two nodes.
      */

      if (this.getEdge(fromId, toId)) {
        return;
      }
      fromNode = this._nodes[fromId];
      toNode = this._nodes[toId];
      if (!fromNode || !toNode) {
        return;
      }
      edgeToAdd = {
        _fromId: fromId,
        _toId: toId,
        weight: weight
      };
      fromNode._outEdges[toId] = edgeToAdd;
      toNode._inEdges[fromId] = edgeToAdd;
      fromNode._edgeCount++;
      this.edgeSize++;
      if (fromNode !== toNode) {
        toNode._edgeCount++;
      }
      return edgeToAdd;
    };

    Graph.prototype.getEdge = function(fromId, toId) {
      /*
      _Returns:_ the edge object, or undefined if the nodes of id `fromId` or
      `toId` aren't found.
      */

      var fromNode, toNode;

      fromNode = this._nodes[fromId];
      toNode = this._nodes[toId];
      if (!fromNode && !toNode) {

      } else if (!fromNode) {
        if (toNode._inEdges[fromId]) {
          delete toNode._inEdges[fromId];
        }
      } else if (!toNode) {
        if (fromNode._outEdges[toId]) {
          delete fromNode._outEdges[toId];
        }
      } else {
        if (!fromNode._outEdges[toId] && toNode._inEdges[fromId]) {
          delete toNode._inEdges[fromId];
        } else if (!toNode._inEdges[fromId] && fromNode._outEdges[toId]) {
          delete fromNode._outEdges[toId];
        } else {
          return fromNode._outEdges[toId];
        }
      }
    };

    Graph.prototype.removeEdge = function(fromId, toId) {
      /*
      _Returns:_ the edge object removed, or undefined of edge wasn't found.
      */

      var edgeToDelete, fromNode, toNode;

      fromNode = this._nodes[fromId];
      toNode = this._nodes[toId];
      edgeToDelete = this.getEdge(fromId, toId);
      if (!edgeToDelete) {
        return;
      }
      delete fromNode._outEdges[toId];
      delete toNode._inEdges[fromId];
      this.edgeSize--;
      return edgeToDelete;
    };

    Graph.prototype.getInEdgesOf = function(nodeId) {
      /*
      _Returns:_ an array of edge objects that are directed toward the node, or
      empty array if none exists.
      */

      var edge, fromId, inEdges, toNode;

      toNode = this._nodes[nodeId];
      if (!toNode) {
        return [];
      }
      inEdges = [];
      for (fromId in toNode._inEdges) {
        edge = this.getEdge(fromId, nodeId);
        if (edge) {
          inEdges.push(edge);
        }
      }
      return inEdges;
    };

    Graph.prototype.getOutEdgesOf = function(nodeId) {
      /*
      _Returns:_ an array of edge objects that go out of the node, or empty array
      if none exists.
      */

      var edge, fromNode, outEdges, toId;

      fromNode = this._nodes[nodeId];
      if (!fromNode) {
        return [];
      }
      outEdges = [];
      for (toId in fromNode._outEdges) {
        edge = this.getEdge(nodeId, toId);
        if (edge) {
          outEdges.push(edge);
        }
      }
      return outEdges;
    };

    Graph.prototype.getAllEdgesOf = function(nodeId) {
      /*
      **Note:** not the same as concatenating `getInEdgesOf()` and
      `getOutEdgesOf()`. Some nodes might have an edge pointing toward itself.
      This method solves that duplication.
      
      _Returns:_ an array of edge objects linked to the node, no matter if they're
      outgoing or coming. Duplicate edge created by self-pointing nodes are
      removed. Only one copy stays. Empty array if node has no edge.
      */

      var i, inEdges, outEdges, selfEdge, _i, _ref, _ref1;

      inEdges = this.getInEdgesOf(nodeId);
      outEdges = this.getOutEdgesOf(nodeId);
      if (inEdges.length === 0) {
        return outEdges;
      }
      selfEdge = this.getEdge(nodeId, nodeId);
      if (selfEdge) {
        for (i = _i = 0, _ref = inEdges.length; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
          if (inEdges[i] === selfEdge) {
            _ref1 = [inEdges[inEdges.length - 1], inEdges[i]], inEdges[i] = _ref1[0], inEdges[inEdges.length - 1] = _ref1[1];
            inEdges.pop();
            break;
          }
        }
      }
      return inEdges.concat(outEdges);
    };

    Graph.prototype.forEachNode = function(operation) {
      /*
      Traverse through the graph in an arbitrary manner, visiting each node once.
      Pass a function of the form `fn(nodeObject)`.
      
      _Returns:_ undefined.
      */

      var nodeId, nodeObject, _ref;

      _ref = this._nodes;
      for (nodeId in _ref) {
        nodeObject = _ref[nodeId];
        operation(nodeObject);
      }
    };

    Graph.prototype.forEachEdge = function(operation) {
      /*
      Traverse through the graph in an arbitrary manner, visiting each edge once.
      Pass a function of the form `fn(edgeObject)`.
      
      _Returns:_ undefined.
      */

      var edgeObject, nodeId, nodeObject, toId, _ref, _ref1;

      _ref = this._nodes;
      for (nodeId in _ref) {
        nodeObject = _ref[nodeId];
        _ref1 = nodeObject._outEdges;
        for (toId in _ref1) {
          edgeObject = _ref1[toId];
          operation(edgeObject);
        }
      }
    };

    return Graph;

  })();

  module.exports = Graph;

}).call(this);
