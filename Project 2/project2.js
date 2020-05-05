

/* CONSTANTS AND GLOBALS */

const 
  margin = {top: 350, right: 100, bottom: 300, left: 110},
  
  cellSize = 15;
  paddingInner = 0.2,
 // margin = { top: 200, bottom: 200, left: 200, right: 200 },
  width = 1300 -margin.left - margin.right,
  height = 900 + margin.top - margin.bottom,
  categoriesCount = 10,
  legendWidth = 60,
  default_selection = "all",
  default_reason = "all", 
  default_sex = "all",
  // bar
  margin1 = { top: 20, bottom: 40, left: 40, right: 40 },
  width1 = 550 - margin1.left,
  width2 = 1300,
  height1 = window.innerHeight / 3,
  height2 = window.innerHeight / 2,
  paddingInner1 = 0.2
  radius = 6;
  ;

// these variables allow us to access anything we manipulate in init() but need access to in draw().
// All these variables are empty before we assign something to them.
let svg;
let tooltip; 
let barsvg;
let x; 
let y;
let colorFn;  
let colorFn2;
let xAxis; 
let yAxis;
let xAxis1; 
let yAxis1; 
let yAxis2;
let yAxis3;
let yAxis4;
let yAxis5;
let yAxis6;
let yAxis7; 
let value;
let maxValue;
let minValue;
let billie;
let shawn;
let lewis;
let halsey;
let sams;
let shaed;
let y2k;
let lilnas;
let khalid; 
let postm; 
let avgDnc;
let avgSpc;
let avgTemp;
let avgLive;
let avgEn;
let avgVal; 


/* APPLICATION STATE */
let state = {
  hover: {
    song: null,
    performer: null,
    state: null,  
  },
  selectedOutcome: default_selection, 
  selectedReason: default_reason ,
  selectedSex: default_sex // + YOUR FILTER SELECTION
};


/* LOAD DATA */
Promise.all([d3.csv("../data/billspot.csv", d3.autoType),
d3.csv("../data/billspot_dedup.csv", d3.autoType),
d3.csv("../data/billspot_top10.csv", d3.autoType), 
d3.csv("../data/feature_comp.csv", d3.autoType)
]).then(([data1, data2, data3, data4]) => {
  state.data = data1;
  state.data2 = data2;
  state.data3 = data3; 
  state.data4 = data4;  
  console.log("orig", state.data);
  console.log("dedup", state.data2);
  console.log("dedup top", state.data3);
  console.log("comp", state.data4)
  init();
});


