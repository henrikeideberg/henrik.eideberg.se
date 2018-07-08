function Todo(task, who, dueDate) {
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
  getTodoData();
}

function getTodoData() {
    var request = new XMLHttpRequest();
    request.open("GET", "todo.json");
    request.onreadystatechange = function() {
        if (this.readyState == this.DONE && this.status == 200) {
            if (this.responseText) { 
              parseTodoItems(this.responseText);
              addTodosToPage();
            }
            else {
                console.log("Error: Data is empty");
            }
        }
    };
    request.send();
}

function parseTodoItems(todoJSON) {
    if (todoJSON == null || todoJSON.trim() == "") {
        return;
    }
    var todoArray = JSON.parse(todoJSON);
    if (todoArray.length == 0) {
        console.log("Error: the to-do list array is empty!");
        return;
    }
    for (var i = 0; i < todoArray.length; i++) {
        var todoItem = todoArray[i];
        todos.push(todoItem);
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

  console.log("New task: " + task + ", for: " + who + ", by: " + date);
  var todoItem = new Todo(task, who, date);
  todos.push(todoItem);
  addTodoToPage(todoItem);
  saveTodoData();
}

function checkInputText(value, msg) {
  if (value == null || value == "") {
      alert(msg);
      return true;
  }
  return false;
}

function addTodoToPage(todoItem) {
  var ul = document.getElementById("todoList");
  var li = createNewTodo(todoItem);
  ul.appendChild(li);
  document.forms[0].reset();
}

function createNewTodo(todoItem) {
  var li = document.createElement("li");
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

  li.appendChild(spanDone);
  li.appendChild(spanTodo);
  return li;
}

function saveTodoData() {
  var todoJSON = JSON.stringify(todos);
  var request = new XMLHttpRequest();
  var URL = "save.php?data=" + encodeURI(todoJSON);
  request.open("GET", URL);
  request.setRequestHeader("Content-Type",
                           "text/plain;charset=UTF-8");
  request.send();
}