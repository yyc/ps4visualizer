$(document).ready(function(){
  var margins = [0, 0, 50, 50] // up down left right
  var w = 7000,
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
      .style("pointer-events", "none")
      .append("g")
    	.attr("transform", "translate(" + 50 + "," + 50 + ")");

  var file = window.location.hash.substring(1);
  if(file == ""){
    file = "actors.txt";
  }
  $.get(file, updateText);
  
  $("#file").change(function(){
    var value = $(this).val();
    if(value != ""){
      window.location.hash = "#" + value;
      location.reload();
    }
  })

  function updateText(text){
    var db = DBParser(text);
    update(db);
  }
  function update(db){
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
    var nodes = tree.nodes(db).reverse(),
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
      return "translate(" + d.x + "," + d.y + ")"; })
     .on("click", click);


  
    nodeEnter.append("svg:circle")
     .attr("r", 5)
     .style("fill", "#fff")
//     nodeEnter.on("style", function(d, i){alert(d, i);});

  
    nodeEnter.append("svg:text")
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

    // Transition nodes to their new position.
    var nodeUpdate = node.transition()
        .duration(500)
        .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
  
    nodeUpdate.select("circle")
        .attr("r", 4.5)
        .style("fill", function(d) { return d._children ? "lightsteelblue" : "#fff"; });
  
    nodeUpdate.select("text")
        .style("fill-opacity", 1);
  
    // Transition exiting nodes to the parent's new position.
    var nodeExit = node.exit().transition()
        .duration(500)
        .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
        .remove();
  
    nodeExit.select("circle")
        .attr("r", 1e-6);
  
    nodeExit.select("text")
        .style("fill-opacity", 1e-6);
    // Update the links…
    var link = svg.selectAll("path.link")
        .data(links, function(d) { return d.target.id; });
  
    // Enter any new links at the parent's previous position.
    link.enter().insert("path", "g")
        .attr("class", "link")
        .attr("d", function(d) {
          var o = {x: source.x0, y: source.y0};
          return diagonal({source: o, target: o});
        });
  
    // Transition links to their new position.
    link.transition()
        .duration(500)
        .attr("d", diagonal);
  
    // Transition exiting nodes to the parent's new position.
    link.exit().transition()
        .duration(500)
        .attr("d", function(d) {
          var o = {x: d.x, y: d.y};
          return diagonal({d: o, d: o});
        })
        .remove();
  
    // Stash the old positions for transition.
    nodes.forEach(function(d) {
      d.x0 = d.x;
      d.y0 = d.y;
    });
  }
  function click(d, i) {
    console.log("clickity");
    if (d.children) {
    	d._children = d.children;
    	d.children = null;
    } else {
    	d.children = d._children;
    	d._children = null;
    }
    update(d);
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
        obj.children[1] = parseTree(db, n + 1, obj, true);
        obj.children[0] = parseTree(db, n + 1, obj, false);
//       }
    } else if(node.weight == undefined){ // null node
      obj.name = null; 
    }
    return obj;
  }
  var tree = parseTree(db, 0, null);
  return tree;
}
