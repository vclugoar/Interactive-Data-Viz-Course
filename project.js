/* CONSTANTS AND GLOBALS */

const 
  margin = {top: 150, right: 20, bottom: 300, left: 110},
  
  cellSize = 40,
  paddingInner = 0.2,
 // margin = { top: 200, bottom: 200, left: 200, right: 200 },
  width = 750 -margin.left - margin.right,
  height = 300 + margin.top - margin.bottom,
  categoriesCount = 6,
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
  hover: {
    subject_race: null 
  },
  selectedOutcome: default_selection, 
  selectedReason: default_reason ,
  selectedSex: default_sex // + YOUR FILTER SELECTION
};

/* LOAD DATA */
d3.csv("../data/u_nola.csv", d3.autoType).then(data => {
  state.data = data, 
  console.log(state.data)
  init();
})

/* INITIALIZING FUNCTION */
function init() {

  // UI ELEMENT SETUP for Heatmap 
  const selectElement = d3.select("#dropdown").on("change", function() {
    state.selectedOutcome = this.value; 
    console.log("new value is", this.value);
    draw(); 
  });

  // add in dropdown options from the unique values in the data
  selectElement
  .selectAll("option")
  .data([
    ...Array.from(new Set(state.data.map(d => d.outcome))),
    default_selection,
  ])
  .join("option")
  .attr("value", d => d)
  .text(d => d);

  // + SET SELECT ELEMENT'S DEFAULT VALUE (optional)
  // this ensures that the selected value is the same as what we have in state when we initialize the options
  selectElement.property("value", default_selection);
  //end of ui for heatmap 

  // ui element set up for bar chart 
    const selectElement2 = d3.select("#dropdown2").on("change", function() {
      state.selectedReason = this.value; 
      console.log("new value is", this.value);
      drawBar(); 
    });
  
    // add in dropdown options from the unique values in the data
    selectElement2
    .selectAll("option")
    .data([
      ...Array.from(new Set(state.data.map(d => d.reason_for_stop))),
      default_reason,
    ])
    .join("option")
    .attr("value", d => d)
    .text(d => d);
  
    // + SET SELECT ELEMENT'S DEFAULT VALUE (optional)
    // this ensures that the selected value is the same as what we have in state when we initialize the options
    selectElement2.property("value", default_reason);
    //end of ui for barchart 
  

  // SCALES
  x = d3
    .scaleBand()
    .domain(state.data.map((d) => d.year))
    .range([0, width-300]);

  y = d3
    .scaleBand()
    .domain(state.data.map((d) => d.subject_race))
    .range([height, -88]);

  colorFn = d3
      .scaleSequential(d3.interpolatePuRd)
      .domain(d3.extent(state.data, d => d.count));

  
  colorFn2 = d3
      .scaleSequential(d3.interpolatePuRd)
      .domain(d3.extent(state.data, d => d.count));

  values = state.data.map(d => d.count);
  maxValue = d3.max(values);
  minValue = d3.min(values);  

  // bar chart scales 
  /** SCALES */
  xScale = d3
    .scaleBand()
    .domain(state.data.map(d => d.outcome))
    .range([margin1.left, width1 - margin1.right])
    .paddingInner(paddingInner1);

  yScale = d3
    .scaleLinear()
    .domain([0, d3.max(state.data, d => d.count)])
    .range([height1 - margin1.bottom, margin1.top]);
   //.range([height1 - margin1.bottom, 0]);

  // create svg element for heatmap 
  svg = d3
    .select("#d3-container")
    .attr("align","center")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
    //.attr("align", "right");

  // create svg element for barchart 
  barsvg = d3
    .select("#d3-container2")
    .attr("align","center")
    .append("svg")
    .attr("width", width1 + margin1.left + margin1.right)
    .attr("height", height1 + margin1.top + margin1.bottom)
   //.attr("height", 200)
    .append("g")
    .attr("transform", "translate(" + margin1.left + "," + margin1.top + ")");
  
  // y and x axis
  xAxis = d3.axisBottom(x);
  yAxis = d3.axisLeft(y);

  // bar chart axes
   xAxis1 = d3.axisBottom(xScale);
   yAxis1 = d3.axisLeft(yScale).ticks(state.data.count);
   
  
  // call axes for barchart 
  svg
    .append('g')
    .classed('x axis', true)
    .attr('transform', 'translate(0,' + height + ')')
    .call(xAxis)


  svg.append('g')
    .classed('y axis', true)
    .call(yAxis);

  // call axes for bar chart
  

  // call the draw function 
  draw(); 
  drawBar();
}  

