/*
 * K mean clustering > Image difference calculations in javascript
 *  Henrik Eideberg 2018
*/
console.clear();
const cryptoPrices_array = [7845, 778, 942, 143, 0.75, 7956, 810, 976, 146,
                            0.76, 8215, 825, 1002, 152, 0.78, 8542, 847, 1038,
                            157, 0.78, 8150, 100587, 807, 1015, 150, 0.72,
                            8386, 884, 101964, 1085, 138, 0.82, 8219, 827,
                            995, 158, 0.82, 7500, 745, 948, 135, 0.67, 9257,
                            901, 120967, 1154, 148, 0.72, 8553, 811, 1218,
                            175, 0.84];

const reduce2Sum = (accumulator, currentValue) => accumulator + currentValue;

var centroids = [];//Array to hold the positions of the centroids
var clusters = [];
var kMeanStepCounter = 0;//Counter to keep track of which step in the
                         //iteration is to be executed.
                         // 0 => Step 1: Calculate position of centroids.
                         // 1 => Step 2: Find closest centroid for each data
                         //              point.
var converged = 0;//0 - calculations has not converged, continue calculations
                  //1 - calculation has converged and can stop.

window.onload = initGui;

/*
 * Function to automatically calculate the centroids and the clusters.
 * This function will iterate through the different steps
 *   Step 1: Place centroids (initial position and calculated position)
 *   Step 2: Calculate closest centroid for each data point using
 *           Euclidean distance
 * The function will iterate untill it finds that previous iteration and
 * current iteration has same data.
*/
function kMeanConverge(){
  if(converged === 0){
    while(converged === 0){
      kMeanManual(0);
    }
    kMeanManual(1);
  }
  else{
    kMeanManual(1);
  }
}

/*
 * Function to 'stepwise' calculate the centroids and the clusters.
 * When kMeanStepCounter is 0
 *  Place centroids (initial position and calculated position)
 * When kMeanStepCounter is 1
 *  Calculate closest centroid for each data point using Euclidean distance
 *
 * The function is 'complete' when data has converged, i.e. when new position
 * of the centroids (calculated) is same as previous position.
*/
function kMeanManual(plot){
  if(converged === 0){
    if(kMeanStepCounter === 0){
      placeCentroids(plot);
      kMeanStepCounter = 1;
    }
    else if (kMeanStepCounter === 1) {
      getClosestCentroid(plot);
      kMeanStepCounter = 0;
    }
    else {
      kMeanStepCounter = 0;
    }
  }
  else if(converged === 1){
    getClosestCentroid(1)
    convergedString();
  }
}

/*
 * Function to find closest centroid for each data point using Euclidean
 * distance.
*/
function getClosestCentroid(plot){
  //First clear all clusters
  clusters = [];
  for(var i=0; i<document.getElementById("nrOfClusters").value; i++){
    clusters.push([]);
  }

  //Then find closest centroid to each data point using Euclidean distance,
  //and populate clusters (depending which centroid is closest).
  for(var i=0; i<cryptoPrices_array.length; i++){
    dist = Math.abs(cryptoPrices_array[i]-centroids[0]);
    clusterIndex = 0;
    for(var j=1; j<centroids.length; j++){
      if(Math.abs(cryptoPrices_array[i]-centroids[j]) < dist){
        dist = Math.abs(cryptoPrices_array[i]-centroids[j]);
        clusterIndex = j;
      }
    }
    clusters[clusterIndex].push(cryptoPrices_array[i]);
  }
  if(plot === 1){
    addPlot(getPlotData_centroids_clusters());
    plotInfoString = "Centroids at:<br>";
    for(var i=0; i<centroids.length; i++){
      plotInfoString += centroids[i] + "<br>";
    }
    plotInfoString += "Calculated closest centroid for each data point";
    resultString = "Clusters:<br>";
    var clusterIndex = 0;
    for(var i=0; i<clusters.length; i++){
      clusterIndex = i+1;
      resultString += "Cluster " + clusterIndex + ": " + clusters[i] + "<br>";
    }
    document.getElementById("plotInformation").innerHTML = plotInfoString;
    document.getElementById("result").innerHTML = resultString;
  }
}

