// Add your JavaScript code here
//have data outside
const MAX_WIDTH = Math.max(1080, window.innerWidth);
const MAX_HEIGHT = 720;
const margin = {top: 40, right: 100, bottom: 40, left: 175};

// Assumes the same graph width, height dimensions as the example dashboard. Feel free to change these if you'd like
let graph_1_width = (MAX_WIDTH / 2) - 10, graph_1_height = 500;
let graph_2_width = MAX_WIDTH * 2/3, graph_2_height = 500;
let graph_3_width = MAX_WIDTH / 2 - 10, graph_3_height = 575;

d3.csv('data/video_games.csv').then(function(data){
  data1 = cleanData(data);
  years = data1.map(function(d) {return d['Year']});
  years = [... new Set(years)];
  years = years.filter(function (value) {
    return !Number.isNaN(value);
  });
  years.sort(function(a,b) {return b-a;});
  years.unshift('All');


  var dropdown_button = d3.select('#graph1').append('select');
  dropdown_button
    .selectAll('myOptions')
      .data(years)
    .enter()
      .append('option')
    .text(function(d) {return d;})
      .attr('value', function(d) {return d;})
    .style("font-size", "20px");

  dropdown_button.on('change',function(d) {
    var select_option = d3.select(this).property('value');
    set_top_10(select_option);
  });
});

let svg1 = d3.select('#graph1')
    .append("svg")
    .attr('width', graph_1_width)
    .attr('height', graph_1_height)
    .append("g")
    .attr('transform', `translate(275,${margin.top})`);

x1 = d3.scaleLinear()
    .range([0,graph_1_width-margin.left-margin.right]);
let y1 = d3.scaleBand()
    .range([0,graph_1_height-margin.bottom-margin.top])
    .padding(0.1);

let salesRef1 = svg1.append("g");

let y_axis_label1 = svg1.append("g");

svg1.append("text")
    .attr("transform", `translate(300,440)`)
    .style("text-anchor", "middle")
    .text("Global Sales (millions)");

let y_axis_text1 = svg1.append("text")
    .attr("transform", `translate(-200,200)`)
    .style("text-anchor", "middle");

let title1 = svg1.append("text")
    .attr("transform", `translate(260,-10)`)
    .style("text-anchor", "middle")
    .style("font-size", 20);

function set_top_10(year='All') {
    d3.csv('data/video_games.csv').then(function(data) {
        data1 = cleanData(data);
        if (year != 'All') {
            data1 = data.filter(
                function(d) {
                    if (d['Year'] == year) {
                      return d;
                    }
                }
            )
        }

        data1.sort(function(a,b) {return b.Global_Sales-a.Global_Sales;});
        data1 = data1.slice(0, 10);
        x1.domain([0, d3.max(data1, function(d) {return d.Global_Sales;})]);
        y1.domain(data1.map(function(d) {return d['Name'];}));
        y_axis_label1.call(d3.axisLeft(y1).tickSize(0).tickPadding(10));
        let color1 = d3.scaleOrdinal()
          .domain(function(d) {return d.Name})
          .range(d3.quantize(d3.interpolateHcl("#22AED1", "#E637BF"), 11));
        let bars = svg1.selectAll('rect').data(data1);
        bars.enter()
            .append('rect')
            .merge(bars)
            .transition()
            .duration(1000)
            .style("fill", function(d){return color1(d.Name);})
            .attr('x', x1(0))
            .attr('y', function(d) {return y1(d['Name']);})
            .attr('width', function(d){return x1(d['Global_Sales'])})
            .attr('height', y1.bandwidth());
        let sales1 = salesRef1.selectAll('text').data(data1);
        sales1.enter()
            .append('text')
            .merge(sales1)
            .transition()
            .duration(1000)
            .attr('x', function(d){return 8+x1(d['Global_Sales']);})
            .attr('y', function(d){return 20+y1(d['Name']);})
            .style('text-anchor', 'start')
            .text(function(d){return d['Global_Sales'];});
        y_axis_text1.text('Game Titles');
        if (year === 'All') {
          title1.text('Top 10 Titles of All Time');
        }
        else {
          title1.text('Top 10 Titles in ' + year);
        }
        bars.exit().remove();
        sales1.exit().remove();
    });
}

//
//Graph 2 Part!!!
//
//NA_Sales, EU_Sales, JP_Sales, Other_Sales