/* INITIALIZING FUNCTION */
function init() {

  // SCALES
  x = d3
    .scaleBand()
    .domain(state.data.map((d) => d.week))
    .range([0, width-300]);

  y = d3
    .scaleBand()
    .domain(state.data.map((d) => d.song))
    .range([height, -300]);

  xScale = d3
    .scaleBand()
    .domain(state.data.map(d => d.song))
    .range([margin1.left, width1 - margin1.right + 100])
    .paddingInner(paddingInner1);

  // x scale for spotify popularity 
  xScaleP = d3
  .scaleBand()
  .domain(state.data2.map(d => d.song))
  .range([margin1.left, width2 - margin1.right])
  .paddingInner(paddingInner1);


  // scales for popularity 
  yScaleP = d3
    .scaleLinear()
    .domain([0, d3.max(state.data2, d => d.popularity)])
    .range([height2 - margin1.bottom, 0]);



  yScale = d3
    .scaleLinear()
    .domain([0, d3.max(state.data, d => d.danceability)])
    .range([height2 - margin1.bottom, margin1.top]);

   // scales  for scatter
  yScaleL = d3
   .scaleLinear()
   .domain([0, d3.max(state.data2, d => d.total_weeks)])
   .range([height2, -10]);

  xScaleL = d3
   .scaleBand() 
   .domain(state.data2.map((d) => d.song))
   .range([margin1.left, width2 - margin1.right])
   .paddingInner(paddingInner1);


   // scales for speechiness
  yScale1 = d3
   .scaleLinear()
   .domain([0, d3.max(state.data2, d => d.speechiness)])
   .range([height2 - margin1.bottom, margin1.top]);
  

  // scales for valence
  yScale2 = d3
  .scaleLinear()
  .domain([0, d3.max(state.data2, d => d.valence)])
  .range([height2 - margin1.bottom, margin1.top]);


  // scales for liveness
  yScale3 = d3
  .scaleLinear()
  .domain([0, d3.max(state.data2, d => d.liveness)])
  .range([height2 - margin1.bottom, margin1.top]);


   // scales for energy
  yScale4 = d3
   .scaleLinear()
   .domain([0, d3.max(state.data2, d => d.energy)])
   .range([height2 - margin1.bottom, margin1.top]);

   // scales for tempo
  yScale5 = d3
   .scaleLinear()
   .domain([0, d3.max(state.data2, d => d.tempo)])
   .range([height2 - margin1.bottom, margin1.top]);

  // color scale
  colorFn = d3
      .scaleSequential(d3.interpolatePuBuGn)
      .domain(d3.extent(state.data, d => d.cum_week));

  // variables for legend
  values = state.data.map(d => d.cum_week);
  maxValue = d3.max(values);
  minValue = d3.min(values);  

  // tooltip 
  tooltip = d3.select("body").append("div").attr("class", "toolTip");

  // img 
  billie = "https://i.ebayimg.com/images/g/Z3IAAOSwbv9cwJE9/s-l400.jpg"; 
  sams = "../data/samsmith.jpg"; 
  lilnas = "../data/lilnas2.png"; 
  lewis = "https://images-na.ssl-images-amazon.com/images/I/61vRDR0kkkL._AC_SX522_.jpg";
  shaed = "../data/shaed.png";
  halsey = "https://images-na.ssl-images-amazon.com/images/I/51ALNwd83WL._AC_SX522_.jpg";
  shawn = "https://static1.squarespace.com/static/53959f2ce4b0d0ce55449ea5/583c2ca73e00be40153f1b80/5981b25586e6c0c43adb187f/1501672074225/Shawn+Mendes.jpg?format=1500w";
  postm = "https://i2.wp.com/www.celebrity-cutouts.com/wp-content/uploads/2019/02/post-malone-tattoos-celebrity-mask.png?resize=450%2C500&ssl=1";
  y2k = "../data/y2k.png";
  khalid = "../data/Singer-Khalid.png";

  // averages among all billboard songs from 2019 with spotify metrics (n = 595)
  avgDnc = 0.67;
  avgSpc = 0.24;
  avgTemp = 122.4;
  avgLive = 0.18;
  avgEn = 0.62;
  avgVal = 0.47; 


  // create svg element for heatmap
  svg = d3
    .select("#d3-container2")
    .attr("align","center")
    .append("svg")
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", "-190 -400 1300 1600")
    .classed("svg-content", true);
    // .append("svg")
    // .attr("width", width + margin.left + margin.right)
    // .attr("height", height + margin.top + margin.bottom)
    // .append("g")
    // .attr("transform", "translate(200, 400)");

   // create svg element for barchart danceability
   barsvg = d3
   .select("#d3-container3")
   .attr("align","center")
   .append("svg")
   .attr("width", width2 + margin1.left + margin1.right)
   .attr("height", height2 + margin1.top + margin1.bottom)
   .append("g")
   .attr("transform", "translate(" + margin1.left + "," + margin1.top + ")");
   
 
  // create svg element for barchart 
  barsvg2 = d3
  .select("#d3-container4")
  .attr("align","center")
  .append("svg")
  .attr("width", width2 + margin1.left + margin1.right)
  .attr("height", height2 + margin1.top + margin1.bottom)
  .append("g")
  .attr("transform", "translate(" + margin1.left + "," + margin1.top + ")");

  // create svg element for valence
  barsvg3 = d3
  .select("#d3-container5")
  .attr("align","center")
  .append("svg")
  .attr("width", width2 + margin1.left + margin1.right)
  .attr("height", height2 + margin1.top + margin1.bottom)
 //.attr("height", 200)
  .append("g")
  .attr("transform", "translate(" + margin1.left + "," + margin1.top + ")");
 
   // create svg element for liveness
   barsvg4 = d3
   .select("#d3-container6")
   .attr("align","center")
   .append("svg")
   .attr("width", width2 + margin1.left + margin1.right)
   .attr("height", height2 + margin1.top + margin1.bottom)
  //.attr("height", 200)
   .append("g")
   .attr("transform", "translate(" + margin1.left + "," + margin1.top + ")");
 
    // create svg element for energy
    barsvg5 = d3
    .select("#d3-container7")
    .attr("align","center")
    .append("svg")
    .attr("width", width2 + margin1.left + margin1.right)
    .attr("height", height2 + margin1.top + margin1.bottom)
    .append("g")
    .attr("transform", "translate(" + margin1.left + "," + margin1.top + ")");
  
   // create svg element for tempo
   barsvg6 = d3
   .select("#d3-container8")
   .attr("align","center")
   .append("svg")
   .attr("width", width2 + margin1.left + margin1.right)
   .attr("height", height2 + margin1.top + margin1.bottom)
   .append("g")
   .attr("transform", "translate(" + margin1.left + "," + margin1.top + ")");
  
   // create svg element for popularity 
   barsvg7 = d3
   .select("#d3-container9")
   .attr("align","center")
   .append("svg")
   .attr("width", width2 + margin1.left + margin1.right)
   .attr("height", height2 + margin1.top + margin1.bottom)
   .append("g")
   .attr("transform", "translate(" + margin1.left + "," + margin1.top + ")");
 
  // y and x axis for heatmap 
  xAxis = d3.axisBottom(x);
  yAxis = d3.axisLeft(y);


  // bar chart axes for danceability 
  xAxis1 = d3.axisBottom(xScale).tickValues([]);
  yAxis1 = d3.axisLeft(yScale).ticks(state.data.danceability);


  // bar chart axes for speechiness
  xAxis2 = d3.axisBottom(xScale).tickValues([]);;
  yAxis2 = d3.axisLeft(yScale).ticks(state.data.speechiness);
  
  // y scale for valence 
  yAxis3 = d3.axisLeft(yScale).ticks(state.data.valence);

  // y scale for liveness
  yAxis4 = d3.axisLeft(yScale).ticks(state.data.liveness);

  // y scale for energy
  yAxis5 = d3.axisLeft(yScale).ticks(state.data.energy);

  // y axis for scatter
  yAxis6 = d3.axisRight(yScaleL);

  // y axis for scatter popularity 
  yAxis7 = d3.axisLeft(yScaleP);
  
  svg
    .append('g')
    .classed('x axis', true)
    .attr('transform', 'translate(0,' + height + ')')
    .call(xAxis)
    .append("text")
    .attr("class", "axis-label")
    .attr("x", "50%")
    .attr("dy", "3em")
    .attr("dx", "-20em")
    .text("Week of 2019");

  svg.append('g')
    .classed('y axis', true)
    .call(yAxis)

    
  
  // call the draw function 
  drawHeat();
  drawBarDncA();  
  drawBarSpeechA();
  drawBarValA();
  drawBarLiveA();
  drawBarEnA();  
  drawBarTemA();
  drawBarPop();
  drawTable(); 

}  



