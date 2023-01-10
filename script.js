import List from "./List.js";
import Item from "./Item.js";
import * as storage from "./storage.js";

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
