import Item from "./Item.js";
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
  ) {
    // Define properties:
    this.name = name;
    this.items = items;
    this.progress = progress;
    this.status = status;
    this.domName = domName
    this.hideFinished = hideFinished
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
    newList.setAttribute("class", `article-${this.domName}`)
    const content = `
      <h1 class="title-${this.domName}">
        ${this.name}
        <meter class="progress-${this.domName}"></meter>
        <button class="remove-${this.domName}">x</button>
      </h1>
      <ul class="list-${this.domName}"=></ul>
    `;
    newList.innerHTML = content
    document.querySelector("main").append(newList)
    document.querySelector(".new-list").value = ""

    //SETUP NEW ITEM INPUT
    this.newItemInput()
    
    //SETUP REMOVE LIST BUTTON
    let removeButton = document.querySelector(`.remove-${this.domName}`)
    removeButton.addEventListener("click", () => {
      let lista = document.querySelector(`.article-${this.domName}`)
      lista.remove()
      storage.removeList(this.domName)
    }, false)

    this.optionsMenu(newList)

    //SAVE IN ARRAY AND LOCAL STORAGE
    storage.saveList(this)
  }

  newItemInput(){

    if (document.querySelector(`.newitem-${this.domName}`) != undefined){ // if it exists already
      document.querySelector(`.newitem-${this.domName}`).remove()
    }

    const newItemInput = document.createElement('li')
    newItemInput.classList.add(`newitem-${this.domName}`)
    let content = `
      <input class="input-${this.domName}">
      <button class="additem-${this.domName}">Add as item</button>
      <button class="addsublist-${this.domName}">Add as sublist</button>
    `
    newItemInput.innerHTML = content
    document.querySelector(`.list-${this.domName}`).insertAdjacentElement('beforeend', newItemInput)


    const listButton = document.querySelector(`.additem-${this.domName}`)
    listButton.addEventListener("click", () => {
      if (document.querySelector(`.input-${this.domName}`).value !== ""){
        //ADD NEW ITEM
        this.createItem()
      }
    })

    const sublistButton = document.querySelector(`.addsublist-${this.domName}`)
    sublistButton.addEventListener("click", () => {
      if (document.querySelector(`.input-${this.domName}`).value !== ""){
        //ADD NEW SUBLIST
        
        this.createItem(undefined, 'sublist')
      }
    })
  }

  createItem(e, type) {
    //CREATE ITEM
    if (e == undefined){
      const item = new Item(
        Date.now(),
        document.querySelector(`.input-${this.domName}`).value,
        this.domName,
        "uncomplete",
        (new Date()).toDateString(),
        0,
        0,
        this.domName,
        type == 'sublist' ? type : 'item'
      )
      item.addItem(true, item.type)
    } else {
      const item = new Item(
        e.id,
        e.text,
        e.list,
        e.status,
        e.creationDate,
        e.subItems,
        e.siblings,
        e.mainList,
        e.type
      )
      item.addItem(false, e.type)
      
    }
    
  }

  optionsMenu(listElement){

    //add to DOM
    let meter = document.querySelector(`.progress-${this.domName}`)
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
    meter.insertAdjacentElement('afterend', optionsElement)

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

    // ADD SUBLIST
    const sublistOption = document.querySelector(`.addsublist-${this.domName}`)
    sublistOption.addEventListener("click", () => {
      sublistOption.classList.add("open")

      let sublistInput = document.createElement('li')
      sublistInput.classList.add(`newsublist-${this.domName}`)
      let content = `
        <input class="newsublist-input-${this.domName}">
        <button class="newsublist-button-${this.domName}">
        Add sublist
        </button>
      `
      sublistInput.innerHTML = content
      document.querySelector(`.list-${this.domName}`).insertAdjacentElement('beforeend', sublistInput)


    })


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
