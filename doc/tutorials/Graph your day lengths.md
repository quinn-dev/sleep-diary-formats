<img style="float:right" src="Graph your day lengths.jpg">

In this tutorial, we will use the [the summarise_days() function]{@link DiaryStandard#summarise_days} and [D3.js](https://d3js.org/) to create a graph of your recent day lengths.  This tutorial assumes a basic understanding of HTML and JavaScript, and assumes you have already created a sleep diary in a supported format.

## Step one: create your folder and HTML

Create a new folder called `day-length-graph` and copy [sleep-diary-formats.js](../sleep-diary-formats.js) into it.  This is where all our code will go.

Now open a text editor and paste in this HTML:

<div style="clear:both"></div>

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>Day length graph</title>
  </head>
  <body>
  
    <div><input type="file" id="diary-input"></div>

    <svg style="background:#eeeeee" width="600" height="500"></svg>
    
    <script src="https://cdnjs.cloudflare.com/ajax/libs/d3/6.3.1/d3.min.js"></script>
    <script src="./sleep-diary-formats.js"></script>
    <script src="index.js"></script>

  </body>
</html>
```

Save the file as `index.html` in your `day-length-graph` folder, then go to the folder and open `index.html` in a web browser.

You should see a page with a file input and a light grey rectangle.  Next we'll add some JavaScript to load the diary, then we'll display a graph in the rectangle.

## Step two: load your sleep diary

Open a text editor and paste in this JavaScript

```javascript
var diary_loader = new DiaryLoader(
    (diary,source) => {

        console.log( "Here's your data in Standard format:\n", diary.to("Standard") );
    
    },
    (raw,source) => {
        alert( "Could not load diary" );
    }
);

document.getElementById("diary-input")
    .addEventListener( "change", event => diary_loader.load(event) );
```

Save this file as `index.js` in your `day-length-graph` folder, then refresh `index.html` in your browser.  Then open your browser developer tools by pressing _ctrl + shift + C_ (_Apple + shift + C_ on Mac), and click _Console_ to see `console.log` messages.

Now use the file input at the top of the page to load your sleep diary.  You should see an interactive representation of your data in the console.  And because we used `.to("Standard")`, your data will have the same layout no matter which program you created it with.

Have a look around your data before you continue.

## Step three: analyse your sleep diary

Now we've loaded your data into JavaScript, we need to calculate how long your days have been.  Find this line in your JavaScript:

```javascript
        console.log( diary.to("Standard") );
```

Remove that line and replace it with these:

```javascript
        var cutoff = new Date().getTime() - 30*24*60*60*1000; // 30 days
        var summary = diary.to("Standard").summarise_days( r => r.start > cutoff );

        console.log(summary);
```

Save the file, refresh the page and reload your diary.  Now the console should have summary information for the last 30 days.

Have a look around that data.  There's a lot there, but `durations` is the only part we'll use in this tutorial.

## Step four: prepare your data for D3

To make a bar graph, D3.js needs to know the label and height of each bar.  More specifically, it needs three variables: a list of with both labels and heights, a list with just the labels, and a list with just the heights.

Replace the `console.log` line with these:

```javascript
        var bars = summary.durations
          .map( (r,n) => [r,'day ' + n] ) // add labels
          .filter( r => r[0] ) // remove missing values
        ;

        var heights = bars.map( d => d[0] );
        var labels = bars.map( d => d[1] );

        console.log( bars, labels, heights );
```

Once again, save the file and inspect the results before you carry on.

## Step five: create the graph

Now we need to tell D3 to display the graph in your `<svg>` element.  Replace the `console.log` line with the following:

```javascript
        // initialise the <svg> element:
        var svg = d3.select("svg"),
            width = svg.attr("width") - 50,
            height = svg.attr("height") - 40,
            xScale = d3.scaleBand().range ([0, width]).padding(0.4),
            yScale = d3.scaleLinear().range ([height, 0]),
            g = svg.append("g")
              .attr("transform", "translate(49,0)")
        ;

        // define the size of the X and Y axes:
        xScale.domain(labels);
        yScale.domain([d3.min(heights) * 0.95, d3.max(heights) * 1.05]);

        // populate the graph:
        g.selectAll(".bar")
            .data(bars)
            .enter().append("rect")
            .attr("x", d => xScale(d[1]) )
            .attr("y", d => yScale(d[0]) )
            .attr("width", xScale.bandwidth())
            .attr("height", d => height - yScale(d[0]) )
            .style("fill", "steelblue")
        ;
```

Now when you refresh and load your diary, you should see a list of bars showing how long your recent days have been.

## Step six: add some labels

Now you have a bar graph, so the last step is to add some labels to it.  Add this after the last line in the previous section:

```javascript
        g.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(xScale))
        ;

        g.append("g")
            .call(d3.axisLeft(yScale).tickFormat(
                t => {
                    var hours   = Math.floor( t / (60*60*1000) ),
                        minutes = Math.floor( t /    (60*1000) ) % 60
                    ;
                    return hours + ( minutes < 10 ? ':0' : ':' ) + minutes;
                }).ticks(10))
            .append("text")
            .attr("y", 6)
            .attr("dy", "0.71em")
            .attr("text-anchor", "end")
            .text("value")
        ;
```

This tells D3 to add labels to the X and Y axes.  Now you have a graph of your recent day lengths!

See [the source code for this example](day-length-graph/).