function drawHeat() { 


const rect = svg
    .selectAll("rect")
    .data(state.data)
    .join(
      enter =>
        enter
          .append("rect")
          .attr('width', cellSize)
          .attr('height', cellSize)
          .attr('x', d => x(d.week))
          //put the cells on top of the y increments to prevent x-axis labels overlapping
          .attr('y', d => y(d.song))
          //set colors based on count
          .attr('fill', d => colorFn(d.cum_week))
          .style("stroke", "#d6cdb7")
          .on("mouseover", function(d){
            tooltip
              .style("left", d3.event.pageX - 50 + "px")
              .style("top", d3.event.pageY - 70 + "px")
              .style("display", "inline-block")
              .html("Performer: " + (d.performer) + "<br>" + "Album: " + (d.album)); })
    
           .on("mouseout", function(d){ tooltip.style("display", "none")}) 
         // .attr("fill", d => (legend.selected ? color(d.count) : "white")) 
          ,
      
        
      update => update, // pass through the update selection
      exit => exit.remove()
  
    )
    .call(selection =>
      selection
        .transition() // sets the transition on the 'Enter' + 'Update' selections together.
       
    );
     
// call legend 
drawLegend();
  
}

// legend 
function drawLegend() {
    // legend code

const group = svg.append("g");

const legend = group
  .attr("class", "leg")
  .attr("transform",
         `translate(900, 300) rotate(270)`);

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
    .attr("dy", 0)

  .attr("transform",
  `translate(620, -60) rotate(90)`)
    .attr("font-size", 14)
    .attr("font-weight", "bold")
    .text("Number of Weeks on Chart")
  
}


function drawBarPop() { 

  // sort data by popularity 
  sortedDataPop = [...state.data2].sort(function(x, y) { 
    return d3.ascending(x.popularity, y.popularity) 

  });

  xScalen = xScaleP
  .domain(sortedDataPop.map(d => d.song));
 

     // append rects
     const rect2 = barsvg7
     .selectAll("rect")
     .data(sortedDataPop)
     .join("rect")
     .attr("y", d => yScaleP(d.popularity))
     .attr("x", d => xScaleP(d.song))
     .attr("width", xScaleP.bandwidth())
     .attr("height", d => height2 - margin1.bottom - yScaleP(d.popularity))
     .attr("fill", d => {
      if (d.song === "Wow." || d.song === "Dancing With A Stranger"
        || d.song === "Without Me" || d.song === "Talk" || d.song === "Old Town Road") 
        return "#4f98ca";
      if (d.song === "Bad Guy" || d.song === "Senorita"
        || d.song === "Trampoline" || d.song === "Someone You Loved" || d.song === "Lalala")
         return "#1DB954"
      else return "#dbdbdb";
     })
     .on("mouseover", function(d){
       tooltip
         .style("left", d3.event.pageX - 50 + "px")
         .style("top", d3.event.pageY - 70 + "px")
         .style("display", "inline-block")
         .html((d.song) + "<br>"  + "by " + (d.performer));
   })
   .on("mouseout", function(d){ tooltip.style("display", "none");});
   
 
   // y axis label
   barsvg7.append('g')
    .classed('y axis', true)
    .call(yAxis7.scale(yScaleP))
    .attr('transform', 'translate(40, 0)')
    .append("text")
    .attr("class", "y-axis-label-p")
    .attr("y", "50%")
    .attr("dx", "-3em")
    .attr("dy", "-3em")
    .attr("writing-mode", "vertical-rl")
    .text("Popularity Score")
    
     ; 

    // x axis label 
  barsvg7
  .append("g")
  .attr("class", "x-axis")
  .attr("transform", `translate(0, ${height2 - margin1.bottom})`)
  .call(xAxis1)
  .append("text")
  .attr("class", "axis-label")
  .attr("x", "50%")
  .attr("dx", "-2em")
  .attr("dy", "2em")
  .text("Song")
  ;
 
    // start of scatter code 

  const dot = barsvg7
  .selectAll(".dot")
  .data(sortedDataPop, d => d.song)
  .join(
    enter =>

      enter
        .append("circle")
        .attr("class", "dot")
        .attr("opacity", 1)
        .attr("r", radius)
        .attr("cy", d => yScaleP(d.total_weeks))
        .attr("fill", "#f0a500")
        .call(enter =>
            enter
              .attr("cx", d => xScaleP(d.song)+ 5)  
          )
        ,
  )
  .on("mousemove", function(d){
    tooltip
      .style("left", d3.event.pageX - 50 + "px")
      .style("top", d3.event.pageY - 70 + "px")
      .style("display", "inline-block")
      .html((d.song) + "<br>"  + "Total weeks: " + (d.total_weeks));
})
  .on("mouseout", function(d){ tooltip.style("display", "none");});
;

// add y axis for scatter
barsvg7
 .append("g")
 .attr("class", "axis y-axis")
 .attr("transform", `translate(1260, 0)`)
 .call(yAxis6)
 .append("text")
  .attr("class", "z-axis-label-p")
  .attr("y", "50%")
  .attr("dx", "3em")
  .attr("dy", "-3em")
  .attr("writing-mode", "vertical-rl")
  .text("Total Number of Weeks in Chart")
  ;


}


