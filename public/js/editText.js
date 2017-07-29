var commands = [{
  "cmd": "bold",
  "icon": "bold",
  "desc": "Toggles bold on/off for the selection."
}, {
  "cmd": "italic",
  "icon": "italic",
  "desc": "Toggles italics on/off for the selection."
}, {
  "cmd": "underline",
  "icon": "underline",
  "desc": "Toggles underline on/off for the selection."
}, {
  "cmd": "strikeThrough",
  "icon": "strikethrough",
  "desc": "Toggles strikethrough on/off for the selection."
}, {
  "cmd": "superscript",
  "icon": "superscript",
  "desc": "Toggles superscript on/off for the selection."
}, {
  "cmd": "subscript",
  "icon": "subscript",
  "desc": "Toggles subscript on/off for the selection."
}, {
  "cmd": "createLink",
  "name": "link",
  "val": "https://",
  "icon": "link",
  "desc": "Embeds a hyperlink into the selection, or creates a hyperlink if no selection."
}, {
  "cmd": "unlink",
  "icon": "chain-broken",
  "desc": "Removes a hyperlink from the selection."
}, {
  "cmd": "insertOrderedList",
  "icon": "list-ol",
  "desc": "Creates a numbered ordered list for the selection or at the insertion point."
}, {
  "cmd": "insertUnorderedList",
  "icon": "list-ul",
  "desc": "Creates a bulleted unordered list for the selection or at the insertion point."
}, {
  "cmd": "indent",
  "icon": "indent",
  "desc": "Indents the line containing the selection or insertion point."
}, {
  "cmd": "outdent",
  "icon": "outdent",
  "desc": "Outdents the line containing the selection or insertion point."
}, {
  "cmd": "justifyLeft",
  "icon": "align-left",
  "desc": "Justifies the selection or insertion point to the left."
}, {
  "cmd": "justifyRight",
  "icon": "align-right",
  "desc": "Right-justifies the selection or the insertion point."
}, {
  "cmd": "justifyCenter",
  "icon": "align-center",
  "desc": "Centers the selection or insertion point."
}, {
  "cmd": "justifyFull",
  "icon": "align-justify",
  "desc": "Justifies the selection or insertion point."
}, {
  "cmd": "undo",
  "icon": "undo",
  "desc": "Undoes the last executed command."
}, {
  "cmd": "redo",
  "icon": "repeat",
  "desc": "Redoes the previous undo command."
}];

var commandRelation = {};


// Determines if the document.execCommand command is supported by the browser
function supported(cmd) {

  var css = !!document.queryCommandSupported(cmd.cmd) ? "btn-succes" : "btn-error"
  return css

};


// Assigns the Font Awesome class name programmatically
function icon(cmd) {

  return (typeof cmd.icon !== "undefined") ? "fa fa-" + cmd.icon : "";

};


// Programmatically calls supported(), prompts for a link value and runs document.execCommand
function doCommand(cmdKey) {

  var command = commandRelation[cmdKey];

  if (supported(command) === "btn-error") {
    alert("execCommand(“" + command.cmd + "”)\nis not supported in your browser");
    return;
  }

  val = (typeof command.val !== "undefined") ? prompt("Please enter an address for the " + command.name + ":", command.val) : "";

  document.execCommand(command.cmd, false, (val || ""));
}


// Init function that programmatcially assigns a span with parameters to each button
function init() {
  
  var html = ''
  var template = '<span><code class="formatButton %support%" title="%desc%" onmousedown="event.preventDefault();" onclick="doCommand(\'%cmd%\')"><i class="%faIcon%"></i></code></span>';
  
  commands.map(function(command, i) {
    commandRelation[command.cmd] = command;
    var temp = template;
    temp = temp.replace(/%faIcon%/gi, icon(command));
    temp = temp.replace(/%desc%/gi, command.desc);
    temp = temp.replace(/%support%/gi, supported(command));
    temp = temp.replace(/%cmd%/gi, command.cmd);
    html+=temp;
  });

  document.querySelector(".formatButtons").innerHTML = html;
}

init();