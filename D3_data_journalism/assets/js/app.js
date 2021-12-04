//Setting svg height and width
var svgWidth = 960;
var svgHeight = 500;

//Setting margins
var margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};

//Chart height and width
var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenXAxis = "poverty";
var chosenYAxis = "healthcare";

// function used for updating x-scale var upon click on axis label
////////////////
function xScale(data, chosenXAxis) {
  // create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(data, d => d[chosenXAxis])-1, d3.max(data, d => d[chosenXAxis])+1])
    .range([0, width]);

  return xLinearScale;

}

function yScale(data, chosenYAxis) {
  // create scales
  var yLinearScale = d3.scaleLinear()
    .domain([0, d3.max(data, d => d[chosenYAxis])+1])
    .range([height,0]);

  return yLinearScale;

}
///////////////

// function used for updating xAxis var upon click on axis label
///////////////
function renderxAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}

function renderyAxes(newYScale, yAxis) {
  var leftAxis = d3.axisLeft(newYScale);

  yAxis.transition()
    .duration(1000)
    .call(leftAxis);

  return yAxis;
}

//////////////

// function used for updating circles group with a transition to
// new circles
//////////////
function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]))
    .attr("cy", d => newYScale(d[chosenYAxis]));

  return circlesGroup;
}
function renderText(textGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

  textGroup.transition()
    .duration(1000)
    .attr("x", d => newXScale(d[chosenXAxis]))
    .attr("y", d => newYScale(d[chosenYAxis]));

  return textGroup;
}
//////////////

// function used for updating circles group with new tooltip
/////////////
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {

  var labelX;
  var labelY;

  if (chosenXAxis === "poverty") {
    labelX = "In Poverty (%)";
  }
  else if (chosenXAxis === "age") {
    labelX = "Age (Median)"
  }
  else {
    labelX = "Household Income (Median)";
  }

  if (chosenYAxis === "healthcare") {
    labelY = "Lacks Healthcare (%)";
  }
  else if (chosenYAxis === "smokes") {
    labelY = "Smokes (%)"
  }
  else {
    labelY = "Obese (%)";
  }


  var toolTip = d3.tip()
    .attr("class", "tooltip")
    .offset([80, -60])
    .html(function (d) {
      return (`${labelY}:${d[chosenYAxis]}<br>${labelX}:${d[chosenXAxis]}`);
    });

  circlesGroup.call(toolTip);

  circlesGroup.on("mouseover", function (data) {
    toolTip.show(data);
  })
    // onmouseout event
    .on("mouseout", function (data, index) {
      toolTip.hide(data);
    });

  return circlesGroup;
}
//////////////