function drawBarDncA() { 

  // copies state.data into a new array, and then sorts it ito a new 
  sortedDataDnc = [...state.data3].sort(function(x, y) { 
    return d3.ascending(x.danceability, y.danceability) 

  });

  xScalen = xScale
  .domain(sortedDataDnc.map(d => d.song));

  // append rects
  const rect2 = barsvg
    .selectAll("rect")
    .data(sortedDataDnc)
    .join("rect")
    .attr("y", d => yScale(d.danceability))
    .attr("x", d => xScale(d.song))
    .attr("width", xScale.bandwidth())
    .attr("height", d => height2 - margin1.bottom - yScale(d.danceability))
    .attr("fill", d => {
     if (d.song === "Wow." || d.song === "Dancing With A Stranger"
       || d.song === "Without Me" || d.song === "Talk" || d.song === "Old Town Road") 
       return "#4f98ca";
     else if (d.song === "Bad Guy" || d.song === "Senorita"
       || d.song === "Trampoline" || d.song === "Someone You Loved" || d.song === "Lalala")
        return "#1DB954"
     else return "#dbdbdb";
    })
    .on("mousemove", function(d){
      tooltip
        .style("left", d3.event.pageX - 50 + "px")
        .style("top", d3.event.pageY - 70 + "px")
        .style("display", "inline-block")
        .html((d.song) + "<br>"  + "Danceability score: " + (d.danceability));
  })
  .on("mouseout", function(d){ tooltip.style("display", "none");});
  
 // append pic on top of barchart 
 barsvg
   .selectAll("image")
   .data(state.data3)
   .enter()
   .append("svg:image")
   .attr("xlink:href", d => {
     if (d.song === "Bad Guy") return billie; 
     else if (d.song === "Dancing With A Stranger") return sams; 
     else if (d.song === "Old Town Road") return lilnas; 
     else if (d.song === "Someone You Loved") return lewis;
     else if (d.song === "Trampoline") return shaed;
     else if (d.song === "Without Me") return halsey; 
     else if (d.song === "Wow.") return postm; 
     else if (d.song === "Lalala") return y2k;
     else if (d.song === "Talk") return khalid; 
     else if (d.song === "Senorita") return shawn;
     else return "../data/miniStarbucks.png"})
   .attr("width", xScale.bandwidth())
   .attr("height", "28px")
   .attr("y", d => yScale(d.danceability) - 30)
   .attr("x", d => xScale(d.song))
   .attr("preserveAspectRatio", "true")
   .on("mousemove", function(d){
    tooltip
      .style("left", d3.event.pageX - 50 + "px")
      .style("top", d3.event.pageY - 70 + "px")
      .style("display", "inline-block")
      .html((d.performer));
})
.on("mouseout", function(d){ tooltip.style("display", "none");});

 // y axis label 
  barsvg.append('g')
    .classed('y axis', true)
    .call(yAxis1.scale(yScale))
    .attr('transform', 'translate(40, 0)')
    .append("text")
    .attr("class", "axis-label")
    .attr("y", "50%")
    .attr("dx", "-3em")
    .attr("dy", "-3em")
    .attr("writing-mode", "vertical-rl")
    .text("Danceability Score")
    .attr("color", "#f0a500")
    ;

  // x axis label 
  barsvg
    .append("g")
    .attr("class", "axis")
    .attr("transform", `translate(0, ${height2 - margin1.bottom})`)
    .call(xAxis1)
    .append("text")
    .attr("class", "axis-label")
    .attr("x", "50%")
    .attr("dx", "-27em")
    .attr("dy", "2em")
    .text("Song")
    ;

}

