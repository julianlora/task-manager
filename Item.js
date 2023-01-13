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
      mainList,
      type
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
    }
    // Add methods like normal functions:
    
    addItem(input = false, type = 'item') {
      // ADD ITEM TO DOM
      const element = document.createElement("li")
      element.classList.add(`item-${this.id}` , `parent-${this.list}`, `mainlist-${this.mainList}`)
      element.setAttribute('id', this.id)

      if (this.text == ""){
        this.text = document.querySelector(`.input-${this.list}`).value
      }
      if (this.type == 'item'){
        if (this.status == "uncomplete"){
          let content = `
            <div class="root r${this.id}">
              <input class="checkbox-${this.id} c${this.list}" type="checkbox">
              <span class="text t${this.id}">${this.text}</span>
              <button class="extend e${this.id}" hidden>v</button>
              <button class="delete d${this.id}" hidden>x</button>
            </div>
          `
          element.innerHTML = content
        } else {
          let content = `
            <div class="root r${this.id}">
              <input class="checkbox-${this.id} c${this.list}" type="checkbox" checked>
              <span class="text t${this.id}">${this.text}</span>
              <button class="extend e${this.id}" hidden>v</button>
              <button class="delete d${this.id}" hidden>x</button>
            </div>
          `
          element.innerHTML = content
          element.setAttribute("style", "text-decoration:line-through")
          element.classList.add('done')
        }
        document.querySelector(`.list-${this.list}`).insertAdjacentElement("beforeend", element)
        //SETUP CHECKBOX EVENT
        this.createCheckbox()
      } else {
        let content = `
          <div class="root r${this.id}">
            <b><span class="text t${this.id}">${this.text}</span></b>
            <button class="extend e${this.id}" hidden>v</button>
            <button class="delete d${this.id}" hidden>x</button>
          </div>
        `
        element.innerHTML = content
        element.classList.add('sublist')
        document.querySelector(`.list-${this.list}`).insertAdjacentElement("beforeend", element)
      }

      //DELETE AND EXTEND BUTTON
      this.createItemButtons(element)

      //SAVE ITEM IN LOCAL STORAGE
      storage.saveItem(this)
      this.loadSubItems()
      this.updateProgress(input)
      if (input && this.type == 'item'){
        this.checkboxEvent(false)
      }
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
          if (parent.type == 'item'){
            parent.checkboxEvent(checked)
          } else {
            let parentElement = document.querySelector(`.item-${parent.id}.parent-${parent.list}`)
            parentElement.classList.add("done")
            parent.status = 'done'
            storage.updateItem(parent)
            parent.updateProgress() 
          }
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
            if (parent.type == 'item'){
              parent.checkboxEvent(checked)
            } else {
              let parentElement = document.querySelector(`.item-${parent.id}.parent-${parent.list}`)
              parentElement.classList.remove('done')
              parent.status = 'uncomplete'
              storage.updateItem(parent)
              parent.updateProgress()
            }
          }
      }
      storage.updateItem(this)
    }

    createItemButtons(element){

      //EDIT
      let textElement = document.querySelector(`.text.t${this.id}`)
      textElement.addEventListener("click", (event) => {

        if (!element.classList.contains('editing') && window.getSelection().isCollapsed){
          const rootElement = document.querySelector(`.root.r${this.id}`)
          element.classList.add('editing', 'open')
          rootElement.hidden = true
          let edit = document.createElement('li')
          edit.classList.add('edit', `e${this.id}`)
          let content = `
            <input class="inputedit i${this.id}" value="${this.text}">
            <button class="saveedit s${this.id}">Save</button>
            <button class="canceledit c${this.id}">Cancel</button>
          `
          edit.innerHTML = content
          rootElement.insertAdjacentElement('afterend', edit)

          // save
          document.querySelector(`.saveedit.s${this.id}`).addEventListener("click",() => {
            saveEdit(element)
          })

          //cancel
          document.querySelector(`.canceledit.c${this.id}`).addEventListener("click", () => {
            cancelEdit(element)
          })

          //open another edit
          if (Array.from(document.querySelectorAll('.editing')).length > 1){
            Array.from(document.querySelectorAll('.editing')).forEach((e) => {
              if (e != element){
                saveEdit(e)
              }
            })
          }

          // open another input
          if (Array.from(document.querySelectorAll('.extension')).length > 0){
            let openElement = document.querySelector('.extension')
            closeInput(openElement.classList[1])
          }

          // click outside
          window.onclick = (event) => {
            if (!event.target.matches(`.inputedit`) && !event.target.matches(`.saveedit`) && !event.target.matches(`.canceledit`) && Array.from(document.querySelectorAll(`.editing`)).length > 0){
              saveEdit(element)
            }
          }
        }
        event.stopPropagation()
      })

      const deleteButton = document.querySelector(`.delete.d${this.id}`)
      const extendButton = document.querySelector(`.extend.e${this.id}`)
      // BUTTON VISIBILITY
      element.addEventListener("mouseover", () => {
        if (!element.classList.contains('editing')){
          deleteButton.hidden = false
          extendButton.hidden = false
        }
      })
      element.addEventListener("mouseleave", () => {
        deleteButton.hidden = true
        extendButton.hidden = true
      })
      // DELETE
      deleteButton.addEventListener("click", () => {
        element.remove()
        storage.removeItem(this.id)
        this.updateProgress()
        if (this.siblings == 1 && this.list != this.mainList) { // if it's the only subitem and its parent it's not the mainList remove unnecesary <ul> element
          document.querySelector(`.list-${this.list}`).remove()
        }
      })
      // INPUT SUBITEM
      extendButton.addEventListener("click", () => {
        if (!extendButton.classList.contains("open")){
          
          extendButton.classList.add("open")
          extendButton.innerText = "^"
          let extension = document.createElement('ul')
          extension.setAttribute("class", `extension e${this.id}`)
          let content = `
            <li>
              <input class="input-${this.id}">
              <button class="add-${this.id}">Add subitem</button>
            </li>
          `;
          extension.innerHTML = content
          element.insertAdjacentElement("beforeend", extension)

          let addButton = document.querySelector(`.add-${this.id}`)
          addButton.addEventListener("click", () => {
            this.addSubItem(this)
          })
          // CLOSE INPUT
          window.onclick = (event) => {
            if (Array.from(document.querySelectorAll(`.extension`)).length > 1){
              Array.from(document.querySelectorAll(`.extension`)).forEach((e) => {
                if (e.classList != extension.classList){
                  closeInput(e.classList[1])
                }
              })
            }
            if ((!event.target.matches(`.extension.e${this.id}`)
            && !event.target.matches(`.extend.e${this.id}`) 
            && extendButton.classList.contains('open')
            && !event.target.matches(`.input-${this.id}`)
            && !event.target.matches(`.add-${this.id}`))) {
              closeInput(`e${this.id}`)
            }
          }
        } else {
          closeInput(`e${this.id}`)
        }

        // open another input
        if (Array.from(document.querySelectorAll('.editing')).length > 0){ // if there is another input open
          let openElement = document.querySelector('.editing')
          saveEdit(openElement)
        }
      })

    }

    loadSubItems(){
      storage.listOfItems().forEach((i) => {
        if (this.id === i.list){
          this.addSubItem(i, false)
        }
      })
    }

    addSubItem(subItem, input = true){
      if (input == true ? document.querySelector(`.input-${this.id}`).value !== "" : true){
        
        this.subItems = Array.from(document.querySelectorAll(`.parent-${this.id}`)).length // to know the updated subitems amount (upgradeProgress was causing trouble)

        if (this.subItems == 0){ // add a new <ul> only if its the first subitem to add
          let list = document.createElement('ul')
          list.setAttribute("class", `list-${this.id}`)
          if (input){
            document.querySelector(`.extension.e${this.id}`).insertAdjacentElement('beforebegin', list)
          } else {
            document.querySelector(`.item-${this.id}.parent-${this.list}`).insertAdjacentElement('beforeend', list)
          }
        }
    
        if (input){
          let newItem = new Item(
            Date.now(), 
            document.querySelector(`.input-${this.id}`).value, 
            this.id, 
            "uncomplete",
            (new Date()).toDateString(),
            0,
            0, 
            this.mainList,
            'item')
          newItem.addItem(input = true)
          document.querySelector(`.input-${this.id}`).value = ""
        } else {
          let newItem = new Item(
            subItem.id, 
            subItem.text,
            this.id, 
            subItem.status,
            subItem.creationDate,
            subItem.subItems, 
            subItem.siblings, 
            this.mainList,
            subItem.type)
          newItem.addItem()
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
        let bar = document.querySelector(`.progress-${this.list}`)
        bar.setAttribute("value", cant.toString())
        bar.setAttribute("min", "0")
        bar.setAttribute("max", progress.items.toString())
        bar.innerText= `(${cant}/${progress.items})`
      }

      // UPDATE NEW ITEM BUTTON POSITION
      storage.listOfLists().find((l) => l.domName == this.mainList).newItemInput()
    }

    itemAge() {
        let now = new Date();
        let created = new Date(this.creationDate);
        let elapsed = now - created;
        let daysSinceCreated = Math.floor(elapsed / (1000 * 3600 * 24));
        return daysSinceCreated;
    }
  }

  const cancelEdit = (editedElement) => {
    editedElement.classList.remove('editing', 'open')
    document.querySelector(`.root.r${editedElement.id}`).hidden = false
    document.querySelector(`.edit.e${editedElement.id}`).remove()
  }

  const saveEdit = (editedElement) => {
    let editedItem = storage.listOfItems().find((i) => i.id == editedElement.id)
    let inputText = document.querySelector(`.inputedit.i${editedItem.id}`).value
    if (inputText != "" && inputText != editedItem.text){
      editedItem.text = inputText
      storage.updateItem(editedItem)
      document.querySelector(`.text.t${editedItem.id}`).innerText = editedItem.text
      editedElement.classList.remove('editing', 'open')
      document.querySelector(`.root.r${editedElement.id}`).hidden = false
      document.querySelector(`.edit.e${editedElement.id}`).remove()
    } else {
      cancelEdit(editedElement)
    }
  }

  const closeInput = (id) => {
    let extendButton = document.querySelector(`.extend.${id}`)
    document.querySelector(`.extension.${id}`).remove()
    extendButton.innerText = "v"
    extendButton.classList.remove("open")
  }
  
  export default Item;
