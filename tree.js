$(document).ready(function(){
  var margins = [0, 0, 50, 50] // up down left right
  var w = 5000,
    h = 5000,
    rx = w / 2,
    ry = h / 2,
    rotate = 0;
  
  var tree = d3.layout.tree()
      .size([h, w]);

  var diagonal = d3.svg.diagonal()
    .projection(function(d) { return [d.x, d.y]; });
    
  var svg = d3.select("#canvas").append("svg")
      .attr("width", w + "px")
      .attr("height", h + "px")
      .append("g")
    	.attr("transform", "translate(" + 50 + "," + 10 + ")");

  
  $.get("TestDB_4.txt", update);

  function update(text){
    var db = DBParser(text);
    var i = 0;
/*
      var nodes = tree.nodes(db);
      d3.select()
      .data(nodes)
      .enter()
      .append("svg:circle")
      .attr("class", "nodes")
      .attr("class", "nodes")
      .attr("r", 5)
      .attr("fill", "black");
*/
    // Compute the new tree layout.
    var nodes = tree.nodes(db),
     links = tree.links(nodes);
  
    // Normalize for fixed-depth.
    nodes.forEach(function(d) { d.y = d.depth * 50; });
  
    // Declare the nodesâ€¦
    var node = svg.selectAll("g.node")
     .data(nodes, function(d) { return d.id || (d.id = ++i); });
  
    // Enter the nodes.
    var nodeEnter = node.enter().append("g")
     .attr("class", "node")
     .attr("transform", function(d) { 
      return "translate(" + d.x + "," + d.y + ")"; });
  
    nodeEnter.append("circle")
     .attr("r", 5)
     .style("fill", "#fff");
  
    nodeEnter.append("text")
     .attr("y", function(d) { 
      return d.children || d._children ? -13 : 13; })
     .attr("dy", ".35em")
     .attr("text-anchor", function(d) { 
      return d.children || d._children ? "end" : "start"; })
     .text(function(d) { return d.name; })
     .style("fill-opacity", 1);
  
    // Declare the linksâ€¦
    var link = svg.selectAll("path.link")
     .data(links, function(d) { return d.target.id; });
  
    // Enter the links.
    link.enter().insert("path", "g")
     .attr("class", "link")
     .attr("d", diagonal);


  }

  
});


function DBParser(text){
  var linesArray = text.split("&&");
  var db = linesArray.map(function(line){
    lineary = line.split("||");
    var obj = {
      depth: parseInt(lineary[0]),
      name: lineary[1]
      };
    if(lineary[2]){
      obj.weight = parseInt(lineary[2]);
    }
    return obj;
  });
  var i = 0; // so db acts as a stream
  function parseTree(db, n, parent, hasParent){
    var node = db[i];
    var obj = node;
    obj.parent = parent;
    obj.depth = n;
    if(parent == null){
      var prop = [];
    } else{
      var prop = parent.properties.slice();
      obj.hasParent = hasParent;
      if(hasParent){
        prop.push(parent.name);
      }
    }
    obj.properties = prop;
    i++;
    if(node.weight){ // neither leaf node nor undefined
/*
      if(node.weight == 1){
      //Trim tree to leaf
        var right = parseTree(db, n, parent, true);
        var left = parseTree(db, n, parent, false);
        if(right.name == null){
          left.hasParent = hasParent;
          return left;
        } else{
          right.hasParent = hasParent;
          return right;
        }
      } else{
*/
        obj.children = [];
        obj.children[0] = parseTree(db, n + 1, obj, true);
        obj.children[1] = parseTree(db, n + 1, obj, false);
//       }
    } else if(node.weight == undefined){ // null node
      obj.name = null; 
    }
    return obj;
  }
  var tree = parseTree(db, 0, null);
  return tree;
}