function drawBarSpeechA() { 

  // copies state.data into a new array, and then sorts it ito a new 
  sortedDataSp = [...state.data3].sort(function(x, y) { 
    return d3.ascending(x.speechiness, y.speechiness) 

  });

  xScalen = xScale
  .domain(sortedDataSp.map(d => d.song));

  xScaleL = xScaleL
  .domain(sortedDataSp.map(d => d.song));

  // append rects
  const rect2 = barsvg2
    .selectAll("rect")
    .data(sortedDataSp)
    .join("rect")
    .attr("y", d => yScale1(d.speechiness))
    .attr("x", d => xScale(d.song))
    .attr("width", xScale.bandwidth())
  //  .attr('height', yScale.domain())
    .attr("height", d => height2 - margin1.bottom - yScale1(d.speechiness))
    .attr("fill", d => {
      if (d.song === "Wow." || d.song === "Dancing With A Stranger"
        || d.song === "Without Me" || d.song === "Talk" || d.song === "Old Town Road") 
        return "#4f98ca";
      else if (d.song === "Bad Guy" || d.song === "Senorita"
        || d.song === "Trampoline" || d.song === "Someone You Loved" || d.song === "Lalala")
         return "#1DB954"
      else return "#dbdbdb";
     })
    .on("mousemove", function(d){
      tooltip
        .style("left", d3.event.pageX - 50 + "px")
        .style("top", d3.event.pageY - 70 + "px")
        .style("display", "inline-block")
        .html((d.song) + "<br>"  + "Speechiness score: " + (d.speechiness));
  })
  .on("mouseout", function(d){ tooltip.style("display", "none");});
  


  // axis label 
  barsvg2
    .append("g")
    .attr("class", "axis")
    .attr("transform", `translate(0, ${height2 - margin1.bottom})`)
    .call(xAxis1)
    .append("text")
    .attr("class", "axis-label")
    .attr("x", "50%")
    .attr("dx", "-27em")
    .attr("dy", "2em")
    .text("Song")
    ;

  barsvg2.append('g')
    .classed('y axis', true)
    .call(yAxis2.scale(yScale1))
    .attr('transform', 'translate(40, 0)') 
    .append("text")
    .attr("class", "axis-label")
    .attr("y", "50%")
    .attr("dx", "-3em")
    .attr("dy", "-3em")
    .attr("writing-mode", "vertical-rl")
    .text("Speechiness Score")
    ;

  // append pic on top of barchart 
  barsvg2
  .selectAll("image")
  .data(state.data3)
  .enter()
  .append("svg:image")
  .attr("xlink:href", d => {
    if (d.song === "Bad Guy") return billie; 
    else if (d.song === "Dancing With A Stranger") return sams; 
    else if (d.song === "Old Town Road") return lilnas; 
    else if (d.song === "Someone You Loved") return lewis;
    else if (d.song === "Trampoline") return shaed;
    else if (d.song === "Without Me") return halsey; 
    else if (d.song === "Wow.") return postm; 
    else if (d.song === "Lalala") return y2k;
    else if (d.song === "Talk") return khalid; 
    else if (d.song === "Senorita") return shawn;
    else return "../data/miniStarbucks.png"})
  .attr("width", xScale.bandwidth())
  .attr("height", "28px")
  .attr("y", d => yScale1(d.speechiness) - 30)
  .attr("x", d => xScale(d.song))
  .attr("preserveAspectRatio", "true")
  .on("mousemove", function(d){
    tooltip
      .style("left", d3.event.pageX - 50 + "px")
      .style("top", d3.event.pageY - 70 + "px")
      .style("display", "inline-block")
      .html((d.performer));
})
.on("mouseout", function(d){ tooltip.style("display", "none");});

}


