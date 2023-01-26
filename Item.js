import * as storage from "./storage.js";
import { itemSetup, listSetup } from "./setup.js";

class Item {
    constructor(
      // Defines parameters:
      id,
      text,
      list,
      status,
      creationDate,
      subItems,
      siblings,
      mainList,
      type,
      retracted,
      index
    ) {
      // Define properties:}
      this.id = id;
      this.text = text;
      this.list = list;
      this.status = status;
      this.creationDate = creationDate;
      this.subItems = subItems;
      this.siblings = siblings;
      this.mainList = mainList;
      this.type = type;
      this.retracted = retracted;
      this.index = index
    }
    // Add methods like normal functions:
    
    addItem(input = false, type = 'item') {

      // ADD ITEM TO DOM
      const element = this.createAndInsertDomElement(this)

      //SAVE ITEM IN LOCAL STORAGE
      this.loadSubItems()
      
      storage.saveItem(this) // antes estaba antes de loadsubitems
      this.updateProgress(input)
      if (input && this.type == 'item'){
        this.checkboxEvent(false)
      }

      if (this.retracted){
        this.retractItem(true)
      }


      itemSetup(element)

    }

    createAndInsertDomElement(item){
      let element = document.createElement("li")
      element.classList.add('item' , `parent-${item.list}`, `mainlist-${item.mainList}`)

      element.setAttribute('id', item.id)
      // element.setAttribute('draggable', true)
      element.setAttribute('data-index', item.index)

      if (item.text == ""){
        item.text = document.querySelector(`.input-${item.list}`).value
      }

      let content = `
        <div class="root r${item.id}">
          <div class="btn drag ${item.id}" hidden draggable="true">=</div>
          <span class="text t${item.id}">${item.text}</span>
          <span class="item-menu">
            <button class="btn retract ${item.id}" hidden>-</button>
            <button class="btn extend e${item.id}" hidden>+</button>
            <button class="btn delete d${item.id}" hidden>x</button>
          </span>
        </div>
      `
      element.innerHTML = content

      // SELECT PLACE TO INSERT ELEMENT BASED ON INDEX
      let domLocation
      let insertPlace
      if (document.querySelectorAll(`.parent-${item.list}`).length == 0){ // if it is the firs item to add to the list
        domLocation = document.querySelector(`.list-${item.list}`)
        insertPlace = 'beforeend'
      } else { // look for the closest
        let minDif = -1
        let closestIndex
        let closestElement
        document.querySelectorAll(`.parent-${item.list}`).forEach((e) => {
          if(Math.abs(+e.getAttribute('data-index') - item.index) < minDif || minDif < 0){
            minDif = Math.abs(+e.getAttribute('data-index') - item.index)
            closestIndex = +e.getAttribute('data-index')
            closestElement = e
          }
        })
        if (closestIndex < item.index){ //if the closest is behind
          insertPlace = 'afterend'
        } else { // if the closest is next
          insertPlace = 'beforebegin'
        }
        domLocation = closestElement  
      }

      // INSERT ELEMENT TO DOM
      if (item.type == 'item'){ // ITEM
        let checkbox = document.createElement('input')
        checkbox.setAttribute('type', 'checkbox')
        checkbox.classList.add(`checkbox-${item.id}`, `c${item.list}`)
        if (item.status == "done"){
          checkbox.checked = true
          element.classList.add('done') 
        }
        element.innerHTML = content
        domLocation.insertAdjacentElement(insertPlace, element)
        document.querySelector(`.drag.${item.id}`).insertAdjacentElement('afterend', checkbox)
        // activate checkbox dependencies
        item.createCheckbox()

      } else { // SUBLIST
        element.innerHTML = content
        domLocation.insertAdjacentElement(insertPlace, element)
        document.querySelector(`.root.r${item.id}`).classList.add('sublist')
        document.querySelector(`.text.t${item.id}`).classList.add('sublist')
        element.classList.add('sublist')
        if (item.status == "done"){
          element.classList.add('done') 
        }
        let list = document.createElement('ul')
        list.setAttribute("class", `list-${this.id}`)
        document.querySelector(`#${this.id}`).insertAdjacentElement('beforeend', list)
        let emptyRow = document.createElement('li')
        emptyRow.classList.add('emptyrow', `${this.id}`)
        emptyRow.innerText = 'ssss'
        list.insertAdjacentElement('beforeend', emptyRow)
        listSetup(list)
      }

      //BUTTONS
      return element
    }

    createCheckbox(){
      let checkbox = document.querySelector(`.checkbox-${this.id}.c${this.list}`)
      checkbox.addEventListener("change", () => {
        this.checkboxEvent(checkbox.checked)
        this.updateProgress()
        storage.listOfLists().find((l) => l.domName == this.mainList).hideFinishedItems()
      })
    }

