import * as storage from "./storage.js";

// Setups are called only once after the creation of each element, they are not meant to be used as update calls in an already set up element

// ITEM SETUP
const itemSetup = (itemElement) => {

	const itemId = itemElement.getAttribute('id')
    const rootElement = document.querySelector(`.root.r${itemId}`)
  
    // DRAG ITEM
    rootElement.addEventListener('dragstart', (event) => {
  
      let item = storage.listOfItems().find((i) => i.id == itemId)
      itemElement.classList.add('dragstart')
      if(item.subItems != 0){
        item.retractItem(true, false)
      }
      event.stopPropagation()
    })
  
    itemElement.addEventListener('dragenter', (event) => {
      rootElement.classList.add('over')
      event.stopPropagation()
  
    })
    itemElement.addEventListener('dragleave', (event) => {
      rootElement.classList.remove('over')
      event.stopPropagation()
    })
  
    itemElement.addEventListener('dragover', (event) => {
      event.preventDefault() // without this the drop can't be detected
    })
  
    itemElement.addEventListener('drop', (event) => {
  
		let item = storage.listOfItems().find((i) => i.id == itemId)
		rootElement.classList.remove('over')
		const startElement = document.querySelector('.dragstart')
		const startItem = storage.listOfItems().find((i) => i.id == startElement.getAttribute('id'))
		startElement.classList.remove('dragstart')
		itemElement.insertAdjacentElement('afterend', startElement)
	
		// index actualization
		let endIndex = item.index
		if (item.list == startItem.list){ // if the list is the same
			if (startItem.index < endIndex){ // if the destination is after
				storage.listOfItems().forEach((i) => {
					if(i.list == item.list && i.index <= endIndex && i.index > startItem.index){
						i.index --
						document.querySelector(`#${i.id}`).setAttribute('data-index', i.index)
						storage.updateItem(i)
					}
				})
			} else { // if the destination is before
				storage.listOfItems().forEach((i) => {
					if(i.list == item.list && i.index >= endIndex && i.index < startItem.index){
						i.index ++
						document.querySelector(`#${i.id}`).setAttribute('data-index', i.index)
						storage.updateItem(i)
					}
				})
			}
			startItem.index = endIndex
			document.querySelector(`#${startItem.id}`).setAttribute('data-index', startItem.index)
			storage.updateItem(startItem)

		} else { // if it is another list
			// origin list
			storage.listOfItems().forEach((i) => {
			if (i.list == startItem.list && i.index > startItem.index){
				i.index --
				document.querySelector(`#${i.id}`).setAttribute('data-index', i.index)
				storage.updateItem(i)
			}
			})
			// destination list
			storage.listOfItems().forEach((i) => {
			if (i.list == item.list && i.index > endIndex){
				i.index ++
				document.querySelector(`#${i.id}`).setAttribute('data-index', i.index)
				storage.updateItem(i)
			}
			})
	
			startElement.remove()
			startItem.index = endIndex + 1
			startItem.list = item.list
			startItem.mainList = item.mainList
			item.createAndInsertDomElement(startItem)
			startItem.loadSubItems()
			startItem.updateProgress()
			
		}
	
		if (startItem.subItems != 0){
			startItem.retractItem(startItem.retracted)
		}
		event.stopPropagation()
  
    })
  
    //EDIT
    let textElement = document.querySelector(`.text.t${itemId}`)
    textElement.addEventListener("click", (event) => {
  
		//if there is another edit open
		if (Array.from(document.querySelectorAll('.editing')).length > 0 && window.getSelection().isCollapsed){
			Array.from(document.querySelectorAll('.editing')).forEach((e) => {
				if (e != itemElement){
				saveEdit(e)
				}
			})
		} else if (!itemElement.classList.contains('editing') && window.getSelection().isCollapsed){

			// create edit box
			let item = storage.listOfItems().find((i) => i.id == itemId)
			itemElement.classList.add('editing', 'open')
			textElement.hidden = true
			let edit = document.createElement('div')
			edit.classList.add('edit', `e${item.id}`)
			let content = `
			<input class="inputedit i${item.id}" value="${item.text}">
			<button class="saveedit s${item.id}">Save</button>
			<button class="canceledit c${item.id}">Cancel</button>
			`
			edit.innerHTML = content
			if (itemElement.classList.contains('sublist')){
				textElement.insertAdjacentElement('beforebegin', edit)
				edit.classList.add('sublist')
			} else {
				document.querySelector(`.checkbox-${item.id}`).insertAdjacentElement('afterend', edit)
			}
	
			// save
			document.querySelector(`.saveedit.s${item.id}`).addEventListener("click",() => {
			saveEdit(itemElement)
			})
	
			//cancel
			document.querySelector(`.canceledit.c${item.id}`).addEventListener("click", () => {
			cancelEdit(itemElement)
			})
	
			// open another input
			if (Array.from(document.querySelectorAll('.extension')).length > 0){
				let openElement = document.querySelector('.extension')
				closeInput(openElement.classList[1])
			}
	
			// click outside
			window.onclick = (event) => {
				if (!event.target.matches(`.inputedit`) 
				&& !event.target.matches(`.saveedit`) 
				&& !event.target.matches(`.canceledit`) 
				&& Array.from(document.querySelectorAll(`.editing`)).length > 0){
					saveEdit(itemElement)
				}
			}
		}
		event.stopPropagation()
    })
  
    const deleteButton = document.querySelector(`.delete.d${itemId}`)
    const extendButton = document.querySelector(`.extend.e${itemId}`)
    const retractButton = document.querySelector(`.retract.${itemId}`)
    const moveButton = document.querySelector(`.drag.${itemId}`)
    
    // BUTTON VISIBILITY
    rootElement.addEventListener("mouseover", (event) => {
		let item = storage.listOfItems().find((i) => i.id == itemId)
		if (!itemElement.classList.contains('editing')){
			deleteButton.hidden = false
			
			moveButton.hidden = false
			if (storage.listOfItems().find((i) => i.id == item.id).subItems > 0){
				retractButton.hidden = false
			} else {
				extendButton.hidden = false
			}
		}
		event.stopPropagation()
    })
    rootElement.addEventListener("mouseleave", (event) => {
		if (!extendButton.classList.contains('open')){
			let item = storage.listOfItems().find((i) => i.id == itemId)
			deleteButton.hidden = true
			extendButton.hidden = true
			if (!item.retracted){
				retractButton.hidden = true
				retractButton.classList.remove('retracted')
			} else {
				retractButton.classList.add('retracted')
			}
			moveButton.hidden = true
			event.stopPropagation()
		}
    })
    
    //BUTTON STYLE
	buttonStyle()

    // RETRACT SUBITEMS
    retractButton.addEventListener("click", () => {
        let item = storage.listOfItems().find((i) => i.id == itemId)
        if (!rootElement.classList.contains('retracted')){
          item.retractItem(true)
        } else {
          item.retractItem(false)
        }
    })

    // INPUT SUBITEM

	// style
	
	// itemElement.addEventListener("mouseenter", (event) => {
	// 	let item = storage.listOfItems().find((i) => i.id == itemId)
	// 	if (item.subItems > 0){
	// 		itemElement.classList.add('hover')
	// 	}
	// 	event.stopPropagation()
	// })
	// itemElement.addEventListener("mouseleave", (event) => {
	// 	let item = storage.listOfItems().find((i) => i.id == itemId)
	// 	if (item.subItems > 0){
	// 		itemElement.classList.remove('hover')
	// 	}
	// 	event.stopPropagation()
	// })
	// function
    extendButton.addEventListener("click", () => {
        let item = storage.listOfItems().find((i) => i.id == itemId)
        if (!extendButton.classList.contains("open")){
          
			extendButton.classList.add("open")
			extendButton.innerText = "^"
			let extension = document.createElement('ul')
			extension.setAttribute("class", `extension e${item.id}`)
			let content = `
			<li class="root">
				<div class="btn drag" hidden>=</div>
				<input type="checkbox" disabled>
				<span class="text">
				<input class="input-${item.id}">
				<button class="add-${item.id}">Add</button>
				</span>
			</li>
			`;
			extension.innerHTML = content
			itemElement.insertAdjacentElement("beforeend", extension)

			let addButton = document.querySelector(`.add-${item.id}`)
			addButton.addEventListener("click", () => {
				item.addSubItem(item)
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
				if ((!event.target.matches(`.extension.e${item.id}`)
				&& !event.target.matches(`.extend.e${item.id}`) 
				&& extendButton.classList.contains('open')
				&& !event.target.matches(`.input-${item.id}`)
				&& !event.target.matches(`.add-${item.id}`))) {
					closeInput(`e${item.id}`)
					moveButton.hidden = true
					extendButton.hidden = true
					retractButton.hidden = true
					deleteButton.hidden = true
				}
			}
        } else {
          	closeInput(`e${item.id}`)
        }

        // open another input
        if (Array.from(document.querySelectorAll('.editing')).length > 0){ // if there is another input open
			let openElement = document.querySelector('.editing')
			saveEdit(openElement)
        }
    })

    // DELETE
    deleteButton.addEventListener("click", () => {
        let item = storage.listOfItems().find((i) => i.id == itemId)
		let parent = storage.listOfItems().find((i) => i.id == item.list)
        itemElement.remove()
        storage.removeItem(item.id)
        if (item.siblings == 1 && parent != undefined) { // if it's the only subitem
			if (parent.type == 'sublist'){
				document.querySelector(`.emptyrow.${parent.id}`).hidden = false
				parent.updateProgress(true)
			} else {
				document.querySelector(`.list-${item.list}`).remove()
				document.querySelector(`.retract.${item.list}`).hidden = true
			}
			
        }
		item.updateProgress(true)

        
    })

}

// LIST SETUP
const listSetup = (list) => {

	// ADD SUBITEM
	if (!list.classList.contains('mainlist')){

		const itemId = list.parentElement.getAttribute('id')
		let itemElement = document.querySelector(`#${itemId}`)
		let item = storage.listOfItems().find((i) => i.id == itemId)
		let extraRow

		// ELEMENT
		const subitemButton = document.createElement('button')
		subitemButton.innerText = '+'
		subitemButton.classList.add('addsubitem', 'btn')
		list.insertAdjacentElement('beforeend', subitemButton)
		let linework = document.createElement('div')
		linework.classList.add('addsubitem', 'linework', `${itemId}`)
		list.insertAdjacentElement('afterbegin', linework)

		// VISIBILITY
		itemElement.addEventListener('mouseenter', () => {
			if(document.querySelectorAll('.open').length == 0){
				linework.classList.add('hover')
				subitemButton.classList.add('hover')
			}
		})
		itemElement.addEventListener('mouseleave', () => {
			if (!subitemButton.classList.contains('open')){
				linework.classList.remove('hover')
				subitemButton.classList.remove('hover')
			}
		})

		// FUNCTIONALITY
		subitemButton.addEventListener("click", () => {
			let item = storage.listOfItems().find((i) => i.id == itemId)
			if (!subitemButton.classList.contains("open")){

				document.querySelectorAll('.hover').forEach((e) => { // turn off every other hover except this one
					if (e != linework && e != subitemButton){
						e.classList.remove('hover')
					}
				})

				if (document.querySelector(`.emptyrow.${itemId}`) != undefined && document.querySelector(`.emptyrow.${itemId}`).hidden == false){
					extraRow = true
					document.querySelector(`.emptyrow.${itemId}`).hidden = true
				}

				linework.style.height = 'calc(100% - 5px)' // adjust line
				subitemButton.classList.add("open")
				subitemButton.hidden = true
				let extension = document.createElement('ul')
				extension.setAttribute("class", `extension e${item.id}`)
				let content = `
				<li class="root">
					<div class="linework2"></div>
					<div class="linework3"></div>
					<input type="checkbox" disabled>
					<span class="text">
					<input class="input-${item.id}">
					<button class="add-${item.id}">Add</button>
					<button class="cancel-${item.id}">x</button>
					</span>
				</li>
				`;
				extension.innerHTML = content
				itemElement.insertAdjacentElement("beforeend", extension)
	
				let addButton = document.querySelector(`.add-${item.id}`)
				addButton.addEventListener("click", () => {
					item.addSubItem(item)
					if (extraRow){
						extraRow = false
					}
				})
				let cancelButton = document.querySelector(`.cancel-${item.id}`)
				cancelButton.addEventListener('click', () => {
					subitemButton.classList.remove("open")
					document.querySelector(`.extension.e${item.id}`).remove()
					subitemButton.hidden = false
					linework.style.height = 'calc(100% - 27px)'
					if (extraRow){
						document.querySelector(`.emptyrow.${itemId}`).hidden = false
					}
				})
			}
		})


	}

			

}

 
// FUNCTIONS
const createEmptyRow = (list, id) => {
	let emptyRow = document.createElement('li')
	emptyRow.classList.add('emptyrow', `${id}`)
	emptyRow.innerText = 'ssss'
	list.insertAdjacentElement('beforeend', emptyRow)
}

const cancelEdit = (editedElement) => {
    editedElement.classList.remove('editing', 'open')
    document.querySelector(`.text.t${editedElement.id}`).hidden = false
    document.querySelector(`.edit.e${editedElement.id}`).remove()
}

const saveEdit = (editedElement) => {
    let editedItem = storage.listOfItems().find((i) => i.id == editedElement.id)
    let inputText = document.querySelector(`.inputedit.i${editedItem.id}`).value
    if (inputText != "" && inputText != editedItem.text){
        editedItem.text = inputText
        storage.updateItem(editedItem)
        document.querySelector(`.text.t${editedItem.id}`).innerText = editedItem.text
        document.querySelector(`.text.t${editedElement.id}`).hidden = false
        editedElement.classList.remove('editing', 'open')
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

export {itemSetup, listSetup}