function drawBarValA() { 

  // copies state.data into a new array, and then sorts it ito a new 
  sortedDataVal = [...state.data3].sort(function(x, y) { 
    return d3.ascending(x.valence, y.valence) 

  });
  // redefine xScale 
  xScalen = xScale
  .domain(sortedDataVal.map(d => d.song));


  // append rects
  const rect2 = barsvg3
    .selectAll("rect")
    .data(sortedDataVal)
    .join("rect")
    .attr("y", d => yScale2(d.valence))
    .attr("x", d => xScale(d.song))
    .attr("width", xScale.bandwidth())
    .attr("height", d => height2 - margin1.bottom - yScale2(d.valence))
    .attr("fill", d => {
      if (d.song === "Wow." || d.song === "Dancing With A Stranger"
        || d.song === "Without Me" || d.song === "Talk" || d.song === "Old Town Road") 
        return "#4f98ca";
     else if (d.song === "Bad Guy" || d.song === "Senorita"
        || d.song === "Trampoline" || d.song === "Someone You Loved" || d.song === "Lalala")
         return "#1DB954"
      else return "#dbdbdb";
     })
    .on("mousemove", function(d){
      tooltip
        .style("left", d3.event.pageX - 50 + "px")
        .style("top", d3.event.pageY - 70 + "px")
        .style("display", "inline-block")
        .html((d.song) + "<br>"  + "Valence score: " + (d.valence));
  })
  .on("mouseout", function(d){ tooltip.style("display", "none");});

   // append pic on top of barchart 
 barsvg3
 .selectAll("image")
 .data(state.data3)
 .enter()
 .append("svg:image")
 .attr("xlink:href", d => {
   if (d.song === "Bad Guy") return "https://i.ebayimg.com/images/g/Z3IAAOSwbv9cwJE9/s-l400.jpg"; 
   else if (d.song === "Dancing With A Stranger") return "../data/samsmith.jpg"; 
   else if (d.song === "Old Town Road") return "../data/lilnas2.png"; 
   else if (d.song === "Someone You Loved") return "https://images-na.ssl-images-amazon.com/images/I/61vRDR0kkkL._AC_SX522_.jpg"
   else if (d.song === "Trampoline") return "../data/shaed.png";
   else if (d.song === "Without Me") return "https://images-na.ssl-images-amazon.com/images/I/51ALNwd83WL._AC_SX522_.jpg"
   else if (d.song === "Senorita") return "https://static1.squarespace.com/static/53959f2ce4b0d0ce55449ea5/583c2ca73e00be40153f1b80/5981b25586e6c0c43adb187f/1501672074225/Shawn+Mendes.jpg?format=1500w"
   else if (d.song === "Wow.") return "https://i2.wp.com/www.celebrity-cutouts.com/wp-content/uploads/2019/02/post-malone-tattoos-celebrity-mask.png?resize=450%2C500&ssl=1"
   else if (d.song === "Lalala") return "../data/y2k.png"
   else if (d.song === "Talk") return "../data/Singer-Khalid.png"
   else return "../data/miniStarbucks.png"})
 .attr("width", xScale.bandwidth())
 .attr("height", "28px")
 .attr("y", d => yScale2(d.valence) - 30)
 .attr("x", d => xScale(d.song))
 .attr("preserveAspectRatio", "true")
 .on("mousemove", function(d){
  tooltip
    .style("left", d3.event.pageX - 50 + "px")
    .style("top", d3.event.pageY - 70 + "px")
    .style("display", "inline-block")
    .html((d.performer));
})
.on("mouseout", function(d){ tooltip.style("display", "none");});
  


  // x axis label
  barsvg3
    .append("g")
    .attr("class", "axis")
    .attr("transform", `translate(0, ${height2 - margin1.bottom})`)
    .call(xAxis2)
    .append("text")
    .attr("class", "axis-label")
    .attr("x", "50%")
    .attr("dx", "-30em")
    .attr("dy", "2em")
    .text("Song")
    ;
  // y axis label
  barsvg3.append('g')
    .classed('y axis', true)
    .call(yAxis2.scale(yScale2))
    .attr('transform', 'translate(40, 0)')
    .append("text")
    .attr("class", "axis-label")
    .attr("y", "50%")
    .attr("dx", "-3em")
    .attr("dy", "-3em")
    .attr("writing-mode", "vertical-rl")
    .text("Valence Score")
    ;

}


function drawBarLiveA() { 

  // copies state.data into a new array, and then sorts it ito a new 
  sortedDataLive = [...state.data3].sort(function(x, y) { 
    return d3.ascending(x.liveness, y.liveness) 

  });
  // redefine xScale 
  xScalen = xScale
  .domain(sortedDataLive.map(d => d.song));

  // append rects
  const rect2 = barsvg4
    .selectAll("rect")
    .data(sortedDataLive)
    .join("rect")
    .attr("y", d => yScale3(d.liveness))
    .attr("x", d => xScale(d.song))
    .attr("width", xScale.bandwidth())
    .attr("height", d => height2 - margin1.bottom - yScale3(d.liveness))
    .attr("fill", d => {
      if (d.song === "Wow." || d.song === "Dancing With A Stranger"
        || d.song === "Without Me" || d.song === "Talk" || d.song === "Old Town Road") 
        return "#4f98ca";
      else if (d.song === "Bad Guy" || d.song === "Senorita"
        || d.song === "Trampoline" || d.song === "Someone You Loved" || d.song === "Lalala")
         return "#1DB954"
      else return "#dbdbdb";
     })
    .on("mousemove", function(d){
      tooltip
        .style("left", d3.event.pageX - 50 + "px")
        .style("top", d3.event.pageY - 70 + "px")
        .style("display", "inline-block")
        .html((d.song) + "<br>"  + "Liveness score: " + (d.liveness));
  })
  .on("mouseout", function(d){ tooltip.style("display", "none");});
  
    
  barsvg4
    .append("g")
    .attr("class", "axis")
    .attr("transform", `translate(0, ${height2 - margin1.bottom})`)
    .call(xAxis1)
    .append("text")
    .attr("class", "axis-label")
    .attr("x", "50%")
    .attr("dx", "-30em")
    .attr("dy", "2em")
    .text("Song")
    ;

  barsvg4.append('g')
    .classed('y axis', true)
    .call(yAxis2.scale(yScale3))
    .attr('transform', 'translate(40, 0)')
    .append("text")
    .attr("class", "axis-label")
    .attr("y", "50%")
    .attr("dx", "-3em")
    .attr("dy", "-3em")
    .attr("writing-mode", "vertical-rl")
    .text("Liveness Score")
    ;

     // append pic on top of barchart 
 barsvg4
 .selectAll("image")
 .data(state.data3)
 .enter()
 .append("svg:image")
 .attr("xlink:href", d => {
   if (d.song === "Bad Guy") return billie; 
   else if (d.song === "Dancing With A Stranger") return sams; 
   else if (d.song === "Old Town Road") return lilnas; 
   else if (d.song === "Someone You Loved") return lewis;
   else if (d.song === "Trampoline") return shaed;
   else if (d.song === "Without Me") return halsey; 
   else if (d.song === "Wow.") return postm; 
   else if (d.song === "Lalala") return y2k;
   else if (d.song === "Talk") return khalid; 
   else if (d.song === "Senorita") return shawn;
   else return "../data/miniStarbucks.png"})
 .attr("width", xScale.bandwidth())
 .attr("height", "28px")
 .attr("y", d => yScale3(d.liveness) - 30)
 .attr("x", d => xScale(d.song))
 .attr("preserveAspectRatio", "true")
 .on("mousemove", function(d){
  tooltip
    .style("left", d3.event.pageX - 50 + "px")
    .style("top", d3.event.pageY - 70 + "px")
    .style("display", "inline-block")
    .html((d.performer));
})
.on("mouseout", function(d){ tooltip.style("display", "none");});


}


