/*  Housing Prices in Portland
 *  Henrik Eideberg
 *  Linear Regression with one variable
 *  https://drive.google.com/open?id=1gAfsHWeS-1XJGdPxNRXfLXpVordpvb9nSx7PGS0NgUA
 *  https://plot.ly/javascript/
 */
"use strict";

//The data is stored in two arrays, price and size.
//Price in 1000s of dollars)
var price = [ 180, 190, 200, 201, 210, 232, 235, 240, 241, 242, 243, 250, 251,
              252, 252, 257, 280, 290, 291, 300, 300, 300, 300, 300, 310, 315,
              320, 330, 331, 333, 346, 348, 350, 370, 371, 400, 400, 440, 460,
              470, 475, 500, 540, 330, 369
            ];

//Size in (feet)^2
var size =  [ 750, 1000, 1250, 1450, 1400, 1416, 1251, 1244, 1619, 1504, 1986,
              1125, 1479, 1759, 1875, 2000, 1300, 2238, 1779, 1248, 1259, 1801,
              2002, 2654, 2591, 2075, 1572, 1622, 1900, 2251, 2246, 2003,
              1852, 1675, 2375, 2104, 2100, 2300, 1496, 2502, 2203, 2688,
              3000, 1600, 2400
            ];

//Helper functions to get the original data
function getx(){
  return size;
}

function gety(){
  return price;
}

function getm(){
  return getx().length;
}

//Plot the original data
var ORIGINAL = document.getElementById('originalData');
var trace = {
  x: getx(),
  y: gety(),
  mode: 'markers',
  type: 'scatter'
};
var layout = {
  xaxis: {
    range: [ 0, 4000 ]
  },
  yaxis: {
    range: [0, 600]
  },
  title:'Original Data'
};
Plotly.plot( ORIGINAL, [trace], layout, { margin: { t: 0 } } );

// Converge to the best fitted line
function convergeAndPlot(theta0FromUser, theta1FromUser){
  //Max number of iterations
  var maxIterations = 200;
  calculateAndPlot(maxIterations, theta0FromUser, theta1FromUser);
}

//Calculate the best fitted line
function calculateAndPlot(count, theta0FromUser, theta1FromUser){
  var theta = [parseFloat(theta0FromUser), parseFloat(theta1FromUser)];
  var newTheta = [0, 0];
  while(count > 0){
    newTheta = calculate(theta);
    if((newTheta[0] == theta[0]) && (newTheta[1] == theta[1])){//Found the minimum - no need to continue
      console.log("Found the minumum, plotting");
      break;
    }
    count--;
    if(count == 0){//Max number of iterations reached
      console.log("Max number of iterations reached, plotting");
      break;
    }
    theta = newTheta;
  }
  plotLine(newTheta);
}

function calculate(theta){
  if(getx().length == gety().length){
    console.log("Data is complete");
    return gradientDescending(theta[0], theta[1]);
  }
  else{
    console.log("Data is incomplete");
  }
}

function plotLine(newTheta){
  var TESTER = document.getElementById('testLine');
  var OriginalTrace = {
    x: getx(),
    y: gety(),
    mode: 'markers',
    type: 'scatter'
  };
  var trace = {
    x: [800, 1200, 1600, 2400, 3200],
    y: [calculatey(newTheta, 800), calculatey(newTheta, 1200),
        calculatey(newTheta, 1600), calculatey(newTheta, 2400),
        calculatey(newTheta, 3200)],
  };
  var layout = {
  xaxis: {
    range: [ 0, 4000 ]
  },
  title:'Testline with theta ' + newTheta
};
  Plotly.newPlot( TESTER, [OriginalTrace, trace], layout, { margin: { t: 0 } } );
}

function calculatey(theta, x){
  return hypothesis(theta[0], theta[1], x);
}

/************************** ALGORITHMS ***************************/


/*****************************************************************/
/*  Gradient descending
 *  Used to minimise the result of the cost function, i.e. to find the best θs.
 */
function gradientDescending(theta0, theta1){
  var derivedTheta = [0, 0];
  var newTheta = [0, 0];
  var learningRate = 0.0000001;

  //Calculate the derivative fo theta0 and theta1
  for(var i = 0; i<getm(); i++){
    derivedTheta[0] += (hypothesis(theta0, theta1, getx()[i]) - gety()[i]);
    derivedTheta[1] += ((hypothesis(theta0, theta1, getx()[i]) - gety()[i]) * getx()[i]);
  }
  derivedTheta[0] = derivedTheta[0] / getm();
  derivedTheta[1] = derivedTheta[1] / getm();

  newTheta[0] = theta0 - learningRate*derivedTheta[0];
  newTheta[1] = theta1 - learningRate*derivedTheta[1];
  return newTheta;
}

/*  Hypothesis
 *  Used to calculate the predicted result based on 1 number variable
 *  h(x) = theta0 + theta1 * x
 *  where;
 *    x is the size of the house.
 *    thetha0 is estimated starting position on y axis
 *    thetha1 is estimated slope of line in x-y graph
 */
function hypothesis(theta0, theta1, xi){
  return (theta0 + (theta1 * xi));
}

/*  Cost function
 *  Used to calculate the difference between actual and predicted results.
 *  h(theta0, theta1) = (1/2m) * sum(i=1=>i=m)((h(xi)-yi)^2)
 *  where;
 *    h(xi) is the hypothesis for x for iteration/example/set i
 *    yi is the actual value for the iteration/example/set i
 */
function costFunction(theta0, theta1){
  var cost = 0;
  var sum = 0;

  for(var i=0; i<getm(); i++){
    //Summarize all the differences
    sum += (hypothesis(theta0, theta1, getx()[i])-gety()[i])*(hypothesis(theta0, theta1, getx()[i])-gety()[i]);
  }

  //Calculate the cost, i.e. the difference between
  //predicted and actual result.
  cost = sum / (2*getm());
  return cost;
}
