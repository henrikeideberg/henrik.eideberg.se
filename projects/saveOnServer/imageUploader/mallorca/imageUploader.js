//Check for various support
let fileApiSupport = false;
if (window.File && window.FileReader && 
    window.FileList && window.Blob) {
  fileApiSupport = true;
}
let formDataSupport = !!window.FormData;
let xhr2ProgressSupport = "upload" in new XMLHttpRequest;
let dragDropSupport = false;
let dropZoneDiv = document.getElementById('dropZone');
if(('draggable' in dropZoneDiv) ||
   ('ondragstart' in dropZoneDiv && 'ondrop' in dropZoneDiv)){
  dragDropSupport = true;
}
let isTouchDevice = ('ontouchstart' in document.documentElement);
//let isTouchDevice = ('ontouchstart' in window);
//let isMobileDevice = (/Mobile/i.test(navigator.userAgent));
let isMobileDevice = window.navigator.userAgent.toLowerCase().
  includes("mobi");

//Show support/lack of support to user
if (fileApiSupport) {
  let fileApiNotSupported = 
    document.getElementById('fileApiNotSupported');
  fileApiNotSupported.className = 'hidden';
}
if(formDataSupport) {
  let formDataNotSupported =
    document.getElementById('formDataNotSupported');
  formDataNotSupported.className = 'hidden';
}
if(dragDropSupport && !isTouchDevice && !isMobileDevice) {
  let dragDropNotSupported =
    document.getElementById('dragDropNotSupported');
  dragDropNotSupported.className = 'hidden';
}
if(!dragDropSupport || isTouchDevice || isMobileDevice) {
  let dragDropSupported =
    document.getElementById('dragDropSupported');
  dragDropSupported.className = 'hidden';
  dropZoneDiv.className = 'hidden'
}

function handleDragOver(evt) {
  evt.stopPropagation();
  evt.preventDefault();
  evt.dataTransfer.dropEffect = 'copy';//Show user that this is a copy
}

function previewAsImage(file) {
  console.log('previewFile with file', file);
}

function previewAsImages(files) {
  console.log('previewFiles with files', files);
  for (let i = 0; i < files.length; i++) {
    previewAsImage(files[i])
  }
}

function uploadFiles(files) {
  //Create an instance of formData and append the files to it
  let formData = new FormData();
  for (let i = 0; i < files.length; i++) {
    formData.append('files[]', files[i]);
  }

  //Prepare and send the XHR request
  let xhr = new XMLHttpRequest();
  let phpUrl = 'http://henrik.eideberg.se/projects/saveOnServer/imageUploader/mallorca/uploadMallorca.php'
  console.log(phpUrl);
  xhr.open('POST', phpUrl);
  xhr.onload = function () {
    /*The XMLHttpRequestEventTarget.onload is the function called 
     *when an XMLHttpRequest transaction completes successfully */
    if (xhr.status === 200) {
      console.log('all done: ', xhr.status);
      console.log('Response from the php script', this.responseText);
    } else {
      console.log('Something went wrong...', xhr.status);
    }
  };
  xhr.send(formData);
}

function previewAsList(files) {
  //files is a FileList of File objects. List some properties.
  var output = [];
  for (var i = 0, f; f = files[i]; i++) {
    output.push('<li><strong>', escape(f.name), '</strong> (', 
                f.type || 'n/a', ') - ', f.size, 
                ' bytes, last modified: ', f.lastModifiedDate ? 
                f.lastModifiedDate.toLocaleDateString() : 'n/a',
                '</li>');
  }
  document.getElementById('list').innerHTML = '<ul>' + output.join('') + '</ul>';
}

function handleDrop(evt) {
  console.log('handleDrop with event', evt);
  evt.stopPropagation();
  evt.preventDefault();
  let files = evt.dataTransfer.files;
  previewAsList(files);
  uploadFiles(files);
}

function handleFileSelect(evt) {
  console.log('handleFileSelection with event', evt);
  evt.stopPropagation();
  evt.preventDefault();
  let files = evt.target.files;
  previewAsList(files);
  uploadFiles(files);
}

//Perform upload if supported
if(fileApiSupport && formDataSupport) {
  console.log('File API and form data supported');
  if(isTouchDevice || isMobileDevice) {
    console.log('Do file selection on touch and mobile devices');
    document.getElementById('fileSelection').
      addEventListener('change', handleFileSelect, false);
  }
  else if(dragDropSupport) {//Do drag and drop if supported
    console.log('Do drag and drop on non touch device');
    
    /* Handle the 'ondragover' event, i.e. what to do when element(s)
     * is/are being dragged over a drop target. See
     * https://www.w3schools.com/jsref/event_ondragover.asp for more
     * information on this event */
    dropZoneDiv.addEventListener('dragover', handleDragOver, false);
    /*Another way of attaching the same event to dropZoneDiv
    dropZoneDiv.ondragover = function (evt) { 
      //this.className = 'hover';
      //return false;
      handleDragOver(evt);
    };*/
    
    /* Handle the 'ondrop' event, i.e. what to do when element(s)
     * is/are dropped in the element. See
     * https://www.w3schools.com/jsref/event_ondrop.asp for more
     * information on this event */
    dropZoneDiv.addEventListener('drop', handleDrop, false);
    /*Another way of attaching the same event to dropZoneDiv
    dropZoneDiv.ondrop = function (evt) {
      this.className = '';
      readFiles(evt);
    };*/

    //dropZoneDiv.ondragend = function () { this.className = ''; return false; };
  }
  else {//alternative upload (file selecting)
    console.log('Do file selection as last alternative');
    document.getElementById('fileSelection').
      addEventListener('change', handleFileSelect, false);
  }
}
else {
  console.log('File API and FormData is not supported');
}