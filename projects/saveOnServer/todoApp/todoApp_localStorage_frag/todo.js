function Todo(id, task, who, dueDate) {
  this.id = id;  
  this.task = task;
  this.who = who;
  this.dueDate = dueDate;
  this.done = false;
}

var todos = new Array();

window.onload = init;

function init() {
  var submitButton = document.getElementById("submit");
  submitButton.onclick = getFormData;
  getTodoItems();
}

function getTodoItems() {
  if (localStorage) {
    for (var i = 0; i < localStorage.length; i++) {
      var key = localStorage.key(i);
      if (key.substring(0, 4) == "todo") {
        var item = localStorage.getItem(key);
        var todoItem = JSON.parse(item);
        todos.push(todoItem);
      }
    }
    addTodosToPage();
  }
  else {
    console.log("Error: you don't have localStorage!");
  }
}

function addTodosToPage() {
  var ul = document.getElementById("todoList");
  var listFragment = document.createDocumentFragment();
  for (var i = 0; i < todos.length; i++) {
    var todoItem = todos[i];
    var li = createNewTodo(todoItem);
    listFragment.appendChild(li);
  }
  ul.appendChild(listFragment);
}

function getFormData() {
  var task = document.getElementById("task").value;
  if (checkInputText(task, "Please enter a task")) return;

  var who = document.getElementById("who").value;
  if (checkInputText(who, "Please enter a person to do the task")) return;

  var date = document.getElementById("dueDate").value;
  if (checkInputText(date, "Please enter a due date")) return;

  var id = (new Date()).getTime();
  var todoItem = new Todo(id, task, who, date);
  todos.push(todoItem);
  addTodoToPage(todoItem);
  saveTodoItem(todoItem);
}

function checkInputText(value, msg) {
  if (value == null || value == "") {
      alert(msg);
      return true;
  }
  return false;
}

function saveTodoItem(todoItem) {
  if (localStorage) {
    var key = "todo" + todoItem.id;
    var item = JSON.stringify(todoItem);
    localStorage.setItem(key, item);
  }
  else {
    console.log("Error: you don't have localStorage!");
  }
}

function addTodoToPage(todoItem) {
  var ul = document.getElementById("todoList");
  var li = createNewTodo(todoItem);
  ul.appendChild(li);
  document.forms[0].reset();
}

function createNewTodo(todoItem) {
  var li = document.createElement("li");
  li.setAttribute("id", todoItem.id);
  var spanTodo = document.createElement("span");
  spanTodo.innerHTML =
      todoItem.who + " needs to " + todoItem.task + " by " + todoItem.dueDate;

  var spanDone = document.createElement("span");
  if (!todoItem.done) {
    spanDone.setAttribute("class", "notDone");
    spanDone.innerHTML = "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
  }
  else {
    spanDone.setAttribute("class", "done");
    spanDone.innerHTML = "&nbsp;&#10004;&nbsp;";
  }

  var spanDelete = document.createElement("span");
  spanDelete.setAttribute("class", "delete");
  spanDelete.innerHTML = "&nbsp;&#10007;&nbsp;";
  spanDelete.onclick = deleteItem;

  li.appendChild(spanDone);
  li.appendChild(spanTodo);
  li.appendChild(spanDelete);
  return li;
}

function deleteItem(e) {
  var span = e.target;
  var id = span.parentElement.id;
  console.log("delete an item: " + id);

  // find and remove the item in localStorage
  var key = "todo" + id;
  localStorage.removeItem(key);

  // find and remove the item in the array
  for (var i = 0; i < todos.length; i++) {
    if (todos[i].id == id) {
      todos.splice(i, 1);
      break;
    }
  }

  // find and remove the item in the page
  var li = e.target.parentElement;
  var ul = document.getElementById("todoList");
  ul.removeChild(li);
}

function updateDone() {
  //This can be similar to deletItem
  //similar clickhandler
  //id handling etc.
}