let svg2 = d3.select('#graph2')
    .append('svg')
    .attr('width', graph_2_width)
    .attr('height', graph_2_height)
    .append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`);

let tooltip = d3.select("#graph2")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

d3.csv('data/video_games.csv').then(function(data){
  data2 = cleanData(data);
  //Genre
  var NA_Sales_data = data2.map(function(d) {
    return {
      'Genre': d['Genre'],
      'NA_Sales': d['NA_Sales']
    }
  });
  var EU_Sales_data = data2.map(function(d) {
    return {
      'Genre': d['Genre'],
      'EU_Sales': d['EU_Sales']
    }
  });
  var JP_Sales_data = data2.map(function(d) {
    return {
      'Genre': d['Genre'],
      'JP_Sales': d['JP_Sales']
    }
  });
  var Other_Sales_data = data2.map(function(d) {
    return {
      'Genre': d['Genre'],
      'Other_Sales': d['Other_Sales']
    }
  });
  var data_arr = [NA_Sales_data, EU_Sales_data,  JP_Sales_data, Other_Sales_data];
  const col_names = ['NA_Sales', 'EU_Sales', 'JP_Sales', 'Other_Sales'];
  var agg_arr = [];
  for (var i = 0; i < data_arr.length; i++) {
    var output = data_arr[i].reduce((accumulator, cur) => {
      let mygenre = cur.Genre;
      let found = accumulator.find(elem => elem.Genre === mygenre)
      if (found) {
        found[col_names[i]] += cur[col_names[i]];
      }
      else {
        accumulator.push(cur);
      }
      return accumulator;
    }, []);
    output.sort(function(a, b) {return b[col_names[i]] - a[col_names[i]];});
    output = output.slice(0, 5);
    for (var j = 0; j < output.length; j++) {
      output[j]['sales'] = Math.round(output[j][col_names[i]]*100)/100;
      delete output[j][col_names[i]];
    }
    agg_arr.push(output);
  }
  data_together = [{'name': 'NA Sales', 'children': agg_arr[0]},
                  {'name': 'EU Sales', 'children': agg_arr[1]},
                  {'name': 'JP Sales', 'children': agg_arr[2]},
                  {'name': 'Other Sales', 'children': agg_arr[3]}];
  tree_data = {'children': data_together,
              'name': 'Sales'
              };
  var root = d3.hierarchy(tree_data).sum(function(d){return d.sales});
  d3.treemap()
  .size([graph_2_width - margin.right - margin.left,
        graph_2_height - margin.top - margin.bottom])
  .paddingTop(20)
  .paddingRight(7)
  .paddingInner(8)
  (root);

  // prepare a color scale
  var color = d3.scaleOrdinal()
    .domain(["NA_Sales", "EU_Sales", "JP_Sales", "Other_Sales"])
    .range([ "#151E3F", "#9A348E", "#DA627D", "#1FA4AB"]);

  genre_list = data1.map(function(d) {return d['Genre']});
  genre_list = [... new Set(genre_list)];
  var genre_color = d3.scaleOrdinal()
    .domain(genre_list)
    .range(d3.quantize(d3.interpolateHcl("#85FFC7", "#FF8552"), genre_list.length))

// And a opacity scale
  var opacity = d3.scaleLinear()
    .domain([30, 900])
    .range([.5,1]);

  let mouseover = function(d) {
      let color_span = `<span style="color: ${genre_color(d.data.Genre)};">`;
      let html = `${d.parent.data.name}<br/>
              Genre: ${color_span}${d.data.Genre}</span><br/>
              Sales (in millions): ${d.data.sales}`;
      tooltip.html(html)
          .style("left", `${(d3.event.pageX)-200}px`)
          .style("top", `${(d3.event.pageY)-100}px`)
          .style("outline-color", "black")
          .style("outline-style", "ridge")
          .style("font-size", "14px")
          .style("background-color", "white")
          .transition("opacity")
          .duration(500)
          .style("opacity", 1)
  };

  let mouseout = function(d) {
      // Set opacity back to 0 to hide
      tooltip.transition()
          .duration(500)
          .style("opacity", 0);
  };

  svg2
    .selectAll("rect")
    .data(root.leaves())
    .enter()
    .append("rect")
      .attr('x', function (d) { return d.x0; })
      .attr('y', function (d) { return d.y0; })
      .attr('width', function (d) { return d.x1 - d.x0; })
      .attr('height', function (d) { return d.y1 - d.y0; })
      .style("stroke", function (d) {return genre_color(d.data.Genre);})
      .style("stroke-width", "4px")
      .style("fill", function(d){ return color(d.parent.data.name)})
      .style("opacity", function(d){ return opacity(d.data.sales)})
      .on("mouseover", mouseover)
      .on("mouseout", mouseout);

  svg2
    .selectAll("text")
    .data(root.leaves())
    .enter()
    .append("text")
      .attr("x", function(d){ return d.x0+1})
      .attr("y", function(d){ return d.y0+12})
      .text(function(d){ return d.data.Genre})
      .attr("font-size", "11px")
      .attr("fill", "white");
  svg2
    .selectAll("vals")
    .data(root.leaves())
    .enter()
    .append("text")
      .attr("x", function(d){ return d.x0+1})
      .attr("y", function(d){ return d.y0+21})
      .text(function(d){ return d.data.sales })
      .attr("font-size", "10px")
      .attr("fill", "white")
  svg2
    .selectAll("titles")
    .data(root.descendants().filter(function(d){return d.depth==1}))
    .enter()
    .append("text")
      .attr("x", function(d){ return d.x0})
      .attr("y", function(d){ return d.y0+13})
      .text(function(d){ return d.data.name })
      .attr("font-size", "19px")
      .attr("fill",  function(d){ return color(d.data.name)} );
  svg2
    .append("text")
      .attr("x", 0)
      .attr("y", 14)    // +20 to adjust position (lower)
      .text("Top 5 Genres per Region (Sales)")
      .attr("font-size", "19px")
      .attr("fill",  "grey" )
});
//
//Graph 3!!!!
//

let svg3 = d3.select('#graph3')
    .append('svg')
    .attr('width', graph_3_width)
    .attr('height', graph_3_height)
    .append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`);