var url = "assets/data/data.csv";
// Retrieve data from the CSV file and execute everything below
d3.csv(url).then(function (data) {
  
  console.log(data)

  // parse data
  data.forEach(function (md) {
    md.poverty = +md.poverty;
    md.healthcare = +md.healthcare;
    md.age = +md.age;
    md.smokes = +md.smokes;
    md.income = +md.income;
    md.obesity = +md.obesity;
    console.log(md.abbr)

  });


  // xLinearScale function above csv import
  var xLinearScale = xScale(data, chosenXAxis);
  var yLinearScale = yScale(data, chosenYAxis);


  // Create initial axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // append x axis
  var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  var yAxis = chartGroup.append("g")
    .classed("y-axis", true)
    .attr("transform", `translate(0, 0)`)
    .call(leftAxis);



  // append initial circles
  var circlesGroup = chartGroup.selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d[chosenYAxis]))
    .attr("r", 15)
    .attr("fill", "cyan")
    .attr("opacity", ".5")
    .attr("stroke", "black");

  
  console.log(data)

  var textGroup = chartGroup.selectAll("text")
    .data(data)
    .enter()
    .append("text")
    .attr("x", d => xLinearScale(d[chosenXAxis]))
    .attr("y", d => yLinearScale(d[chosenYAxis]))
    .text(function(d) {return d.abbr})
    .attr("font-family", "sans-serif")
    .attr("font-size", "10px")
    .attr("fill", "black")
    .attr("text-anchor", "middle")
    .attr("alignment-baseline", "middle");
    


  // Create group for x-axis labels
  var labelsGroupX = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

  var labelsGroupY = chartGroup.append("g")
    .attr("transform", `translate(0, ${height / 2})`);

  var povertyLabel = labelsGroupX.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "poverty") // value to grab for event listener
    .classed("active", true)
    .text("In Poverty (%)");

  var ageLabel = labelsGroupX.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "age") // value to grab for event listener
    .classed("inactive", true)
    .text("Age (Median)");

  var incomeLabel = labelsGroupX.append("text")
    .attr("x", 0)
    .attr("y", 60)
    .attr("value", "income") // value to grab for event listener
    .classed("inactive", true)
    .text("Household Income (Median)");


  var healthcareLabel = labelsGroupY.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", 0 + (height / 16))
    .attr("y", 0 - 25)
    .attr("value", "healthcare") // value to grab for event listener
    .classed("active", true)
    .text("Lacks Healthcare (%)");

  var smokesLabel = labelsGroupY.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", 0 + (height / 16))
    .attr("y", 0 - 50)
    .attr("value", "smokes") // value to grab for event listener
    .classed("inactive", true)
    .text("Smokes (%)");

  var obesityLabel = labelsGroupY.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", 0 + (height / 16))
    .attr("y", 0 - 75)
    .attr("value", "obesity") // value to grab for event listener
    .classed("inactive", true)
    .text("Obese (%)");
    


  // updateToolTip function above csv import
  var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);


  // x axis labels event listener
  labelsGroupX.selectAll("text")
    .on("click", function () {
      // get value of selection
      var valueX = d3.select(this).attr("value");
      if (valueX !== chosenXAxis) {

        // replaces chosenXAxis with value
        chosenXAxis = valueX;

        // updates x scale for new data
        xLinearScale = xScale(data, chosenXAxis);

        // updates x axis with transition
        xAxis = renderxAxes(xLinearScale, xAxis);

        // updates circles with new x values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
        textGroup = renderText(textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
        

        // changes classes to change bold text
        if (chosenXAxis === "poverty") {
          povertyLabel
            .classed("active", true)
            .classed("inactive", false);
          ageLabel
            .classed("active", false)
            .classed("inactive", true);
          incomeLabel
            .classed("active", false)
            .classed("inactive", true);
          
        }
        else if (chosenXAxis === "age") {
          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
          ageLabel
            .classed("active", true)
            .classed("inactive", false);
          incomeLabel
            .classed("active", false)
            .classed("inactive", true);

        }
        else {
          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
          ageLabel
            .classed("active", false)
            .classed("inactive", true);
          incomeLabel
            .classed("active", true)
            .classed("inactive", false);

        }
      }
    });

    labelsGroupY.selectAll("text")
    .on("click", function () {
      // get value of selection
      var valueY = d3.select(this).attr("value");
      if (valueY !== chosenYAxis) {

        // replaces chosenXAxis with value
        chosenYAxis = valueY;

        // updates x scale for new data
        yLinearScale = yScale(data, chosenYAxis);

        // updates x axis with transition
        yAxis = renderyAxes(yLinearScale, yAxis);

        // updates circles with new x values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
        textGroup = renderText(textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

        // changes classes to change bold text
        if (chosenYAxis === "healthcare") {
          healthcareLabel
            .classed("active", true)
            .classed("inactive", false);
          smokesLabel
            .classed("active", false)
            .classed("inactive", true);
          obesityLabel
            .classed("active", false)
            .classed("inactive", true);

        }
        else if (chosenYAxis === "smokes") {
          healthcareLabel
            .classed("active", false)
            .classed("inactive", true);
          smokesLabel
            .classed("active", true)
            .classed("inactive", false);
          obesityLabel
            .classed("active", false)
            .classed("inactive", true);

        }
        else {
          healthcareLabel
            .classed("active", false)
            .classed("inactive", true);
          smokesLabel
            .classed("active", false)
            .classed("inactive", true);
          obesityLabel
            .classed("active", true)
            .classed("inactive", false);

        }
      }
    })
})


