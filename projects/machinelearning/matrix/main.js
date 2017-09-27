/*  Matrix calculations in javascript
 *  Henrik Eideberg
 *  
 *  Matrix functions:
 *  http://mathjs.org/docs/reference/functions.html#matrix-functions
 *  http://mathjs.org/docs/datatypes/matrices.html
 *  https://www.mathsisfun.com/algebra/matrix-inverse.html
 *  http://www.mathsisfun.com/algebra/matrix-introduction.html
 */
"use strict";

function identityInverseTranspose() {
  var a = math.matrix([[1,2], [3,4]]);
  var b = math.matrix([[6,4,24], [1,-9,8]]);
  var identity = math.eye(2);
  var inverse_a = math.inv(a);
  var transpose_b = math.transpose(b);
  document.getElementById("identityInverseTransposeDiv").innerHTML = a + "<br>" +
                                                                     b + "<br>" +
                                                                     identity + "<br>" +
                                                                     inverse_a + "<br>" +
                                                                     transpose_b;
  var switchDecision = "identityInverseTransposeAccordion";
  onAccordionButtonClick(switchDecision);
}

function matrixMatrixMultiplication() {
  var a = math.matrix([[1, 2], [3, 4], [5, 6]]);
  var b = math.matrix([[1], [2]]);
  var mult_ab = math.multiply(a,b);
  document.getElementById("matrixMatrixMultiplicationDiv").innerHTML = a + "<br>" +
                                                                       b + "<br>" +
                                                                       mult_ab;
  var switchDecision = "matrixMatrixMultiplicationAccordion";
  onAccordionButtonClick(switchDecision);
}

function vectorMatrixMultiplication() {
  var a = math.matrix([[1, 2, 3], [4, 5, 6], [7, 8, 9]]);
  var v = math.matrix([[1], [1], [1]]);
  var mult_av = math.multiply(a, v);
  document.getElementById("vectorMatrixMultiplicationDiv").innerHTML = a + "<br>" +
                                                                       v + "<br>" +
                                                                       mult_av;
  var switchDecision = "vectorMatrixMultiplicationAccordion";
  onAccordionButtonClick(switchDecision);
}

function matrixAddSubScMulti() {
  var a = math.matrix([[1, 2, 4], [5, 3, 2]]);
  var b = math.matrix([[1, 3, 4], [1, 1, 1]]);
  var s = 2;
  var add_AB = math.add(a, b);
  var sub_AB = math.subtract(a, b);
  var mult_As = math.multiply(a, s);
  var div_As = math.divide(a, s);
  var add_As = math.add(a, s);
  document.getElementById("matrixAddSubScMultiDiv").innerHTML = a + "<br>" +
                                                                b + "<br>" +
                                                                s + "<br>" +
                                                                add_AB + "<br>" +
                                                                sub_AB + "<br>" +
                                                                mult_As + "<br>" +
                                                                div_As + "<br>" +
                                                                add_As;
  var switchDecision = "matrixAddSubScMultiAccordion";
  onAccordionButtonClick(switchDecision);
}

function defineMatrix() {
  var a = math.matrix([[1, 2, 3], [4, 5, 6], [7, 8, 9], [10, 11, 12]]);
  var v = math.matrix([[1], [2], [3]]);
  var m = math.size(a);
  var index23 = math.subset(a, math.index(1,2));
  document.getElementById("defineMatrixDiv").innerHTML = a + "<br>" + 
                                                         v + "<br>" +
                                                         m + "<br><br>" +
                                                         index23;
  var switchDecision = "defineMatrixAccordion";
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