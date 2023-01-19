import List from "./List.js";
import Item from "./Item.js";
import * as storage from "./storage.js";

// BACKUP download data to csv file
//storage.dataToCsv(JSON.parse(localStorage.getItem('items')), 'backup-items.csv')
//storage.dataToCsv(JSON.parse(localStorage.getItem('lists')), 'example-lists.csv')

// CLEAR DATA
// localStorage.clear()

// LOAD EXAMPLE
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
      element.hideFinished,
      element.retracted
    );
    list.addList()

    if (storage.listOfItems() !== null){ // Carga de los items primarios para las listas
      storage.listOfItems().forEach((e) => {
        if (e.list === list.domName){
          list.createItem(e, e.type, false)
        }
      })
    }

  });
} else {
  console.log('No hay datos guardados')
}

// NUEVA LISTA
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
      false,
      false
    );

    list.addList()
  }

}, false)
