import Item from "./Item.js";
import List from "./List.js";

function listOfItems(){
    let values = []
    let items = []
    let itemData = JSON.parse(localStorage.getItem('items'), function (key, value){
        if (typeof value == 'object' && value != null && values.length != 0){ // if storage isn't empty
            let item = new Item(
                values[0],
                values[1],
                values[2],
                values[3],
                values[4],
                values[5],
                values[6],
                values[7],
                values[8],
                values[9],
                values[10]
            )
            items.push(item)
            values = []
        } else {
            values.push(value)
        }
    })
    return items
}

function listOfLists(){
    let values = []
    let lists = []
    let listData = JSON.parse(localStorage.getItem('lists'), function (key, value){
        if (typeof value == 'object' && value != null && values.length != 0){
            let item = new List(
                values[0],
                values[1],
                values[2],
                values[3],
                values[4],
                values[5],
                values[6]
            )
            lists.push(item)
            values = []
        } else {
            values.push(value)
        }
    })
    return lists
}

function saveList(list) {
    let data = listOfLists()
    if (data.length != undefined && data.some((e) => e.name == list.name) == false){
        data.push(list)
        localStorage.setItem('lists', JSON.stringify(data))
    }    
}

function saveItem(item) {
    
    let data = listOfItems()
    if (data.length != undefined && data.some((e) => e.id == item.id) == false){
        data.push(item)
        localStorage.setItem('items', JSON.stringify(data) )
    }
}

function removeItem(id) {
    let data = listOfItems()
    let index = data.findIndex((element) => element.id === id)
    if (index != (-1)){
        let item = data[index]
        if (item.subItems == 0){
            data.splice(index, 1)
            localStorage.setItem('items', JSON.stringify(data) )
        } else {
            data.forEach((e) => {
                if (e.list === id){
                    removeItem(e.id)
                }
            })
            data = listOfItems()
            data.splice(index, 1)
            localStorage.setItem('items', JSON.stringify(data) )
        }
    }
}

function removeList(domName) {
    if (listOfLists().length == 1){
        localStorage.clear()
    } else {
        let data = JSON.parse(localStorage.getItem('items'))
        if (data != null){
            data.forEach((element) => {
                if (element.list === domName){
                    removeItem(element.id)
                }
            });
        }
        data = listOfLists()
        let index = data.findIndex((element) => element.domName === domName)
        if (index != (-1)){
            data.splice(index, 1)
            localStorage.setItem('lists', JSON.stringify(data) )
        }
    }
    
}

function updateItem(item) {
    let data = listOfItems()
    let index = data.findIndex((element) => element.id === item.id)
    if (index != (-1)){
        let flag = 0
        for (var prop in item) {
            if (Object.prototype.hasOwnProperty.call(item, prop)) {
                if (item[prop] != data[index][prop]){
                    flag = 1
                    break
                }
            }
        }
        if (flag == 1){ // changed
            data.splice(index, 1, item)
            localStorage.setItem('items', JSON.stringify(data))
            return 0
        } else { // no changes
            return 1
        }
    } else { // not found
        return -1
    }
}

function updateList(list) {
    let data = listOfLists()
    let index = data.findIndex((element) => element.name == list.name)
    if (index != (-1)){
        let flag = 0
        for (var prop in list) {
            if (Object.prototype.hasOwnProperty.call(list, prop)) {
                if (list[prop] != data[index][prop]){
                    flag = 1
                    break
                }
            }
        }
        if (flag == 1){ // changed
            data.splice(index, 1, list)
            localStorage.setItem('lists', JSON.stringify(data))
            return 0
        } else { // no changes
            return 1
        }
    } else { // not found
        return -1
    }
}

// save localStorage data in a csv file
(function(console){
    console.save = function(data, filename){
        if(!data) {
            console.error('Console.save: No data')
            return;
        }
        if(!filename) filename = 'console.json'
        if(typeof data === "object"){
            data = JSON.stringify(data, undefined, 4)
        }
        var blob = new Blob([data], {type: 'text/json'}),
            e    = document.createEvent('MouseEvents'),
            a    = document.createElement('a')
        a.download = filename
        a.href = window.URL.createObjectURL(blob)
        a.dataset.downloadurl =  ['text/json', a.download, a.href].join(':')
        e.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null)
        a.dispatchEvent(e)
    }
})(console)

function dataToCsv(data, filename){
    console.save(data, filename)
}
  
export {listOfItems, listOfLists, saveList, saveItem, removeItem, removeList, updateItem, updateList, dataToCsv}