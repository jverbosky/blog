// Holds pairs and helper function used for evaluation in showNewItemField()
var newAnimalItemIds = {
    "<Create a New Animal>": "newAnimalDiv",
    "<Create a New Habitat>": "newHabitatDiv",
    "<Create a New Menu>": "newMenuDiv",
    "<Create a New Option>": "newOptionDiv",
    key: function(n) {  // helper function to allow access to values by index when key is undefined
        return this[Object.keys(this)[n]];
    }
};
var currentAniType = document.getElementById("currentAniType").value;


// Evaluates Animals & Program Management drop-down values and shows/hides field for creating new item
function showNewItemField(id, name){

    // leverage existing onchange() to remove red text formatting for selected option
    var selectClasses = document.getElementById(id).classList;
    selectClasses.remove('defaultGray');

    if (name in newAnimalItemIds) {
        if (id === "animal") {
            document.getElementById(newAnimalItemIds[name]).innerHTML = '<label>New Animal:</label> <input autofocus type="text" class="ani_drop_down" name="newAnimal" id="newAnimal" />';
        } else if (id === "habitat") {
            document.getElementById(newAnimalItemIds[name]).innerHTML = '<label>New Habitat:</label> <input autofocus type="text" class="ani_drop_down" name="newHabitat" id="newHabitat" />';
        } else if (id === "menu") {
            document.getElementById(newAnimalItemIds[name]).innerHTML = '<label>New Menu:</label> <input autofocus type="text" class="ani_drop_down" name="newMenu" id="newMenu" />';
        } else if (id === "option") {
            document.getElementById(newAnimalItemIds[name]).innerHTML = '<label>New Option:</label> <input autofocus type="text" class="ani_drop_down" name="newOption" id="newOption" />';
        }
    } else {
        if (id === "animal") {
            document.getElementById(newAnimalItemIds.key(0)).innerHTML = '';  // name is undefined so use index to access value
        } else if (id === "habitat") {
            document.getElementById(newAnimalItemIds.key(1)).innerHTML = '';
        } else if (id === "menu") {
            document.getElementById(newAnimalItemIds.key(2)).innerHTML = '';
        } else if (id === "option") {
            document.getElementById(newAnimalItemIds.key(3)).innerHTML = '';
        } else {
            console.log("No matches!")
        }
    }
}


// // Function to perform POST request - called at bottom of postAnimalInfo() with parameters
// function post(path, params, method) {

//     method = method || "post"; // Set method to post by default if not specified.
//     var form = document.createElement("form");
//     form.setAttribute("method", method);
//     form.setAttribute("action", path);

//     for(var key in params) {
//         if(params.hasOwnProperty(key)) {
//             var hiddenField = document.createElement("input");
//             hiddenField.setAttribute("type", "hidden");
//             hiddenField.setAttribute("name", key);
//             hiddenField.setAttribute("value", params[key]);
//             form.appendChild(hiddenField);
//          }
//     }

//     document.body.appendChild(form);
//     form.submit();
// }


// POSTs the specified drop-down or user-defined animal info
// - note that ' and " are escaped in the erb file for drop-downs via .replace()
function postAnimalInfo(changeType) {

    if ($("#animal").val() === "<Create a New Animal>") {
        var vAnimal = $("#newAnimal").val().replace(/"/g, '\\"').replace(/'/g, "\\'");
    } else {
        var vAnimal = $("#animal").val();
    };
    if ($("#habitat").val() === "<Create a New Habitat>") {
        var vHabitat = $("#newHabitat").val().replace(/"/g, '\\"').replace(/'/g, "\\'");
    } else {
        var vHabitat = $("#habitat").val();
    };
    if ($("#menu").val() === "<Create a New Menu>") {
        var vMenu = $("#newMenu").val().replace(/"/g, '\\"').replace(/'/g, "\\'");
    } else {
        var vMenu = $("#menu").val();
    };
    if ($("#option").val() === "<Create a New Option>") {
        var vOption = $("#newOption").val().replace(/"/g, '\\"').replace(/'/g, "\\'");
    } else {
        var vOption = $("#option").val();
    };

    post('/prototypes', {animal: vAnimal, habitat: vHabitat, menu: vMenu, option: vOption, change_type: changeType});
    sessionStorage.setItem('dataPosted', true);  // store POST state for showing/hiding feedback div
}


// Call postAnimalInfo() with "extend" value when the Add button is clicked
$("#btnExtendAnimalInfo").on("click", function() {

    postAnimalInfo("extend");
});


// Call postAnimalInfo() with "prune" value when the Delete button is clicked
$("#btnPruneAnimalInfo").on("click", function() {

    postAnimalInfo("prune");
});


// Update animal type drop-down value
function setSelectedIndex(s, valsearch) {

    document.getElementById("currentAniType").value = currentAniType;

    // Loop through all the items in drop down list
    for (i = 0; i< s.options.length; i++) { 

        if (s.options[i].value == valsearch) {
            s.options[i].selected = true;  // Item is found. Set its property and exit
            break;
        }
    }

    return;
}