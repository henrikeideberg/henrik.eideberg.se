/*
 * K mean clustering > Image difference calculations in javascript
 *  Henrik Eideberg 2018
*/
console.clear();
const imageA_array = [
                       154, 157, 157, 157, 150, 150, 170, 170, 175, 190,
                       154, 157, 157, 151, 153, 155, 180, 180, 170, 190,
                       154, 157, 150, 154, 160, 160, 160, 155, 155, 165,
                       157, 157, 148, 148, 148, 160, 150, 155, 155, 165,
                       100, 102, 104, 157, 142, 180, 170, 165, 10, 20,
                       100, 103, 105, 165, 155, 180, 175, 162, 40, 50,
                       100, 102, 108, 132, 180, 180, 172, 167, 25, 63,
                       18, 28, 48, 12, 13, 20, 5, 15, 30, 40,
                       15, 36, 46, 18, 21, 22, 28, 32, 30, 36,
                       17, 21, 24, 26, 35, 45, 28, 30, 40, 20
                     ];
const imageB_array = [
                       152, 156, 157, 156, 149, 150, 170, 160, 175, 190,
                       154, 159, 157, 151, 153, 155, 180, 180, 170, 190,
                       153, 157, 155, 154, 160, 160, 160, 155, 155, 165,
                       157, 157, 148, 148, 148, 160, 150, 155, 155, 165,
                       101, 102, 104, 159, 143, 180, 170, 165, 110, 220,
                       99, 103, 105, 164, 155, 179, 175, 162, 240, 250,
                       100, 102, 108, 132, 180, 180, 172, 167, 155, 163,
                       118, 123, 148, 129, 109, 120, 155, 215, 140, 180,
                       156, 136, 210, 218, 175, 122, 128, 232, 180, 156,
                       178, 231, 245, 226, 215, 145, 188, 230, 170, 140
                     ];
const reduce2Sum = (accumulator, currentValue) => accumulator + currentValue;

var diffImage = [];//Array to hold the Image difference data.
                   //Each entry in the array represents a pixel
var centroids = [];//Array to hold the positions of the centroids
var c1 = [];//Array to hold data points which 'belong' to centroid 1,
            //i.e. the cluster that has centroid 1 in center.
var c2 = [];//Array to hold data points which 'belong' to centroid 2,
            //i.e. the cluster that has centroid 2 in the center.
var kMeanStepCounter = 0;//Counter to keep track of which step in the
                         //iteration is to be executed.
                         // 0 => Step 1: Calculate position of centroids.
                         // 1 => Step 2: Find closest centroid for each data
                         //              point.
var converged = 0;//0 - calculations has not converged, continue calculations
                  //1 - calculation has converged and can stop.

window.onload = initGui;

/*
 * Function to calculate the difference between imageA and imageB.
 * Difference = |A-B| for each pixel coordinate in the images.
*/
function calcDiffImage() {
  if(diffImage.length === 0) { //dont add more html children
    if(imageA_array.length !== imageB_array.length) return;

    //https://www.w3schools.com/js/js_array_methods.asp
    //Populate the diffImage array
    for(var i=0; i<imageA_array.length; i++) {
      diffImage.push(Math.abs(imageA_array[i]-imageB_array[i]));
    }
    //Show the diffImage in the html page
    var imageDiv = document.createElement('div');
    var diffImageDiv = document.getElementById('diffImage');
    imageDiv.className = 'image';
    for(var i=0; i<diffImage.length; i++) {
      var pixelDiv = document.createElement('div');
      pixelDiv.className = 'pixel';
      pixelDiv.innerHTML = diffImage[i];
      imageDiv.appendChild(pixelDiv);
    }
    diffImageDiv.appendChild(imageDiv);

    //Plot the image difference data
    plotInitialImageDiffdata();
    document.getElementById("diffImagePlotInformation").innerHTML =
      "Plot showing image difference data can be found at bottom of page."
  }
}

/*
 * Function to plot the initial image difference plot and add plot information.
*/
function plotInitialImageDiffdata(){
  var plotInitialImageDiffdata = {
    x: diffImage,
    y: getArrayOfZeroes(diffImage.length),
    mode: 'markers',
    marker: {
      size: 12,
      line: {
      color: 'rgba(217, 217, 217, 0.14)',
      width: 0.5},
      opacity: 0.8},
    type: 'scatter',
  };
  addPlot([plotInitialImageDiffdata]);
  document.getElementById("plotInformation").innerHTML =
    "Initial image difference data"
}

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
  if((diffImage.length > 0) && (converged === 0)){
    while((diffImage.length > 0) && (converged === 0)){
      kMeanManual(0);
    }
    addPlot(getPlotData_Centroids_c1_c2());
    document.getElementById("plotInformation").innerHTML =
      "Previous iteration and current iteration has same data.<br>" +
      "Iteration is complete and optimal solution has been obtained.<br>" +
      "Centroids at " + centroids[0] + " (c1) and " + centroids[1] + " (c2)" +
      ", (blue markers).<br>" +
      "Calculated clusters are shown in orange and green markers";
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
  if((diffImage.length > 0) && (converged === 0)){
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
    document.getElementById("plotInformation").innerHTML =
      "Previous iteration and current iteration has same data.<br>" +
      "Iteration is complete and optimal solution has been obtained.<br>" +
      "Centroids at " + centroids[0] + " (c1) and " + centroids[1] + " (c2)" +
      ", (blue markers).<br>" +
      "Calculated clusters are shown in orange and green markers";
  }
}

