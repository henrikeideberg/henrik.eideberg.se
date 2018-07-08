//const MNIST_LABELS_PATH = 'http://henrik.eideberg.se/projects/temp/mnist_labels_uint8';
const MNIST_LABELS_PATH = 'mnist_labels_uint8';
var datasetLabels;
/*
const labelsRequest = fetch(MNIST_LABELS_PATH, {mode: 'arraybuffer'});
console.log(labelsRequest);
*/

fetch(MNIST_LABELS_PATH, {mode: 'arraybuffer'})
  .then(function(response) {
    return response.arrayBuffer();
  })
  .then(function(buffer) {
    console.log(buffer);
    datasetLabels = new Uint8Array(buffer);
    console.log(datasetLabels);
  });

var xhr=new XMLHttpRequest();
xhr.open("GET", MNIST_LABELS_PATH, true);
//Now set response type
xhr.responseType = 'arraybuffer';
xhr.addEventListener('load',function(){
  if (xhr.status === 200){
    console.log(xhr.response) // ArrayBuffer
    //console.log(new Blob([xhr.response])) // Blob
  }
})
xhr.send();

//fetch(MNIST_LABELS_PATH, {mode: 'arraybuffer'})
//  .then(res => res.json())
//  .then(data => obj = data)
//  .then(console.log)
//  .then(() => console.log(obj))
//const labelsResponse = await Promise.all(labelsRequest);
//this.datasetLabels = new Uint8Array(await labelsResponse.arrayBuffer());

var img_color = new Image();
var img_gray = new Image();
var img_binary = new Image();
img_color.src = 'image_0001.jpg';
img_gray.src = 'image_0001_gray.jpg';
img_binary.src = 'image_0001.bmp';
var canvas_color = document.getElementById('canvas_color');
var canvas_gray = document.getElementById('canvas_gray');
var binary_gray = document.getElementById('binary_gray');
var ctx_color = canvas_color.getContext('2d');
var ctx_gray = canvas_gray.getContext('2d');
var ctx_binary = canvas_binary.getContext('2d');
//img.crossOrigin = ''; //not able to access image
img_color.onload = function() {
  ctx_color.drawImage(img_color, 0, 0);
  img_color.style.display = 'none';
};
img_gray.onload = function() {
  ctx_gray.drawImage(img_gray, 0, 0);
  img_gray.style.display = 'none';
};
img_binary.onload = function() {
  ctx_binary.drawImage(img_binary, 0, 0);
  img_binary.style.display = 'none';
};
var color = document.getElementById('color');
var gray = document.getElementById('gray');
var binary = document.getElementById('binary');

function pick_color(event) {
  var x = event.layerX;
  var y = event.layerY;
  var pixel = ctx_color.getImageData(x, y, 1, 1);
  var data = pixel.data;
  var rgba = 'rgba(' + data[0] + ', ' + data[1] +
             ', ' + data[2] + ', ' + (data[3] / 255) + ')';
  //color.style.background =  rgba;
  color.textContent = rgba;
}

function pick_gray(event) {
  var x = event.layerX;
  var y = event.layerY;
  var pixel = ctx_gray.getImageData(x, y, 1, 1);
  var data = pixel.data;
  var rgba = 'rgba(' + data[0] + ', ' + data[1] +
             ', ' + data[2] + ', ' + (data[3] / 255) + ')';
  //gray.style.background =  rgba;
  gray.textContent = rgba;
}

function pick_binary(event) {
  var x = event.layerX;
  var y = event.layerY;
  var pixel = ctx_binary.getImageData(x, y, 1, 1);
  var data = pixel.data;
  var rgba = 'rgba(' + data[0] + ', ' + data[1] +
             ', ' + data[2] + ', ' + (data[3] / 255) + ')';
  //binary.style.background =  rgba;
  binary.textContent = rgba;
}

canvas_color.addEventListener('mousemove', pick_color);
canvas_gray.addEventListener('mousemove', pick_gray);
canvas_binary.addEventListener('mousemove', pick_binary);