let listData = JSON.parse(localStorage.getItem('lists'))
let itemData = JSON.parse(localStorage.getItem('items'))
const listOfLists = listData != null ? listData : []
const listOfItems = itemData != null ? itemData : []

function saveList(list) {
    if (listOfLists.length != undefined && listOfLists.some((e) => e.name == list.name) == false){
        listOfLists.push(list)
        localStorage.setItem('lists', JSON.stringify(listOfLists))
    }    
}

function saveItem(item) {
    if (listOfItems.length != undefined && listOfItems.some((e) => e.id == item.id) == false){
        listOfItems.push(item)
        localStorage.setItem('items', JSON.stringify(listOfItems) )
    }
}

function removeItem(id) {
    let index = listOfItems.findIndex((element) => element.id === id)
    let item = listOfItems[index]
    if (item.subItems == 0){
        listOfItems.splice(index, 1)
        localStorage.setItem('items', JSON.stringify(listOfItems) )
    } else {
        listOfItems.forEach((e) => {
            if (e.list === id){
                removeItem(e.id)
            }
        })
        listOfItems.splice(index, 1)
        localStorage.setItem('items', JSON.stringify(listOfItems) )
    }
}

function removeList(name) {
    let data = JSON.parse(localStorage.getItem('items'))
    if (data != null){
        data.forEach((element) => {
            if (element.list === name){
                removeItem(element.id)
            }
        });
    }
    let index = listOfLists.findIndex((element) => element.name === name)
    listOfLists.splice(index, 1)
    localStorage.setItem('lists', JSON.stringify(listOfLists) )
}

function updateItem(item) {
    let index = listOfItems.findIndex((element) => element.id === item.id)
    listOfItems.splice(index, 1, item)
    localStorage.setItem('items', JSON.stringify(listOfItems) )
}

export {listOfItems, listOfLists, saveList, saveItem, removeItem, removeList, updateItem}