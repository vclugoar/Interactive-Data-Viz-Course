/* CONSTANTS AND GLOBALS */

const 
  margin = {top: 150, right: 20, bottom: 300, left: 110},
  
  cellSize = 40,
  paddingInner = 0.2,
 // margin = { top: 200, bottom: 200, left: 200, right: 200 },
  width = 750 -margin.left - margin.right,
  height = 300 + margin.top - margin.bottom,
  categoriesCount = 3, 
  legendWidth = 60,
  default_selection = "all",
  default_reason = "all", 
  default_sex = "all",
  // bar
  margin1 = { top: 20, bottom: 40, left: 40, right: 40 },
  width1 = 550 - margin1.left,
  height1 = window.innerHeight / 3,
  paddingInner1 = 0.2
  ;

// these variables allow us to access anything we manipulate in init() but need access to in draw().
// All these variables are empty before we assign something to them.
let svg;
let barsvg;
let x; 
let y;
let colorFn;  
let colorFn2;
let xAxis; 
let yAxis;
let xAxis1; 
let yAxis1; 
let value;
let maxValue;
let minValue;

/* APPLICATION STATE */
let state = {
//   hover: {
//     subject_race: null 
//   },
//   selectedOutcome: default_selection, 
//   selectedReason: default_reason ,
//   selectedSex: default_sex // + YOUR FILTER SELECTION
};

/* LOAD DATA */
d3.csv("../data/heatmap.csv", d3.autoType).then(data => {
  state.data = data, 
  console.log(state.data)
  init();
})

/* INITIALIZING FUNCTION */
function init() {

  // tooltip 
  tooltip = d3.select("body").append("div").attr("class", "toolTip");

  // SCALES
  x = d3
    .scaleBand()
    .domain(state.data.map((d) => d.Session))
    .range([0, width-300]);

  y = d3
    .scaleBand()
    .domain(state.data.map((d) => d.District))
    .range([height, -88]);

  colorFn = d3
      .scaleSequential(d3.interpolatePuBuGn)
      .domain(d3.extent(state.data, d => d.Rate));

  
  colorFn2 = d3
      .scaleSequential(d3.interpolatePuRd)
      .domain(d3.extent(state.data, d => d.Rate));

  values = state.data.map(d => d.Rate);
  maxValue = d3.max(values);
  minValue = d3.min(values);  


  // create svg element for heatmap 
  svg = d3
    .select("#d3-container")
    .attr("align","center")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")


  // y and x axis
  xAxis = d3.axisBottom(x);
  yAxis = d3.axisLeft(y);


  svg.append('g')
    .classed('y axis', true)
    .call(yAxis);

  svg
  .append('g')
  .classed('x axis', true)
  .attr('transform', 'translate(0,' + height + ')')
  .call(xAxis)


  // call the draw function 
  draw(); 
}  

function draw() { 


const rect = svg
    .selectAll("rect")
    .data(state.data)
    .join(
      enter =>
        enter
          .append("rect")
          .attr('width', cellSize +15)
          .attr('height', cellSize )
          .attr('x', d => x(d.Session))
          //put the cells on top of the y increments to prevent x-axis labels overlapping
          .attr('y', d => y(d.District))
          //set colors based on count
          .attr('fill', d => { 
            if (d.Rate >= 0 && d.Rate <= 50)  return "#178bdd";
            else if (d.Rate >= 51 && d.Rate <= 80) return "#1d1ebc"
            else return "00009c" })
          
          //colorFn(d.Rate)
          .style("stroke", "#d6cdb7")
         // .attr("fill", d => (legend.selected ? color(d.count) : "white")) 
         .on("mouseover", function(d){
          tooltip
            .style("left", d3.event.pageX - 50 + "px")
            .style("top", d3.event.pageY - 70 + "px")
            .style("display", "inline-block")
            .html("Session: " + (d.Session) + "<br>" + "Rate: " + (d.Rate)); })
  
         .on("mouseout", function(d){ tooltip.style("display", "none")})  
    )
    
    ;
     
  // legend code

const group = svg.append("g");

const legend = group
       .attr("class", "leg")
       .attr(
         "transform",
         `translate(-10, 200)`
        );
const categories = [...Array(categoriesCount)].map((_, i) => {
    const upperBound = maxValue / categoriesCount * (i + 1);
    const lowerBound = maxValue / categoriesCount * i;

   return {
     upperBound,
     lowerBound,
     color: d3.interpolatePuBuGn(upperBound / maxValue), 
     selected: true 
     
    };
});

legend
   .selectAll("rect")
   .data(state.data)
   .enter()
   .append('rect')
  // .attr('fill', d => d.color)
  .attr('fill', d => { 
    if (d.Rate >= 0 && d.Rate <= 50)  return "#178bdd";
    else if (d.Rate >= 51 && d.Rate <= 80) return "#1d1ebc";
    else return "00009c" })
   .attr('x', (d, i) => legendWidth * i)
   .attr('width', legendWidth)
   .attr('height', 15);

 legend
    .selectAll("text")
    .data(categories)
    .join("text")
    .attr("transform", "rotate(90)")
    .attr("y", (d, i) => -legendWidth * i)
    .attr("dy", -30)
    .attr("x", 18)
    .attr("text-anchor", "start")
    .attr("font-size", 11)
    .text(d => `${d.lowerBound.toFixed()} - ${d.upperBound.toFixed(0)}`);

  legend
    .append("text")
    .attr("dy", -5)
    .attr("font-size", 14)
    .attr("text-decoration", "underline");
  

  
}
