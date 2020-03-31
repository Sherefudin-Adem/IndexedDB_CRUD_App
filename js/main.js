import dictdb, {
  bulkcreate, createEle, getData, SortObj
} from "./module.js";

const $Id = document.getElementById.bind(document);
const $Qs = document.querySelector.bind(document);

let db = dictdb("Dictionarydb", {
  products: `++id, word, sentence, related`
});

// input tags
const userId = $Id("userid");
const word = $Id("word");
const sentence = $Id("sentence");
const related = $Id("related");

// create button
const btnCreate = $Id("btn-create");
const btnRead = $Id("btn-read");
const btnUpdate = $Id("btn-update");
const btnDelete = $Id("btn-delete");

// event listerner for create button
btnCreate.onclick = event => {
  // insert values
  let flag = bulkcreate(db.products, {
    word: word.value,
    sentence: sentence.value,
    related: related.value
  });
  
  word.value = sentence.value = related.value = "";

  // set id textbox value
  getData(db.products, data => {
    userId.value = data.id + 1 || 1;
  });
  table();

  let insertmsg = $Qs(".insertmsg");
  getMsg(flag, insertmsg);
};

// event listerner for create button
btnRead.onclick = table;

// button update
btnUpdate.onclick = () => {
  const id = parseInt(userId.value || 0);
  if (id) {
    // call dexie update method
    db.products.update(id, {
      word: word.value,
      sentence: sentence.value,
      related: related.value
    }).then((updated) => {
      // let get = updated ? `data updated` : `couldn't update data`;
      let get = updated ? true : false;

      // display message
      let updatemsg = $Qs(".updatemsg");
      getMsg(get, updatemsg);

      word.value = sentence.value = related.value = "";
      //console.log(get);
    })
  } else {
    console.log(`Please Select id: ${id}`);
  }
}

// delete button
btnDelete.onclick = () => {
  db.delete();
  db = dictdb("Dictionarydb", {
    products: `++id, word, sentence, related`
  });
  db.open();
  table();
  textID(userId);
  // display message
  let deletemsg = $Qs(".deletemsg");
  getMsg(true, deletemsg);
}

window.onload = event => {
  // set id textbox value
  textID(userId);
};




// create dynamic table
function table() {
  const tbody = $Id("tbody");
  const notfound = $Id("notfound");
  notfound.textContent = "";
  // remove all childs from the dom first
  while (tbody.hasChildNodes()) {
    tbody.removeChild(tbody.firstChild);
  }


  getData(db.products, (data, index) => {
    if (data) {
      createEle("tr", tbody, tr => {
        for (const value in data) {
          createEle("td", tr, td => {
            td.textContent = data.related === data[value] ? `${data[value]}` : data[value];
          });
        }
        createEle("td", tr, td => {
          createEle("i", td, i => {
            i.className += "fas fa-edit btnedit";
            i.setAttribute(`data-id`, data.id);
            // store number of edit buttons
            i.onclick = editbtn;
          });
        })
        createEle("td", tr, td => {
          createEle("i", td, i => {
            i.className += "fas fa-trash-alt btnDelete";
            i.setAttribute(`data-id`, data.id);
            // store number of edit buttons
            i.onclick = deletebtn;
          });
        })
      });
    } else {
      notfound.textContent = "No record found in the database...!";
    }

  });
}

const editbtn = (event) => {
  let id = parseInt(event.target.dataset.id);
  db.products.get(id, function (data) {
    let newdata = SortObj(data);
    userId.value = newdata.id || 0;
    word.value = newdata.name || "";
    sentence.value = newdata.sentence || "";
    related.value = newdata.related || "";
  });
}

// delete icon remove element 
const deletebtn = event => {
  let id = parseInt(event.target.dataset.id);
  db.products.delete(id);
  table();
}

// textbox id
function textID(textboxid) {
  getData(db.products, data => {
    textboxid.value = data.id + 1 || 1;
  });
}

// function msg
function getMsg(flag, element) {
  if (flag) {
    // call msg 
    element.className += " movedown";

    setTimeout(() => {
      element.classList.forEach(classname => {
        classname == "movedown" ? undefined : element.classList.remove('movedown');
      })
    }, 4000);
  }
}