function draw() { 

  // filteredData = state.data.filter(d =>  
  //   d.outcome === state.selectedOutcome || state.selectedOutcome === default_selection);

 // let filteredData = state.data; 

  filteredData = state.data.filter(d => {
    let tokeep;  
    // selected outcome logic
    tokeep = ( d.outcome === state.selectedOutcome )
    // // subject reason logic 
    // tokeep = tokeep && (d.reason_for_stop === state.selectedReason);
    // state.selectedSex === default_sex
    return tokeep; 
  
  }) 
   console.log("filteredDat", filteredData); 

const rect = svg
    .selectAll("rect")
    .data(filteredData)
    .join(
      enter =>
        enter
          .append("rect")
          .attr('width', cellSize)
          .attr('height', cellSize)
          .attr('x', d => x(d.year))
          //put the cells on top of the y increments to prevent x-axis labels overlapping
          .attr('y', d => y(d.subject_race))
          //set colors based on count
          .attr('fill', d => colorFn(d.count))
          .style("stroke", "#d6cdb7")
         // .attr("fill", d => (legend.selected ? color(d.count) : "white")) 
          ,
      
        
      update => update, // pass through the update selection
      exit => exit.remove()
  
    )
    .call(selection =>
      selection
        .transition() // sets the transition on the 'Enter' + 'Update' selections together.
       
    );
     
  // legend code

const group = svg.append("g");

const legend = group
       .attr("class", "leg")
       .attr(
         "transform",
         `translate(-10, 200)`
        );
        //${5 * height + cellSize * 4}
const categories = [...Array(categoriesCount)].map((_, i) => {
    const upperBound = maxValue / categoriesCount * (i + 1);
    const lowerBound = maxValue / categoriesCount * i;

   return {
     upperBound,
     lowerBound,
     color: d3.interpolatePuRd(upperBound / maxValue), 
     selected: true 
     
    };
});

legend
   .selectAll("rect")
   .data(categories)
   .enter()
   .append('rect')
   .attr('fill', d => d.color)
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

function drawBar() { 
  filteredData2 = state.data.filter(d => {
    let tokeep;  
    // selected outcome logic
    tokeep = ( d.reason_for_stop === state.selectedReason || state.selectedReason === default_reason) 
    // // subject reason logic 
    // tokeep = tokeep && (d.reason_for_stop === state.selectedReason);
    // state.selectedSex === default_sex
    return tokeep; 
  
  }) 
   console.log("filteredDat", filteredData); 

  // append rects
  const rect2 = barsvg
    .selectAll("rect")
    .data(filteredData2)
    .join("rect")
    .attr("y", d => yScale(d.count))
    .attr("x", d => xScale(d.outcome))
    .attr("width", xScale.bandwidth())
  //  .attr('height', yScale.domain())
    .attr("height", d => height1 - margin1.bottom - yScale(d.count))
    .attr("fill", "thistle");
  
    

  // append text
  const text = barsvg
    .selectAll("text")
    .data(state.data)
    .join("text")
    .attr("class", "label")
    // this allows us to position the text in the center of the bar
    .attr("x", d => xScale(d.outcome) + (xScale.bandwidth() / 2))
    .attr("y", d => yScale(d.count))
    //.text(d => d.count);
  //  .attr("dy", "1.25em")
    ;

  barsvg
    .append("g")
    .attr("class", "axis")
    .attr("transform", `translate(0, ${height1 - margin1.bottom})`)
    //.attr('transform', 'translate(0,' + height + ')')
    //.attr('transform', 'translate(-100,' + 140 + ')')
    .call(xAxis1);

  barsvg.append('g')
    .classed('y axis', true)
    .call(yAxis1.scale(yScale))
    .attr('transform', 'translate(40, 0)')
  //  .attr('transform', 'rotate(180)')
    ;


}