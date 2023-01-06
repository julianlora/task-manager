import Item from "./Item.js";
import * as storage from "./storage.js";

class List {
  constructor(
    // Defines parameters:
    name,
    items,
    progress,
    status,
    domName
  ) {
    // Define properties:
    this.name = name;
    this.items = items;
    this.progress = progress;
    this.status = status;
    this.domName = domName
  }
  // Add methods like normal functions
  addList(){

    //ERASE WHITE SPACES
    this.name = this.name.trim()
    if (isNaN(this.name)){
      this.domName = this.name.split(' ').join('')
    } else {
      this.domName = "i" + this.name.split(' ').join('')
    }

    //ADD LIST TO DOM
    const newList = document.createElement("article")
    newList.setAttribute("class", `article-${this.domName}`)
    const content = `
      <h1 class="title-${this.domName}">
        ${this.name}
        <meter class="progress-${this.domName}"></meter>
        <div class="dropdown">
          <button class="dropbtn options-${this.domName}">Options</button>
          <div id="myDropdown-${this.domName}" class="dropdown-content">
            <button class="show-done-${this.domName}">Hide tasks done</button>
            <a href="#about">About</a>
            <a href="#contact">Contact</a>
          </div>
        </div>
        <button class="remove-${this.domName}">x</button>
      </h1>
      <ul class="list-${this.domName}"=></ul>
      <label>
        New item
        <input class="input-${this.domName}">
        <button class="add-${this.domName}">add</button>
      </label>
    `;
    newList.innerHTML = content
    document.querySelector("main").append(newList)
    document.querySelector(".new-list").value = ""

    //SETUP OPTIONS MENU
    /* When the user clicks on the button, 
    toggle between hiding and showing the dropdown content */
    let dropbtn = document.querySelector(`.options-${this.domName}`)
    dropbtn.addEventListener("click", () => {
      document.getElementById(`myDropdown-${this.domName}`).classList.toggle("show");
    })

    // Close the dropdown if the user clicks outside of it
    window.onclick = (event) => {
      if (!event.target.matches('.dropbtn')) {
        var dropdowns = document.getElementsByClassName("dropdown-content");
        var i;
        for (i = 0; i < dropdowns.length; i++) {
          var openDropdown = dropdowns[i];
          if (openDropdown.classList.contains('show')) {
            openDropdown.classList.remove('show');
          }
        }
      }
    }

    //SETUP ITEM 'ADD' BUTTON
    const listButton = document.querySelector(`.add-${this.domName}`)
    listButton.addEventListener("click", () => {
      if (document.querySelector(`.input-${this.domName}`).value !== ""){
        //ADD NEW ITEM
        this.createItem(this.domName)
        document.querySelector(`.input-${this.domName}`).value = ""
      }
    }, false)
    
    //SETUP REMOVE LIST BUTTON
    let removeButton = document.querySelector(`.remove-${this.domName}`)
    removeButton.addEventListener("click", () => {
      let lista = document.querySelector(`.article-${this.domName}`)
      lista.remove()
      storage.removeList(this.domName)
    }, false)

    //SAVE IN ARRAY AND LOCAL STORAGE
    storage.saveList(this)
  }

  createItem(listName, itemText = "", itemId = "", itemStatus = "uncomplete") {
    //CREATE ITEM
    const item = new Item(
      itemId == "" ? Date.now() : itemId,
      itemText == "" ? document.querySelector(`.input-${this.domName}`).value : itemText,
      listName != this.domName ? listName : this.domName,
      itemStatus,
      (new Date()).toDateString()      
    )
    item.addItem()
  }
}

export default List;