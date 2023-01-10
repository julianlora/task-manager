import * as storage from "./storage.js";

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
      mainList
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
    }
    // Add methods like normal functions:
    
    addItem(input = false) {
      // ADD ITEM TO DOM
      const element = document.createElement("li")
      element.classList.add(`item-${this.id}` , `parent-${this.list}`, `mainlist-${this.mainList}`)
      
      if (this.text === ""){
        this.text = document.querySelector(`.input-${this.list}`).value
      }
      if (this.status == "uncomplete"){
        let content = `
          <input class="checkbox-${this.id} c${this.list}" type="checkbox">
          ${this.text}
          <button class="extend-${this.id}-${this.list}" hidden>v</button>
          <button class="delete-${this.id}-${this.list}" hidden>x</button>
        `
        element.innerHTML = content
      } else {
        let content = `
          <input class="checkbox-${this.id} c${this.list}" type="checkbox" checked>
          ${this.text}
          <button class="extend-${this.id}-${this.list}" hidden>v</button>
          <button class="delete-${this.id}-${this.list}" hidden>x</button>
        `
        element.innerHTML = content
        element.setAttribute("style", "text-decoration:line-through")
        element.classList.add('done')
      }
      document.querySelector(`.list-${this.list}`).insertAdjacentElement("beforeend", element)

      //SETUP CHECKBOX EVENT
      let checkbox = document.querySelector(`.checkbox-${this.id}.c${this.list}`)
      checkbox.addEventListener("change", () => {
        this.checkboxEvent(checkbox.checked)
        this.updateProgress()
        storage.listOfLists().find((l) => l.domName == this.mainList).hideFinishedItems()
      })

      //DELETE AND EXTEND BUTTON
      const deleteButton = document.querySelector(`.delete-${this.id}-${this.list}`)
      const extendButton = document.querySelector(`.extend-${this.id}-${this.list}`)
      element.addEventListener("mouseover", () => {
        deleteButton.hidden = false
        extendButton.hidden = false
      })
      element.addEventListener("mouseleave", () => {
        deleteButton.hidden = true
        extendButton.hidden = true
      })
      deleteButton.addEventListener("click", () => {
        element.remove()
        storage.removeItem(this.id)
        this.updateProgress()
      })
      extendButton.addEventListener("click", () => {
        if (!extendButton.classList.contains("opened")){
          extendButton.classList.add("opened")
          extendButton.innerText = "^"
          let extension = document.createElement('label')
          extension.setAttribute("class", `extension-${this.id}`)
          let content = `
            <br>
            New item
            <input class="input-${this.id}">
            <button class="add-${this.id}">add</button>
          `;
          extension.innerHTML = content
          element.insertAdjacentElement("beforeend", extension)

          let addButton = document.querySelector(`.add-${this.id}`)
          addButton.addEventListener("click", () => {
            this.addSubItem(this)
          })

        } else {
          document.querySelector(`.extension-${this.id}`).remove()
          extendButton.innerText = "v"
          extendButton.classList.remove("opened")
        }
      })

      //SAVE ITEM IN LOCAL STORAGE
      storage.saveItem(this)
      this.loadSubItems()
      this.updateProgress()
      if (input){
        this.checkboxEvent(false)
      }
    }

    addSubItem(subItem, input = true){
      if (input == true ? document.querySelector(`.input-${this.id}`).value !== "" : true){
        let list = document.createElement('ul')
        list.setAttribute("class", `list-${this.id}`)
        if (input){
          document.querySelector(`.extension-${this.id}`).insertAdjacentElement('beforebegin', list)
          let newItem = new Item(
            Date.now(), 
            document.querySelector(`.input-${this.id}`).value, 
            this.id, 
            "uncomplete",
            (new Date()).toDateString(),
            0,
            0, 
            this.mainList)
          newItem.addItem(input = true)
          document.querySelector(`.input-${this.id}`).value = ""
        } else {
          document.querySelector(`.item-${this.id}.parent-${this.list}`).insertAdjacentElement('beforeend', list)
          let newItem = new Item(
            subItem.id, 
            subItem.text,
            this.id, 
            subItem.status,
            subItem.creationDate,
            subItem.subItems, 
            subItem.siblings, 
            this.mainList)
          newItem.addItem()
        }
        
      }
    }

    loadSubItems(){
      storage.listOfItems().forEach((i) => {
        if (this.id === i.list){
          this.addSubItem(i, false)
        }
      })
    }

    checkboxEvent(checked){
      this.subItems = Array.from(document.querySelectorAll(`.parent-${this.id}`)).length
      this.siblings = Array.from(document.querySelectorAll(`.parent-${this.list}`)).length

      let checkbox = document.querySelector(`.checkbox-${this.id}.c${this.list}`)
      let element = document.querySelector(`.item-${this.id}.parent-${this.list}`)
      let parent = storage.listOfItems().find((e) => e.id == this.list)
      if (checked){ 
        checkbox.checked = true
        element.setAttribute("style", "text-decoration:line-through")
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
        && parent.subItems == Array.from(document.querySelectorAll(`.c${this.list}`)).filter(i => i.checked).length
        && parent.status == 'uncomplete'){
          parent.checkboxEvent(checked)
        }
      } else {
        checkbox.checked = false
        element.removeAttribute("style")
        element.classList.remove("done")
        this.status = 'uncomplete'
        storage.updateItem(this)
        if (this.subItems != 0 && this.subItems == Array.from(document.querySelectorAll(`.c${this.id}`)).filter(i => i.checked).length){ // only if all subitems are done
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
      storage.updateItem(this)
    }

    updateProgress(){

      storage.listOfItems().forEach((i) => {
        if (i.mainList == this.mainList){

          i.siblings = Array.from(document.querySelectorAll(`.parent-${i.list}`)).length
          i.subItems = Array.from(document.querySelectorAll(`.parent-${i.id}`)).length
        }
        storage.updateItem(i)
      })
      
      
      let progress = storage.listOfLists().find((e) => e.domName == this.list)
      if (progress != undefined){
        let total = 0, cant = 0
        storage.listOfItems().forEach((element) => {
          if (element.list === this.list){
            total++
            if (element.status === "done"){
              cant++
            }
          }
        })
        progress.items = total
        let bar = document.querySelector(`.progress-${this.list}`)
        bar.setAttribute("value", cant.toString())
        bar.setAttribute("min", "0")
        bar.setAttribute("max", progress.items.toString())
        bar.innerText= `(${cant}/${progress.items})`
      }
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