function drawBarEnA() { 
 // copies state.data into a new array, and then sorts it ito a new 
  sortedDataEn = [...state.data3].sort(function(x, y) { 
    return d3.ascending(x.energy, y.energy) 

  });

  xScalen = xScale
  .domain(sortedDataEn.map(d => d.song));


  // append rects
  const rect2 = barsvg5
    .selectAll("rect")
    .data(sortedDataEn)
    .join("rect")
    .attr("y", d => yScale4(d.energy))
    .attr("x", d => xScale(d.song))
    .attr("width", xScale.bandwidth())
    .attr("height", d => height2 - margin1.bottom - yScale4(d.energy))
    .attr("fill", d => {
      if (d.song === "Wow." || d.song === "Dancing With A Stranger"
        || d.song === "Without Me" || d.song === "Talk" || d.song === "Old Town Road") 
        return "#4f98ca";
     else if (d.song === "Bad Guy" || d.song === "Senorita"
        || d.song === "Trampoline" || d.song === "Someone You Loved" || d.song === "Lalala")
         return "#1DB954"
      else return "#dbdbdb";
     })
    .on("mousemove", function(d){
      tooltip
        .style("left", d3.event.pageX - 50 + "px")
        .style("top", d3.event.pageY - 70 + "px")
        .style("display", "inline-block")
        .html((d.song) + "<br>"  + "by " + "Energy score: " + (d.energy));
  })
  .on("mouseout", function(d){ tooltip.style("display", "none");});
  
 
  // x axis label 
  barsvg5
    .append("g")
    .attr("class", "axis")
    .attr("transform", `translate(0, ${height2 - margin1.bottom})`)
    .call(xAxis1)
    .append("text")
    .attr("class", "axis-label")
    .attr("x", "50%")
    .attr("dx", "-30em")
    .attr("dy", "2em")
    .text("Song")
    ;

  // y axis label 
  barsvg5.append('g')
    .classed('y axis', true)
    .call(yAxis2.scale(yScale4))
    .attr('transform', 'translate(40, 0)') 
    .append("text")
    .attr("class", "axis-label")
    .attr("y", "50%")
    .attr("dx", "-3em")
    .attr("dy", "-3em")
    .attr("writing-mode", "vertical-rl")
    .text("Energy Score")
    ;

     // append pic on top of barchart 
    barsvg5
     .selectAll("image")
     .data(state.data3)
     .enter()
     .append("svg:image")
     .attr("xlink:href", d => {
       if (d.song === "Bad Guy") return billie; 
       else if (d.song === "Dancing With A Stranger") return sams; 
       else if (d.song === "Old Town Road") return lilnas; 
       else if (d.song === "Someone You Loved") return lewis;
       else if (d.song === "Trampoline") return shaed;
       else if (d.song === "Without Me") return halsey; 
       else if (d.song === "Wow.") return postm; 
       else if (d.song === "Lalala") return y2k;
       else if (d.song === "Talk") return khalid; 
       else if (d.song === "Senorita") return shawn;
       else return "../data/miniStarbucks.png"})
     .attr("width", xScale.bandwidth())
     .attr("height", "28px")
     .attr("y", d => yScale4(d.energy) - 30)
     .attr("x", d => xScale(d.song))
     .attr("preserveAspectRatio", "true")
     .on("mousemove", function(d){
      tooltip
        .style("left", d3.event.pageX - 50 + "px")
        .style("top", d3.event.pageY - 70 + "px")
        .style("display", "inline-block")
        .html((d.performer));
  })
  .on("mouseout", function(d){ tooltip.style("display", "none");});


}