    checkboxEvent(checked){
      this.updateProgress() // update subitems and siblings

      let checkbox = document.querySelector(`.checkbox-${this.id}.c${this.list}`)
      let element = document.querySelector(`#${this.id}`)
      let parent = storage.listOfItems().find((e) => e.id == this.list)

      if (checked){ 
        if(this.type == 'item'){
          checkbox.checked = true
        }
        element.classList.add("done")
        this.status = 'done'
        storage.updateItem(this)
        if (this.subItems != 0){
          storage.listOfItems().forEach((i) => {
            if (i.list == this.id && i.status == 'uncomplete'){
              i.checkboxEvent(checked)
            }
          })
        }
        if (parent != undefined
        && parent.subItems == Array.from(document.querySelectorAll(`.parent-${this.list}`)).filter(i => i.classList.contains('done')).length
        && parent.status == 'uncomplete'){
          parent.checkboxEvent(checked)
        }
      } else {
        if(this.type == 'item'){
          checkbox.checked = false
        }
        element.classList.remove("done")
        this.status = 'uncomplete'
        storage.updateItem(this)
        if (this.subItems != 0 && this.subItems == Array.from(document.querySelectorAll(`.parent-${this.id}`)).filter(i => i.classList.contains('done')).length){ // only if all subitems are done
          storage.listOfItems().forEach((i) => {
            if (i.list == this.id && i.status == 'done'){ 
              i.checkboxEvent(checked)
            }
          })
        }
        if (parent != undefined
          && parent.status == 'done'){
            parent.checkboxEvent(checked)
          }
      }
      // storage.updateItem(this)
      this.updateProgress()
    }

    retractItem(retract, save = true){
      let root = document.querySelector(`.root.r${this.id}`)
      let button = document.querySelector(`.retract.${this.id}`)
      if (retract){
        root.classList.add('retracted')
        button.innerText = 'v'
        document.querySelector(`.list-${this.id}`).hidden = true
        if(save){
          this.retracted = true
          this.updateProgress(this)
        }
      } else {
        root.classList.remove('retracted')
        button.innerText = '-'
        document.querySelector(`.list-${this.id}`).hidden = false
        if(save){
          this.retracted = false
          this.updateProgress(this)
        }
      }
    }

    loadSubItems(){
      storage.listOfItems().forEach((i) => {
        if (this.id === i.list){
          i.mainList = this.mainList // this is to update the item and its subitems if it has been moved to other list
          this.addSubItem(i, false)
        }
      })
    }

    addSubItem(subItem, input = true){
      if (input == true ? document.querySelector(`.input-${this.id}`).value !== "" : true){
        
        this.subItems = Array.from(document.querySelectorAll(`.parent-${this.id}`)).length // to know the updated subitems amount (upgradeProgress was causing trouble)
        let creator = storage.listOfLists().find((l) => l.domName == this.mainList)

        if (this.subItems == 0 && this.type != 'sublist'){ // add a new <ul> only if its the first subitem to add
          let list = document.createElement('ul')
          list.setAttribute("class", `list-${this.id}`)
          if (input){
            document.querySelector(`.extension.e${this.id}`).insertAdjacentElement('beforebegin', list)
          } else {
            document.querySelector(`#${this.id}`).insertAdjacentElement('beforeend', list)
          }
          listSetup(list)
        }

        if (input){
          creator.createItem(this.id, 'item', true)
          document.querySelector(`.input-${this.id}`).value = ""
        } else {
          creator.createItem(subItem, subItem.type, false)
        }
      }
    }

    updateProgress(input = false){

      // UPDATE ITEM DATA
      if (storage.updateItem(this) == 0 || input){ // if it changed
        this.subItems = Array.from(document.querySelectorAll(`.parent-${this.id}`)).length
        this.siblings = Array.from(document.querySelectorAll(`.parent-${this.list}`)).length
        
        // UPDATE RELATED ITEMS DATA
        storage.listOfItems().forEach((i) => {
          if (i.mainList == this.mainList){

            i.siblings = Array.from(document.querySelectorAll(`.parent-${i.list}`)).length
            i.subItems = Array.from(document.querySelectorAll(`.parent-${i.id}`)).length
          }
          storage.updateItem(i)
        })
      }

      if (this.type == 'sublist' && this.subItems == 0){
        this.status = 'done'
        document.querySelector(`#${this.id}`).classList.add('done')
        storage.updateItem(this)
      }
      
      // UPDATE ITEM VISIBILITY
      storage.listOfLists().find((l) => l.domName == this.mainList).hideFinishedItems()
      
      //UPDATE PROGRESS BAR
      let progress = storage.listOfLists().find((e) => e.domName == this.list)
      if (progress != undefined){
        let total = 0, cant = 0
        storage.listOfItems().forEach((element) => {
          if (element.list == this.list){
            total++
            if (element.status == "done"){
              cant++
            }
          }
        })
        progress.items = total
        let bar = document.querySelector(`.progress.${this.list}`)
        bar.setAttribute("value", cant.toString())
        bar.setAttribute("min", "0")
        bar.setAttribute("max", progress.items.toString())
        bar.innerText= `(${cant}/${progress.items})`
      }

      // UPDATE NEW ITEM BUTTON POSITION
      storage.listOfLists().find((l) => l.domName == this.mainList).bottomMenu()
    }

    itemAge() {
        let now = new Date();
        let created = new Date(this.creationDate);
        let elapsed = now - created;
        let daysSinceCreated = Math.floor(elapsed / (1000 * 3600 * 24));
        return daysSinceCreated;
    }
  }

export default Item;