/*
 * Function to reset the K Mean clustering calculations.
*/
function Reset(){
  if(diffImage.length > 0){
    centroids = [];
    c1 = [];
    c2 = [];
    kMeanStepCounter = 0;
    converged = 0;
    plotInitialImageDiffdata();
    document.getElementById("plotInformation").innerHTML = "Data reset";
  }
}

/*
 * Function to find closest centroid for each data point using Euclidean
 * distance.
*/
function getClosestCentroid(plot){
  //First clear c1 and c2
  while(c1.length > 0){
    c1.pop();
  }
  while(c2.length > 0){
    c2.pop();
  }
  //Then find closest centroid to each data point using Euclidean distance,
  //and populate c1 or c2 (depending which centroid is closest).
  for(var i=0; i<diffImage.length; i++){
    distC1 = Math.abs(diffImage[i]-centroids[0]);
    distC2 = Math.abs(diffImage[i]-centroids[1])
    if(distC1 < distC2) c1.push(diffImage[i])
    else c2.push(diffImage[i])
  }
  if(plot === 1){
    addPlot(getPlotData_Centroids_c1_c2());
    document.getElementById("plotInformation").innerHTML =
      "Centroids at " + centroids[0] + " (c1) and " + centroids[1] + " (c2)" +
      ", (blue markers).<br>" +
      "Calculated closest centroid for each data point (orange and green markers)";
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
  if(centroids.length === 0){ //Randomly initialise two centroids
    var random_1 = getRandomArrayIndex(diffImage);
    var random_2 = getRandomArrayIndex(diffImage);
    while (diffImage[random_1] === diffImage[random_2]){
      random_2 = getRandomArrayIndex(diffImage);
    }
    centroids.push(diffImage[random_1]);
    centroids.push(diffImage[random_2]);
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
      var InitialImageDiffPlotData = {
        x: diffImage,
        y: getArrayOfZeroes(diffImage.length),
        mode: 'markers',
        marker: {
          size: 12,
          line: {
          width: 0.5},
          opacity: 0.8},
        type: 'scatter',
        name: 'Image Difference Data'
      };
      plotData = [centroidPlotData, InitialImageDiffPlotData];
      plotInfoString = "Centroids randomly placed at " + centroids[0] +
                       " and " + centroids[1];
    }
  }
  else{//Calculate new centroid positions based on content in c1 and c2
    var sumC1 = c1.reduce(reduce2Sum);
    var sumC2 = c2.reduce(reduce2Sum);
    var c1NewPos = sumC1/c1.length;
    var c2NewPos = sumC2/c2.length;
    if((centroids[0] === c1NewPos) && (centroids[1] === c2NewPos)){
      converged = 1;
    }
    while(centroids.length > 0){
      centroids.pop();
    }
    centroids.push(c1NewPos);
    centroids.push(c2NewPos);
    if(plot === 1){
      plotData = getPlotData_Centroids_c1_c2();
      plotInfoString = "Centroids position recalculated to " + centroids[0] +
                       " (c1) and " + centroids[1] + " (c2)";
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
function getPlotData_Centroids_c1_c2(){
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
  var c1PlotData = {
    x: c1,
    y: getArrayOfZeroes(c1.length),
    mode: 'markers',
    marker: {
      size: 12,
      line: {
      width: 0.5},
      opacity: 0.8},
    type: 'scatter',
    name: 'Data closest to centroid 1'
  };
  var c2PlotData = {
    x: c2,
    y: getArrayOfZeroes(c2.length),
    mode: 'markers',
    marker: {
      size: 12,
      line: {
      width: 0.5},
      opacity: 0.8},
    type: 'scatter',
    name: 'Data closest to centroid 2'
  };
  return [centroidPlotData, c1PlotData, c2PlotData];
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
  addImageA();
  addImageB();
}

/*
 * Function to plot data in predefined plot-area (div clusterPlot)
*/
function addPlot(dataArray) {
  var layout = {
    xaxis: {
      range: [-10, 250]
    },
    yaxis: {
      range: [-1, 1]
    },
    title: 'Image Difference Data',
  };
  Plotly.newPlot('clusterPlot', dataArray, layout);
}

/*
 * Function to add Image B (i.e. array imageB_array) in div 'imageB'
 * Each element in the array imageB_array will be displayed as a 'pixel'.
*/
function addImageB() {
  var imageDiv = document.createElement('div');
  var imageBDiv = document.getElementById('imageB');
  imageDiv.className = 'image';
  for(var i=0; i<imageB_array.length; i++) {
    var pixelDiv = document.createElement('div');
    pixelDiv.className = 'pixel';
    pixelDiv.innerHTML = imageB_array[i];
    imageDiv.appendChild(pixelDiv);
  }
  imageBDiv.appendChild(imageDiv);
}

/*
 * Function to add Image a (i.e. array imageA_array) in div 'imageA'
 * Each element in the array imageA_array will be displayed as a 'pixel'.
*/
function addImageA() {
  var imageDiv = document.createElement('div');
  var imageADiv = document.getElementById('imageA');
  imageDiv.className = 'image';
  for(var i=0; i<imageA_array.length; i++) {
    var pixelDiv = document.createElement('div');
    pixelDiv.className = 'pixel';
    pixelDiv.innerHTML = imageA_array[i];
    imageDiv.appendChild(pixelDiv);
  }
  imageADiv.appendChild(imageDiv);
}