let countRef3 = svg3.append("g");

let countRef4 = svg3.append("g");

d3.csv('data/video_games.csv').then(function(data){
    data1 = cleanData(data);
    genres = data1.map(function(d){return d.Genre;});
    genres = [... new Set(genres)];
    final_results = [];
    for (var i = 0; i < genres.length; i++) {
      genre_data = data1.filter(function(d){
        return d['Genre'] === genres[i];
      });
      var output = genre_data.reduce((accumulator, cur) => {
        let mygenre = cur.Publisher;
        let found = accumulator.find(elem => elem.Publisher === mygenre)
        if (found) found['Global_Sales'] += cur['Global_Sales'];
        else accumulator.push(cur);
        return accumulator;
      }, []);
      output.sort(function(a, b) {return b['Global_Sales'] - a['Global_Sales'];});
      output1 = output[0];
      output1['Global_Sales'] = Math.round(output1['Global_Sales']*100)/100;
      final_result = {'Genre': genres[i], 'Global_Sales': output1['Global_Sales'],
                      'Publisher': output1['Publisher']};
      final_results.push(final_result);
    }

    let x3 = d3.scaleLinear()
        .domain([0,d3.max(final_results, function(d) {return d.Global_Sales;})])
        .range([0,graph_3_width - margin.left - margin.right]);

    let y3 = d3.scaleBand()
        .domain(final_results.map(function(d) {return d["Genre"]}))
        .range([0,graph_3_height - margin.top - margin.bottom])
        .padding(0.1);

    svg3.append("g")
        .call(d3.axisLeft(y3).tickSize(0).tickPadding(10));

    let bars3 = svg3.selectAll("rect").data(final_results);

    let color3 = d3.scaleOrdinal()
        .domain(final_results.map(function(d) { return d["Genre"] }))
        .range(d3.quantize(d3.interpolateHcl("#EFCA08", "#00A6A6"), genres.length));

    bars3.enter()
        .append("rect")
        .merge(bars3)
        .attr("fill", function(d) { return color3(d['Genre']) })
        .attr("y", function(d) {return y3(d['Genre']);})
        .attr("height",  y3.bandwidth());

    let counts3 = countRef3.selectAll("text").data(final_results);

    counts3.enter()
        .append("text")
        .merge(counts3)
        .attr("x", function(d){return 8+x3(d.Global_Sales);})
        .attr("y", function(d){return 15+y3(d.Genre);})
        .style("text-anchor", "start")
        .text(function(d){return d.Global_Sales;});

    let pub = countRef4.selectAll("text").data(final_results);

    pub.enter()
        .append("text")
        .merge(counts3)
        .attr("x", function(d){return 8+x3(d.Global_Sales);})
        .attr("y", function(d){return 30+y3(d.Genre);})
        .style("text-anchor", "start")
        .text(function(d){return d.Publisher;});

    svg3.append("text")
        .attr("transform", `translate(250,500)`)
        .style("text-anchor", "middle")
        .text("Global Sales (millions)");

    svg3.append("text")
        .attr("transform", `translate(-100,200)`)
        .style("text-anchor", "middle")
        .text("Genres");

    svg3.append("text")
        .attr("transform", `translate(250,-10)`)
        .style("text-anchor", "middle")
        .style("font-size", 20)
        .text("Top Publishers in Sales by Genre");
})


function cleanData(data) {
    for (var i = 0; i < data.length; i++) {
      data[i]['Year'] = parseInt(data[i]['Year']);
      data[i]['Rank'] = parseFloat(data[i]['Rank']);
      data[i]['NA_Sales'] = parseFloat(data[i]['NA_Sales']);
      data[i]['EU_Sales'] = parseFloat(data[i]['EU_Sales']);
      data[i]['JP_Sales'] = parseFloat(data[i]['JP_Sales']);
      data[i]['Other_Sales'] = parseFloat(data[i]['Other_Sales']);
      data[i]['Global_Sales'] = parseFloat(data[i]['Global_Sales']);
    }
    return data;
}

set_top_10('All');
