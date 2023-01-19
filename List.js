import Item from "./Item.js";
import { buttonStyle } from "./Item.js";
import * as storage from "./storage.js";

class List {
  constructor(
    // Defines parameters:
    name,
    items,
    progress,
    status,
    domName,
    hideFinished,
    retracted
  ) {
    // Define properties:
    this.name = name;
    this.items = items;
    this.progress = progress;
    this.status = status;
    this.domName = domName
    this.hideFinished = hideFinished
    this.retracted = retracted
  }
  // Add methods like normal functions
  addList(){

    //ERASE WHITE SPACES
    this.name = this.name.trim()
    if (isNaN(this.name)){
      this.domName = this.name.split(' ').join('')
    } else {
      this.domName = "l" + this.name.split(' ').join('')
    }

    //ADD LIST TO DOM
    const newList = document.createElement("article")
    newList.setAttribute("class", `mainlist ${this.domName}`)
    const content = `
      <h1 class="title ${this.domName}">
        ${this.name}
        <meter class="progress ${this.domName}"></meter>
        <span class="listmenu">
          <button class="removelist ${this.domName}">x</button>
        </span>
      </h1>
      <ul class="list-${this.domName}"=></ul>
    `;
    newList.innerHTML = content

    let heights = [] 
    document.querySelectorAll('article').forEach((e) => {
      heights.push(e.clientHeight)
    })
    let articles = [...document.querySelectorAll('article')]
    console.log(articles)

    document.querySelector("main").append(newList)
    document.querySelector(".new-list").value = ""

    //SETUP NEW ITEM INPUT
    this.bottomMenu()
    
    //SETUP REMOVE LIST BUTTON
    let removeButton = document.querySelector(`.removelist.${this.domName}`)
    removeButton.addEventListener("click", () => {
      let lista = document.querySelector(`.mainlist.${this.domName}`)
      lista.remove()
      storage.removeList(this.domName)
    }, false)

    this.optionsMenu(newList)

    // RETRACTED
    if (this.retracted){
      this.retractList()
    }

    //SAVE IN ARRAY AND LOCAL STORAGE
    storage.saveList(this)
  }

  bottomMenu(){

    if (document.querySelector(`.bottom-menu.${this.domName}`) != undefined){ // if it exists already
      document.querySelector(`.bottom-menu.${this.domName}`).remove()
    }

    const bottomMenu = document.createElement('div')
    bottomMenu.classList.add('bottom-menu' ,`${this.domName}`)
    let content = `
      <div class="newitem">
        <input class="input-${this.domName}">
        <button class="additem-${this.domName}">Add as item</button>
        <button class="addsublist-${this.domName}">Add as sublist</button>
      </div>
      <br><button class="btn retractlist ${this.domName}">^</button>
    `
    bottomMenu.innerHTML = content
    document.querySelector(`.list-${this.domName}`).insertAdjacentElement('afterend', bottomMenu)

    // ADD ITEM BUTTON
    const listButton = document.querySelector(`.additem-${this.domName}`)
    listButton.addEventListener("click", () => {
      if (document.querySelector(`.input-${this.domName}`).value !== ""){
        this.createItem(this.domName, 'item', true)
      }
    })

    //ADD SUBLIST BUTTON
    const sublistButton = document.querySelector(`.addsublist-${this.domName}`)
    sublistButton.addEventListener("click", () => {
      if (document.querySelector(`.input-${this.domName}`).value !== ""){
        this.createItem(this.domName, 'sublist', true)
      }
    })

    // RETRACT BUTTON
    const retractButton = document.querySelector(`.retractlist.${this.domName}`)
    buttonStyle()
    retractButton.addEventListener("click", () => {
      this.retractList()
    })
  }

  retractList(){
    let button = document.querySelector(`.retractlist.${this.domName}`)
    if (!document.querySelector(`.mainlist.${this.domName}`).classList.contains('retracted')){
      document.querySelector(`.mainlist.${this.domName}`).classList.add('retracted')
      button.innerText = 'v'
      document.querySelector(`.list-${this.domName}`).hidden = true
      this.retracted = true
      storage.updateList(this)
    } else {
      document.querySelector(`.mainlist.${this.domName}`).classList.remove('retracted')
      button.innerText = '^'
      document.querySelector(`.list-${this.domName}`).hidden = false
      this.retracted = false
      storage.updateList(this)
    }
  }

  createItem(data, type, input) {
    // If item comes from input, 'data' must be id in case of subitem, and domName otherwise
    // If item comes from storage, 'data' must be the item object

    //CREATE ITEM
    if (input){
      const item = new Item(
        'id' + Date.now().toString(),
        document.querySelector(`.input-${data}`).value,
        data,
        type == "sublist" ? "done" : "uncomplete",
        (new Date()).toDateString(),
        0,
        0,
        this.domName,
        type == 'sublist' ? type : 'item',
        false
      )
      item.addItem(true, item.type)
    } else {
      const item = new Item(
        data.id,
        data.text,
        data.list,
        data.status,
        data.creationDate,
        data.subItems,
        data.siblings,
        data.mainList,
        data.type,
        data.retracted
      )
      item.addItem(false, data.type)
      
    }
    
  }

  optionsMenu(listElement){

    //add to DOM
    let removeButton = document.querySelector(`.removelist.${this.domName}`)
    const optionsElement = document.createElement('div')
    optionsElement.setAttribute('class', 'dropdown')
    let content = `
      <button class="dropbtn options-${this.domName}">Options</button>
      <div id="myDropdown-${this.domName}" class="dropdown-content">
        <button class="hidetasks-${this.domName} show">Hide finished tasks</button>
        <button class="hideprogress-${this.domName} show">Hide progress</button>
      </div>
    `
    optionsElement.innerHTML = content
    removeButton.insertAdjacentElement('beforebegin', optionsElement)

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

    // HIDE TASKS
    const hideButton = document.querySelector(`.hidetasks-${this.domName}`)
    hideButton.addEventListener("click", () => {
      if (this.hideFinished){
        this.hideFinished = false
      } else {
        this.hideFinished = true
      }
      storage.updateList(this)
      this.hideFinishedItems()
    })

    // HIDE PROGRESS

  }

  hideFinishedItems(){
    const hideButton = document.querySelector(`.hidetasks-${this.domName}`)
    let items = document.querySelectorAll(`.mainlist-${this.domName}.done`)
      if (this.hideFinished){
        items.forEach((e) => {
          e.hidden = true
        })
        hideButton.innerText = "Show finished tasks"
        hideButton.classList.remove("show")
      } else {
        items.forEach((e) => {
          e.hidden = false
        })
        hideButton.classList.add("show")
        hideButton.innerText = "Hide finished tasks"
      }
  }
}

export default List;