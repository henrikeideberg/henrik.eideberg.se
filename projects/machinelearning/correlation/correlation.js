/*  Correlation calculations in javascript
 *  Henrik Eideberg
 *  
 *  TBD - Add information here
*/
console.clear();
const x1 = [2.5, 3.6, 1.2, 0.8, 4.0, 3.4];
const x2 = [1.2, 1.0, 1.8, 0.9, 3.0, 2.2];
const x3 = [8.0, 15.0, 12.0, 6.0, 8.0, 10.0];

//Reduce the arrays to single values
//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce
const reduce2Sum = (accumulator, currentValue) => accumulator + currentValue;
const itemSquared = function(item) {
    return item*item;
}
const itemsMultiplied = function(item1, item2) {
  if (item1.length !== item2.length || item1.length === 0) return false;
  else {
    var returnValue = 0;
    for(var i=0; i<item1.length; i++){
      returnValue = returnValue + item1[i]*item2[i];
    }
    return returnValue;
  }
}

function calcStdDev(x) {
  "use strict";
  if(x === undefined || x.length === 0) return false;
  else {
    var eachElementSquared = x.map(itemSquared);
    var sumEachElementSquared = eachElementSquared.reduce(reduce2Sum);
    var sumSquared = (x.reduce(reduce2Sum))*(x.reduce(reduce2Sum));
    return sumEachElementSquared - sumSquared/x.length;
  }
}

function calcCovariance(x, y) {
  "use strict";
  if(x === undefined ||
     x.length === 0 ||
     y === undefined ||
     y.length === 0 ||
     x.length !== y.length) return false;
  else {
    var sumxTimesY = itemsMultiplied(x, y);
    var sumxTimesSumy = x.reduce(reduce2Sum)*y.reduce(reduce2Sum);
    return sumxTimesY - sumxTimesSumy/x.length;
  }
}

function calcCorrCoeff(x, y) {
  "use strict";
  return calcCovariance(x, y)/Math.sqrt(calcStdDev(x)*calcStdDev(y));
}

function corrX1X2() {
  "use strict";
  var x1StdDev = calcStdDev(x1);
  var x2StdDev = calcStdDev(x2);
  var x1x2Covar = calcCovariance(x1, x2);
  var x1x2corrCoef = calcCorrCoeff(x1, x2);
  document.getElementById("corrX1X2").innerHTML = "S<sub>x1x1</sub> = " + x1StdDev + "<br>" +
                                                  "S<sub>x2x2</sub> = " + x2StdDev + "<br>" +
                                                  "S<sub>x1x2</sub> = " + x1x2Covar + "<br>" +
                                                  "<i>ρ</i> = " + x1x2corrCoef;
  var switchDecision = "corrX1X2";
  onAccordionButtonClick(switchDecision);
}

function corrX1X3() {
  "use strict";
  var x1StdDev = calcStdDev(x1);
  var x3StdDev = calcStdDev(x3);
  var x1x3Covar = calcCovariance(x1, x3);
  var x1x3corrCoef = calcCorrCoeff(x1, x3);
  document.getElementById("corrX1X3").innerHTML = "S<sub>x1x1</sub> = " + x1StdDev + "<br>" +
                                                  "S<sub>x3x3</sub> = " + x3StdDev + "<br>" +
                                                  "S<sub>x1x3</sub> = " + x1x3Covar + "<br>" +
                                                  "<i>ρ</i> = " + x1x3corrCoef;
  var switchDecision = "corrX1X3";
  onAccordionButtonClick(switchDecision);
}

function corrX2X3() {
  "use strict";
  var x2StdDev = calcStdDev(x2);
  var x3StdDev = calcStdDev(x3);
  var x2x3Covar = calcCovariance(x2, x3);
  var x2x3corrCoef = calcCorrCoeff(x2, x3);
  document.getElementById("corrX2X3").innerHTML = "S<sub>x2x2</sub> = " + x2StdDev + "<br>" +
                                                  "S<sub>x3x3</sub> = " + x3StdDev + "<br>" +
                                                  "S<sub>x2x3</sub> = " + x2x3Covar + "<br>" +
                                                  "<i>ρ</i> = " + x2x3corrCoef;
  var switchDecision = "corrX2X3";
  onAccordionButtonClick(switchDecision);
}

function onAccordionButtonClick(switchDecision) {
  var acc = document.getElementsByClassName(switchDecision);
  var i;

  for (i = 0; i < acc.length; i++) {
    acc[i].onclick = function() {
      this.classList.toggle("active");
      var panel = this.nextElementSibling;
      if (panel.style.maxHeight){
        panel.style.maxHeight = null;
      } else {
        panel.style.maxHeight = panel.scrollHeight + "px";
      } 
    }
  }
}