/*
 * Function to calculate positions of the two centroids.
 * Initially the position is randomly selected from the data.
 * In following iterations the positions of the centroids are calculated
 * based on content in c1 and c2.
*/
function placeCentroids(plot){
  var plotData = [];
  var plotInfoString = "";
  if(centroids.length === 0){ //Randomly initialise the centroids
    var numberOfCentroids = document.getElementById("nrOfClusters").value;
    var radioBtn = document.getElementById("RadioBtnRandom").checked;
    if( radioBtn === true){//Use random inital centroid positions
      var randomIndex = getRandomArrayIndex(cryptoPrices_array);
      centroids.push(cryptoPrices_array[randomIndex]);
      var index = 1;
      while(index<numberOfCentroids){
        randomIndex = getRandomArrayIndex(cryptoPrices_array);
        if(centroids.indexOf(cryptoPrices_array[randomIndex]) === -1){
          index += 1;
          centroids.push(cryptoPrices_array[randomIndex]);
        }
      }
    }
    else{//Use the first 'numberOfCentroids' data points as initial
         //centroid positions
      for(var i=0; i<numberOfCentroids; i++){
        centroids.push(cryptoPrices_array[i]);
      }
    }
    if(plot === 1){
      var centroidPlotData = {
        x: centroids,
        y: getArrayOfZeroes(centroids.length),
        mode: 'markers',
        marker: {
          size: 12,
          line: {
          width: 0.5},
          opacity: 0.8},
        type: 'scatter',
        name: 'Centroids'
      };
      var CryptoPricesPlotData = {
        x: cryptoPrices_array,
        y: getArrayOfZeroes(cryptoPrices_array.length),
        mode: 'markers',
        marker: {
          size: 12,
          line: {
          width: 0.5},
          opacity: 0.8},
        type: 'scatter',
        name: 'Cryptocurrency Prices'
      };
      plotData = [centroidPlotData, CryptoPricesPlotData];
      plotInfoString = "Centroids initially placed at:<br>";
      for(var i=0; i<centroids.length; i++){
        plotInfoString += centroids[i] + " ";
      }
    }
  }
  else{//Calculate new centroid positions based on content in c1 and c2
    var clusterSum = 0;
    var centroidNewPos = 0;
    var sameAsPrevIteration = 0;
    for(var i=0; i<clusters.length; i++){
      if(clusters[i].length > 0){ //If cluster has data, recalc new centroid pos
                                  //based on that data
        clusterSum = clusters[i].reduce(reduce2Sum);
        centroidNewPos = clusterSum/clusters[i].length;
      }
      else{
        //if cluster does not have any data, randomise new centroid pos
        //http://user.ceng.metu.edu.tr/~tcan/ceng465_f1314/Schedule/KMeansEmpty.html
        var max = Math.max(...cryptoPrices_array);
        var min = Math.min(...cryptoPrices_array);
        centroidNewPos = Math.floor((Math.random() * max) + min);
      }
      if(centroids[i] === centroidNewPos){
        sameAsPrevIteration = 1;
      }
      else{
        sameAsPrevIteration = 0;
      }
      centroids[i] = centroidNewPos;
    }
    if(sameAsPrevIteration === 1){
      converged = 1;
    }

    if(plot === 1){
      plotData = getPlotData_centroids_clusters();
      plotInfoString = "Centroids position recalculated to:<br>";
      for(var i=0; i<centroids.length; i++){
        plotInfoString += centroids[i] + "<br>";
      }
    }
  }
  if(plot === 1){
    addPlot(plotData);
    document.getElementById("plotInformation").innerHTML = plotInfoString;
  }
}

/*
 * Function which returns the datapoints and configurations for
 * the centroids, c1 (cluster 1) and c2 (cluster 2)
*/
function getPlotData_centroids_clusters(){
  var plotData = [];
  var centroidPlotData = {
    x: centroids,
    y: getArrayOfZeroes(centroids.length),
    mode: 'markers',
    marker: {
      size: 12,
      line: {
      width: 0.5},
      opacity: 0.8},
    type: 'scatter',
    name: 'Centroids'
  };
  plotData.push(centroidPlotData);
  for(var i=0; i<clusters.length; i++){
    var clusterId = i+1;
    var nameString = "Cluster" + clusterId;
    var clusterPlotData = {
      x: clusters[i],
      y: getArrayOfZeroes(clusters[i].length),
      mode: 'markers',
      marker: {
        size: 12,
        line: {
        width: 0.5},
        opacity: 0.8},
      type: 'scatter',
      name: nameString
    };
    plotData.push(clusterPlotData);
  }
  return plotData;
}

/*
 * Function to plot all the cryptocurrency data
*/
function plotInitialData(){
  var plotData = {
    x: cryptoPrices_array,
    y: getArrayOfZeroes(cryptoPrices_array.length),
    mode: 'markers',
    marker: {
      size: 12,
      line: {
      color: 'rgba(217, 217, 217, 0.14)',
      width: 0.5},
      opacity: 0.8},
    type: 'scatter',
  };
  addPlot([plotData]);
  document.getElementById("plotInformation").innerHTML =
    "All cryptocurrency data in one plot:";
  document.getElementById("result").innerHTML =
    "";
}

/*
 * Function to print the final result
*/
function convergedString(){
  var plotInfoString = "Previous iteration and current iteration has same data.<br>" +
                   "Iteration is complete and optimal solution has been obtained.<br>";
  var centroidString = "Centroids at:<br>";
  for(var i=0; i<centroids.length; i++){
    centroidString += centroids[i] + "<br>";
  }
  plotInfoString += centroidString;
  resultString = "Clusters:<br>";
  var clusterIndex = 0;
  for(var i=0; i<clusters.length; i++){
    clusterIndex = i + 1;
    resultString += "Cluster " + clusterIndex + ": " + clusters[i] + "<br>";
  }
  document.getElementById("plotInformation").innerHTML = plotInfoString;
  document.getElementById("result").innerHTML = resultString;
}

/*
 * Helper function to get an array of zeroes.
*/
function getArrayOfZeroes(length) {
  y = [];
  for(var i=0; i<length; i++) {
    y.push(0);
  }
  return y;
}

/*
 * Helper function to get a random 'existing' index from an array
*/
function getRandomArrayIndex(range) {
  var min = 0;
  var max = range.length-1;
  return Math.floor((Math.random() * max) + min);
}

/*
 * Function to initialise the html page on load
*/
function initGui() {
  plotInitialData();
}

/*
 * Function to reset the K Mean clustering calculations.
*/
function Reset(){
  console.clear();
  centroids = [];
  clusters = [];
  kMeanStepCounter = 0;
  converged = 0;
  initGui();
}

/*
 * Function to plot data in predefined plot-area (div clusterPlot)
*/
function addPlot(dataArray) {
  var layout = {
    xaxis: {
      range: [Math.min(...dataArray), Math.max(...dataArray)]
    },
    yaxis: {
      range: [-1, 1]
    },
    title: 'Cryptocurrency prices',
  };
  Plotly.newPlot('clusterPlot', dataArray, layout);
}
