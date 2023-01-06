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
    ) {
      // Define properties:}
      this.id = id;
      this.text = text;
      this.list = list;
      this.status = status;
      this.creationDate = creationDate;
      this.subItems = subItems;
      this.siblings = siblings;
    }
    // Add methods like normal functions:
    
    addItem() {
      // ADD ITEM TO DOM
      const element = document.createElement("li")
      element.classList.add(`item-${this.id}` , `parent-${this.list}`)
      if (this.text === ""){
        this.text = document.querySelector(`.input-${this.list}`).value
      }
      if (this.status === "uncomplete"){
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
      }
      document.querySelector(`.list-${this.list}`).insertAdjacentElement("beforeend", element)

      //SETUP CHECKBOX EVENT
      let checkbox = document.querySelector(`.checkbox-${this.id}.c${this.list}`)
      checkbox.addEventListener("change", () => {
        this.checkboxEvent(this)
      })

      //DELETE AND EXTEND BUTTON
      let deleteButton = document.querySelector(`.delete-${this.id}-${this.list}`)
      let extendButton = document.querySelector(`.extend-${this.id}-${this.list}`)
      element.addEventListener("mouseover", () => {
        deleteButton.removeAttribute("hidden")
        extendButton.removeAttribute("hidden")
      })
      element.addEventListener("mouseleave", () => {
        deleteButton.setAttribute("hidden","hidden")
        extendButton.setAttribute("hidden","hidden")
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
      this.checkboxEvent(this)
    }

    addSubItem(subItem, input = true){
      if (input == true ? document.querySelector(`.input-${this.id}`).value !== "" : true){
        let list = document.createElement('ul')
        list.setAttribute("class", `list-${this.id}`)
        if (input){
          document.querySelector(`.extension-${this.id}`).insertAdjacentElement('beforebegin', list)
          let newItem = new Item(Date.now(), document.querySelector(`.input-${this.id}`).value, this.id, "uncomplete")
          newItem.addItem(newItem)
          document.querySelector(`.input-${this.id}`).value = ""
        } else {
          document.querySelector(`.item-${this.id}.parent-${this.list}`).insertAdjacentElement('beforeend', list)
          let newItem = new Item(subItem.id, subItem.text, this.id, subItem.status)
          newItem.addItem(newItem)
        }
      }
    }

    loadSubItems(){
      storage.listOfItems.forEach((i) => {
        if (this.id === i.list){
          this.addSubItem(i, false)
        }
      })
    }

    checkboxEvent(item){ // NO USA 'THIS' !!!!
      this.updateProgress.call(item)
      let checkbox = document.querySelector(`.checkbox-${item.id}.c${item.list}`)
      let element = document.querySelector(`.item-${item.id}.parent-${item.list}`)
      let parent = storage.listOfItems.find((e) => e.id == item.list)
      let clear = false
      if (checkbox.checked){
        element.setAttribute("style", "text-decoration:line-through")
        element.classList.add("done")
        item.status = "done"
        if (parent != undefined 
          && Array.from(document.querySelectorAll(`.c${item.list}`)).filter(i => i.checked).length == item.siblings 
          && parent.status == "uncomplete"){
          
          document.querySelector(`.checkbox-${parent.id}.c${parent.list}`).checked = true
          this.checkboxEvent(parent)
        }
      } else { 
        element.classList.remove("done")
        element.removeAttribute("style")
        item.status = "uncomplete"
        let checkboxes = document.querySelectorAll(`.c${item.id}`)
        let values = Array.from(checkboxes)
        if (values.filter(i => i.checked).length == item.subItems){
          clear = true
        }
        if (parent != undefined && parent.status == "done"){
          document.querySelector(`.checkbox-${parent.id}.c${parent.list}`).checked = false
          this.checkboxEvent(parent)
        }
      }
      this.updateProgress.call(item)
      if (item.subItems != 0){ // Check its subitems
        storage.listOfItems.forEach((i) => {
          if (i.list == item.id){
            let box = document.querySelector(`.checkbox-${i.id}.c${i.list}`)
            if (!clear){
              if (item.status == "done"){ /// ACA
                box.checked = true
                this.checkboxEvent(i)
              }
            } else {
              box.checked = false
              this.checkboxEvent(i)
            }
          }
        })
      }
      storage.updateItem(item)
    }

    updateProgress(){
      storage.listOfItems.forEach((i) => {
        if (i.list == this.list){
          i.subItems = Array.from(document.querySelectorAll(`.parent-${this.id}`)).length
          i.siblings = Array.from(document.querySelectorAll(`.parent-${this.list}`)).length
          storage.updateItem(i)
        }
      })
      
      let progress = storage.listOfLists.find((e) => e.domName == this.list)
      if (progress != undefined){
        let total = 0, cant = 0
        storage.listOfItems.forEach((element) => {
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
  