function drawBarTemA() { 
  // copies state.data into a new array, and then sorts it ito a new 
   sortedDataTem = [...state.data3].sort(function(x, y) { 
     return d3.ascending(x.tempo, y.tempo) 
 
   });
 
   xScalen = xScale
   .domain(sortedDataTem.map(d => d.song));

 
   // append rects
   const rect2 = barsvg6
     .selectAll("rect")
     .data(sortedDataTem)
     .join("rect")
     .attr("y", d => yScale5(d.tempo))
     .attr("x", d => xScale(d.song))
     .attr("width", xScale.bandwidth())
     .attr("height", d => height2 - margin1.bottom - yScale5(d.tempo))
     .attr("fill", d => {
      if (d.song === "Wow." || d.song === "Dancing With A Stranger"
        || d.song === "Without Me" || d.song === "Talk" || d.song === "Old Town Road") 
        return "#4f98ca";
      else if (d.song === "Bad Guy" || d.song === "Senorita"
        || d.song === "Trampoline" || d.song === "Someone You Loved" || d.song === "Lalala")
         return "#1DB954"
      else return "#dbdbdb";
     })
     .on("mousemove", function(d){
       tooltip
         .style("left", d3.event.pageX - 50 + "px")
         .style("top", d3.event.pageY - 70 + "px")
         .style("display", "inline-block")
         .html((d.song) + "<br>"  + "Tempo score: " + (d.tempo));
   })
   .on("mouseout", function(d){ tooltip.style("display", "none");});
   
   // x axis label
   barsvg6
     .append("g")
     .attr("class", "axis")
     .attr("transform", `translate(0, ${height2 - margin1.bottom})`)
     .call(xAxis1)
     .append("text")
     .attr("class", "axis-label")
     .attr("x", "50%")
     .attr("dx", "-30em")
     .attr("dy", "2em")
     .text("Song")
     ;
 
  // y axis label 
   barsvg6.append('g')
    .classed('y axis', true)
    .call(yAxis2.scale(yScale5))
    .attr('transform', 'translate(40, 0)')
    .append("text")
    .attr("class", "axis-label")
    .attr("y", "50%")
    .attr("dx", "-3em")
    .attr("dy", "-3em")
    .attr("writing-mode", "vertical-rl")
    .text("Tempo Score")
    
     ;
 
  // append pic on top of barchart 
 barsvg6
 .selectAll("image")
 .data(state.data3)
 .enter()
 .append("svg:image")
 .attr("xlink:href", d => {
   if (d.song === "Bad Guy") return billie; 
   else if (d.song === "Dancing With A Stranger") return sams; 
   else if (d.song === "Old Town Road") return lilnas; 
   else if (d.song === "Someone You Loved") return lewis;
   else if (d.song === "Trampoline") return shaed;
   else if (d.song === "Without Me") return halsey; 
   else if (d.song === "Wow.") return postm; 
   else if (d.song === "Lalala") return y2k;
   else if (d.song === "Talk") return khalid; 
   else if (d.song === "Senorita") return shawn;
   else return "../data/miniStarbucks.png"})
 .attr("width", xScale.bandwidth())
 .attr("height", "28px")
 .attr("y", d => yScale5(d.tempo) - 30)
 .attr("x", d => xScale(d.song))
 .attr("preserveAspectRatio", "true")
 .on("mousemove", function(d){
  tooltip
    .style("left", d3.event.pageX - 50 + "px")
    .style("top", d3.event.pageY - 70 + "px")
    .style("display", "inline-block")
    .html((d.performer));
})
.on("mouseout", function(d){ tooltip.style("display", "none");});

 }

function drawTable() { 
  const table = d3.select("#d3-table");

  /** HEADER */
  const thead = table.append("thead");
  thead
    .append("tr")
    .append("th")
    .attr("colspan", "10")
    .text("Averages Comparison Between Features from Top Billboard and Spotify Songs")
    .style("font-size", "30px");

  thead
    .append("tr")
    .selectAll("th")
    .data(state.data4.columns)
    .join("td")
    .text(d => d)
    .style("font-size", "25px")
    .style("font-weight", "bold")
    ;

  /** BODY */
  // rows
  const rows = table
    .append("tbody")
    .selectAll("tr")
    .data(state.data4)
    .join("tr");
   
  
  // cells
  rows
    .selectAll("td")
    .data(d => Object.values(d))
    .join("td")
    .text(d => d)
    .style("font-size", "20px")
    // update the below logic to apply to your dataset
    .attr("class", d => { 
      if (+d === 0.8202 || +d ===  0.11442 || +d === 123.7482
        || +d === 0.1183 || +d === 0.5132 || +d === 0.5504 ) return  'high';

    });

    

}