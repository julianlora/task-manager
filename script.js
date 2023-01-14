import List from "./List.js";
import Item from "./Item.js";
import * as storage from "./storage.js";

//CSV HANDLER

// save localStorage data in a csv file
// (function(console){
//   console.save = function(data, filename){
//       if(!data) {
//           console.error('Console.save: No data')
//           return;
//       }
//       if(!filename) filename = 'console.json'
//       if(typeof data === "object"){
//           data = JSON.stringify(data, undefined, 4)
//       }
//       var blob = new Blob([data], {type: 'text/json'}),
//           e    = document.createEvent('MouseEvents'),s
//           a    = document.createElement('a')
//       a.download = filename
//       a.href = window.URL.createObjectURL(blob)
//       a.dataset.downloadurl =  ['text/json', a.download, a.href].join(':')
//       e.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null)
//       a.dispatchEvent(e)
//   }
// })(console)
// console.save(JSON.parse(localStorage.getItem('items')), 'example-items.csv')

if(JSON.parse(localStorage.getItem('lists')) == null){
  let csvitems = await (await fetch('example-items.csv')).text();
  let csvlists = await (await fetch('example-lists.csv')).text(); // assign csv data to a variable
  if (csvitems[0] != '<' && csvlists[0] != '<'){
    localStorage.setItem('items', csvitems)
    localStorage.setItem('lists', csvlists)
  } else {
    console.log('example files not found')
  }
}

//CARGAR DATOS GUARDADOS
if (storage.listOfLists() !== null){ // Carga de listas
  storage.listOfLists().forEach((element) => {
    let list = new List(
      element.name,
      element.items,
      element.progress,
      element.status,
      element.domName,
      element.hideFinished
    );
    list.addList()

    if (storage.listOfItems() !== null){ // Carga de los items primarios para las listas
      storage.listOfItems().forEach((e) => {
        if (e.list === list.domName){
          list.createItem(e)
        }
      })
    }

  });
} else {
  console.log('No hay datos guardados')
}

const button = document.querySelector(".new-list-button")
button.addEventListener("click", () =>{
  if (document.querySelector(".new-list").value !== "" && (!storage.listOfLists().some( (e) => e.name === document.querySelector(".new-list").value))){
    //CREATE LIST OBJECT (text, items, progress, status)
    let list = new List(
      document.querySelector(".new-list").value,
      0,
      0,
      'none',
      document.querySelector(".new-list").value,
      false
    );

    list.addList()
  }

}, false)
