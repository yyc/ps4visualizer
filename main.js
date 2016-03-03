$(document).ready(function(){
  var height = 1000;
  var width = 5000;
  var rx = width / 2;
  var ry = height / 2;
  var diagonal = d3.svg.diagonal.radial()
    .projection(function(d) { return [d.y, d.x / 180 * Math.PI]; });
  var cluster = d3.layout.cluster()
    .nodeSize(5)
    .value(function(d){
      return d.value
    });
  var vis = d3.select("#canvas")
    .append("svg")
    .attr("height", height + "px")
    .attr("width", width + "px");
  vis.append("svg:path")
      .attr("class", "arc")
      .attr("d", d3.svg.arc().innerRadius(ry - 120).outerRadius(ry).startAngle(0).endAngle(2 * Math.PI))
//      .on("mousedown", mousedown);
    $.get("TestDB_1.txt", function(text){
      var db = DBParser(text);
      var nodes = cluster.nodes(db);

      var link = vis.selectAll("path.link")
          .data(cluster.links(nodes))
        .enter().append("svg:path")
          .attr("class", "link")
          .attr("d", diagonal);
    
      var node = vis.selectAll("g.node")
          .data(nodes)
        .enter().append("svg:g")
          .attr("class", "node")
          .attr("transform", function(d) { return "rotate(" + (d.x - 90) + ")translate(" + d.y + ")"; })
/*
      vis.selectAll("circle .nodes")
        .data(nodes)
        .enter()
        .append("svg:circle")
        .attr("class", "nodes")
//        .attr("r", function(d){ return d.weight; })
        .attr("fill", "black") ;
*/
    });
//  visualizer.text("CS2020 PS4 Visualizer").select("#canvas");    
});

function DBParser(text){
  var linesArray = text.split("&&");
  var db = linesArray.map(function(line){
    lineary = line.split("||");
    var obj = {
      depth: parseInt(lineary[0]),
      value: lineary[1]
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
    if(parent == null){
      var prop = [];
    } else{
      var prop = parent.properties.slice();
      obj.hasParent = hasParent;
      if(hasParent){
        prop.push(parent.value);
      }
    }
    obj.properties = prop;
    i++;
    if(node.weight){ // neither leaf node nor undefined
      obj.children = []
      obj.children[0] = parseTree(db, n + 1, obj, true);
      obj.children[1] = parseTree(db, n + 1, obj, false);
    } else if(node.weight == undefined){ // null node
      obj.value = null; 
    }
    return obj;
  }
  var tree = parseTree(db, 0, null);
  return tree;
}
