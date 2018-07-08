/*  Predict housing prices using k-nearest algorithm
 *  Henrik Eideberg 2018
 *  
 *  Theory: https://drive.google.com/open?id=10UFyocNIvnpHJMCYGYLhk5ni2zplyyqaf2zviyoG1K8
 *  Plotting tool: https://plot.ly/javascript/
 */

/************************** MAIN *********************************
 * 
 *
/*****************************************************************/
plotTrainingAndTestDataInTopPlot();//Plot training data and test data in top plot

//find k nearest neighbour in training data based on testPoint data.
function findPriceWithKNeighbour(k, testPoint) {
  var trainingDataArray = getTraningDataArray();//Get the training data
  var distArray = calcDistance(trainingDataArray, testPoint);//Calculate distance to alll neighbours
  var nearestNeighbour = getNearestNeighbor(k, distArray);//Get the k nearest neighbour(s)
  plotTestSampleAndNearestNeighbour(nearestNeighbour, testPoint);//Plot test point and k nearest neighbour(s) in bottom plot
}

/****************************************** CALCULATIONS ******************************************/
/*
 * Calculate nearest neigbour using the Euclidean distance.
 * See https://drive.google.com/open?id=10UFyocNIvnpHJMCYGYLhk5ni2zplyyqaf2zviyoG1K8
 * for more information how it is done.
*/
function calcDistance(trainingData, testPoint) {
  //__Expected data format__
  //trainingData      testPoint
  //[                 {
  //  [s001],           rooms
  //  [s002],           size
  //  [s003],           age
  //  ...             }
  //]

  var resultingDistArry = [];
  for(var i=0; i<trainingData.length; i++){
    var dist = Math.sqrt(
      Math.pow((trainingData[i].rooms - testPoint.rooms), 2) +
      Math.pow((trainingData[i].size - testPoint.size), 2) +
      Math.pow((trainingData[i].age - testPoint.age), 2));
      
    //Add sample data point id, test data point id and
    //their distance to the resultingDistArry
    resultingDistArry.push(
    {
      sId: trainingData[i].id,
      tId: testPoint.id,
      dist: dist
    });
  }
  return resultingDistArry;
}

/*
 * Return k number of training samples which are closests
 * to the testPoint (value dist in distArray).
*/
function getNearestNeighbor(k, distArray){
  //sort distArray in ascending order
  distArray.sort(function (a, b) {
    return a.dist - b.dist;
  });

  //return the k number of ids
  var nN = [];
  for(var i=0; i<k; i++){
    nN.push(getTrainingSample(distArray[i].sId));
  }
  return nN;
}

/***************************************** PLOTTING ***********************************************/

/*
 * Plot training and test data in same plot (top plot)
*/
function plotTrainingAndTestDataInTopPlot() {
  var trainingData = {
    x: getTraningDataArrayRoom(),
    y: getTraningDataArraySize(),
    z: getTraningDataArrayAge(),
    mode: 'markers',
    marker: {
      size: 12,
      line: {
      color: 'rgba(217, 217, 217, 0.14)',
      width: 0.5},
      opacity: 0.8},
    type: 'scatter3d',
    name: 'Training Data'
  };
  var testData = {
    x: getTestDataArrayRoom(),
    y: getTestDataArraySize(),
    z: getTestDataArrayAge(),
    mode: 'markers',
    marker: {
      size: 12,
      line: {
      color: 'rgba(54, 231, 163, 0.14)',
      width: 0.5},
      opacity: 0.8},
    type: 'scatter3d',
    name: 'Test Data'
  }
  var data = [trainingData, testData];
  var layout = {
    title: 'House properties data visualisation',
    margin: {
      l: 20,
      r: 20,
      b: 10,
      t: 30
    },
    scene: {
      xaxis:{title: 'x - nr. of rooms'},
      yaxis:{title: 'y - size of house'},
      zaxis:{title: 'z - age of house'},
      camera: {
            center: {x: 0, y: 0, z: 0}, 
            eye: { x:2.5, y:0.1, z:0.1}, 
            up: {x: 0, y: 0, z: 1}
      }
    }
  };
  Plotly.newPlot('originalData', data, layout);
}

/*
 * Plot test point and k nearest neighbor in result-plot (bottom plot)
*/
function plotTestSampleAndNearestNeighbour(nNData, testPoint){
  var data = [];
  
  //Loop through the array with nearest neighbor data and add each
  //element as data marker in the plot.
  for(var i=0; i<nNData.length; i++){
    var neighbourData = {
      x: [nNData[i].rooms],
      y: [nNData[i].size],
      z: [nNData[i].age],
      mode: 'markers',
      marker: {
        size: 12,
        line: {
        color: 'rgba(217, 217, 217, 0.14)',
        width: 0.5},
        opacity: 0.8},
      type: 'scatter3d',
      name: 'Neighbour ' +
            i + ': ' +
            nNData[i].price + '$'
    };
    data.push(neighbourData);
  }
  
  //Extract the data from the testPoint and add it as data marker in the plot
  var testData = {
    x: [testPoint.rooms],
    y: [testPoint.size],
    z: [testPoint.age],
    mode: 'markers',
    marker: {
      size: 12,
      line: {
      color: 'rgba(54, 231, 163, 0.14)',
      width: 0.5},
      opacity: 0.8},
    type: 'scatter3d',
    name: 'Test Sample'
  };
  data.push(testData);
  var layout = {
    title: 'Nearest neighbour for ' + testPoint.id,
    margin: {
      l: 20,
      r: 20,
      b: 10,
      t: 30
    },
    scene: {
      xaxis:{title: 'x - nr. of rooms'},
      yaxis:{title: 'y - size of house'},
      zaxis:{title: 'z - age of house'},
      camera: {
            center: {x: 0, y: 0, z: 0}, 
            eye: { x:2.5, y:0.1, z:0.1}, 
            up: {x: 0, y: 0, z: 1}
      }
    }
  };
  Plotly.newPlot('testLine', data, layout);
}

/************************** GUI/BUTTONS **************************
 * 
 *  Functions which reacts to GUI/HTML-page interactions
 *
/*****************************************************************/
function findPriceForTS1With1Neighbour() {
  var testDataArray = getTestDataArray();
  var k = 1;
  findPriceWithKNeighbour(k, testDataArray[0])
}

function findPriceForTS1With2Neighbour() {
  var testDataArray = getTestDataArray();
  var k = 2;
  findPriceWithKNeighbour(k, testDataArray[0])
}

function findPriceForTS2With1Neighbour() {
  var testDataArray = getTestDataArray();
  var k = 1;
  findPriceWithKNeighbour(k, testDataArray[1])
}

function findPriceForTS2With2Neighbour() {
  var testDataArray = getTestDataArray();
  var k = 2;
  findPriceWithKNeighbour(k, testDataArray[1])
}