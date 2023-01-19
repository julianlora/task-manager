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
      type,
      retracted
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
      this.retracted = retracted
    }
    // Add methods like normal functions:
    
    addItem(input = false, type = 'item') {
      // ADD ITEM TO DOM

      const element = document.createElement("li")
      element.classList.add('item' , `parent-${this.list}`, `mainlist-${this.mainList}`)

      element.setAttribute('id', isNaN(this.id) == false ? 'id' + this.id.toString() : this.id)

      if (this.text == ""){
        this.text = document.querySelector(`.input-${this.list}`).value
      }
      if (this.type == 'item'){
        if (this.status == "uncomplete"){
          let content = `
            <div class="root r${this.id}">
              <input class="checkbox-${this.id} c${this.list}" type="checkbox">
              <span class="text t${this.id}">${this.text}</span>
              <span class="item-menu">
                <button class="btn retract ${this.id}" hidden>-</button>
                <button class="btn extend e${this.id}" hidden>+</button>
                <button class="btn delete d${this.id}" hidden>x</button>
              </span>
            </div>
          `
          element.innerHTML = content
        } else {
          let content = `
            <div class="root r${this.id}">
              <input class="checkbox-${this.id} c${this.list}" type="checkbox" checked>
              <span class="text t${this.id}">${this.text}</span>
              <span class="item-menu">
                <button class="btn retract ${this.id}" hidden>-</button>
                <button class="btn extend e${this.id}" hidden>+</button>
                <button class="btn delete d${this.id}" hidden>x</button>
              </span>
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
          <div class="root r${this.id} sublist">
            <b><span class="text t${this.id}">${this.text}</span></b>
            <span class="item-menu">
              <button class="btn retract ${this.id}" hidden>-</button>
              <button class="btn extend e${this.id}" hidden>+</button>
              <button class="btn delete d${this.id}" hidden>x</button>
            </span>
          </div>
        `
        element.innerHTML = content
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

      if (this.retracted){
        this.retractItem()
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
      let element = document.querySelector(`#${this.id}`)
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
            let parentElement = document.querySelector(`#${parent.id}`)
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
              let parentElement = document.querySelector(`#${parent.id}`)
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
      const rootElement = document.querySelector(`.root.r${this.id}`)
      textElement.addEventListener("click", (event) => {

        if (!element.classList.contains('editing') && window.getSelection().isCollapsed){
          
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
      const retractButton = document.querySelector(`.retract.${this.id}`)
      // BUTTON VISIBILITY
      rootElement.addEventListener("mouseover", (event) => {
        if (!element.classList.contains('editing')){
          deleteButton.hidden = false
          extendButton.hidden = false
          if (this.subItems > 0){
            retractButton.hidden = false
          }
        }
        event.stopPropagation()
      })
      rootElement.addEventListener("mouseleave", (event) => {
        if (!extendButton.classList.contains('open')){
          deleteButton.hidden = true
          extendButton.hidden = true
          retractButton.hidden = true
          event.stopPropagation()
        }
      })
      // BUTTON STYLE
      buttonStyle()

      // RETRACT SUBITEMS
      retractButton.addEventListener("click", () => {
        this.retractItem()
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
      // DELETE
      deleteButton.addEventListener("click", () => {
        element.remove()
        storage.removeItem(this.id)
        this.updateProgress()
        if (this.siblings == 1 && this.list != this.mainList) { // if it's the only subitem and its parent it's not the mainList remove unnecesary <ul> element
          document.querySelector(`.list-${this.list}`).remove()
        }
      })

    }

    retractItem(){
      let root = document.querySelector(`.root.r${this.id}`)
      let button = document.querySelector(`.retract.${this.id}`)
      if (!root.classList.contains("retracted")){
        root.classList.add('retracted')
        button.innerText = 'v'
        document.querySelector(`.list-${this.id}`).hidden = true
        this.retracted = true
        storage.updateItem(this)
      } else {
        root.classList.remove('retracted')
        button.innerText = '-'
        document.querySelector(`.list-${this.id}`).hidden = false
        this.retracted = false
        storage.updateItem(this)
      }
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
        let creator = storage.listOfLists().find((l) => l.domName == this.mainList)

        if (this.subItems == 0){ // add a new <ul> only if its the first subitem to add
          let list = document.createElement('ul')
          list.setAttribute("class", `list-${this.id}`)
          if (input){
            document.querySelector(`.extension.e${this.id}`).insertAdjacentElement('beforebegin', list)
          } else {
            document.querySelector(`#${this.id}`).insertAdjacentElement('beforeend', list)
          }
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
    extendButton.innerText = "+"
    extendButton.classList.remove("open")
  }

  const buttonStyle = () => {
    let buttons = document.querySelectorAll('.btn')
    
    buttons.forEach((b) => {
      b.addEventListener("mouseover", () => {
        b.setAttribute("style", "background-color:#5f6368;")
      })
      b.addEventListener("mouseleave", () => {
        b.setAttribute("style", "background-color:none;")
      })
    })
  }

  export default Item;
  export {buttonStyle}