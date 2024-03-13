const sidebar = document.querySelector(".sidebar");
const sidebarClose = document.querySelector("#sidebar-close");
const menu = document.querySelector(".menu-content");
const workOrders = document.querySelectorAll(".item");
var notificationBtn = document.getElementById("notificationButton");
var userButton = document.getElementById("userButton");

sidebarClose.addEventListener("click", () => sidebar.classList.toggle("close"));

//Code for making work orders clickable
workOrders.forEach((item, index) => {
  item.addEventListener("click", (e) => {
    e.preventDefault();
    alert("Task " + (index + 1) + " selected");
    item.classList.add("background: rgb(128, 128, 128)");
  });
});

/*TODO
  Add Notification button code here. 
  Demo code is added
*/
notificationBtn.addEventListener("click", (e) => {
  e.preventDefault();
  alert("Notification button clicked!!!!");
});
