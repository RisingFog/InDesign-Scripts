#targetengine session;

var doc = app.activeDocument;
var script = [];
var scriptFile = null;
var scriptFileName = null;

openScript();
readScript();

// DIALOG
// ======
var dialog = new Window("palette"); 
    dialog.text = "Letterer Buddy"; 
    dialog.orientation = "column"; 
    dialog.alignChildren = ["center","top"]; 
    dialog.spacing = 10; 
    dialog.margins = 16; 
    dialog.onClose = function() {
        doc.removeEventListener('afterSelectionChanged', selectionChanged);
    }

// SCRIPTPANEL
// ===========
var scriptPanel = dialog.add("panel", undefined, undefined, {name: "scriptPanel"}); 
    scriptPanel.text = "Script"; 
    scriptPanel.orientation = "column"; 
    scriptPanel.alignChildren = ["left","top"]; 
    scriptPanel.spacing = 10; 
    scriptPanel.margins = 10; 

var list = scriptPanel.add("listbox", undefined, undefined, {name: "list"}); 
    list.preferredSize.width = 300; 
    list.preferredSize.height = 150; 
    populateList() 

// SETTINGSPANEL
// =============
var settingsPanel = dialog.add("panel", undefined, undefined, {name: "settingsPanel"}); 
    settingsPanel.text = "Settings"; 
    settingsPanel.orientation = "row"; 
    settingsPanel.alignChildren = ["left","top"]; 
    settingsPanel.spacing = 10; 
    settingsPanel.margins = 10; 

// OPTIONSPANEL
// ============
var optionsPanel = settingsPanel.add("panel", undefined, undefined, {name: "optionsPanel"}); 
    optionsPanel.text = "Options"; 
    optionsPanel.orientation = "column"; 
    optionsPanel.alignChildren = ["left","top"]; 
    optionsPanel.spacing = 10; 
    optionsPanel.margins = 10; 

var speakerText = optionsPanel.add("checkbox", undefined, undefined, {name: "speakerText"}); 
    speakerText.text = "Remove Speaker Text"; 
    speakerText.onClick = function() {
    if (list != null) {
        if (speakerText.value) {
            var regex = /^\w+:\s?/
            for (var i=0; i<script.length; i++) {
                if (script[i].match(regex)) {
                    script[i] = script[i].replace(regex, "");
                }
            }
        }
        populateList();
    }
};

var crossbarI = optionsPanel.add("checkbox", undefined, undefined, {name: "crossbarI"}); 
    crossbarI.text = "Replace Crossbar I"; 
    crossbarI.onClick = function() {
    if (list != null) {
        if (crossbarI.value == 1) {
            var regex = /\bI\B/
            for (var i=0; i<script.length; i++) {
                if (script[i].match(regex)) {
                    script[i] = script[i].replace(regex, "i");
                }
            }
        }
        populateList() 
    }
};

var ellipses = optionsPanel.add("checkbox", undefined, undefined, {name: "ellipses"}); 
    ellipses.text = "Replace Ellipses with Periods"; 
    ellipses.onClick = function() {
    if (list != null) {
        if (ellipses.value == 1) {
            for (var i=0; i<list.items.length; i++) {
                if (script[i].match("…")) {
                    script[i] = script[i].replace("…", "...");
                }
            }
        }
        else if (ellipses.value == 0) {
            for (var i=0; i<list.items.length; i++) {
                if (script[i].match("...")) {
                    script[i] = script[i].replace("...", "…");
                }
            }
        }
        populateList() 
    }
};

// ACTIONSPANEL
// ============
var actionsPanel = settingsPanel.add("panel", undefined, undefined, {name: "actionsPanel"}); 
    actionsPanel.text = "Actions"; 
    actionsPanel.orientation = "column"; 
    actionsPanel.alignChildren = ["left","top"]; 
    actionsPanel.spacing = 10; 
    actionsPanel.margins = 10; 

var loadScript = actionsPanel.add("button", undefined, undefined, {name: "loadScript"}); 
    loadScript.text = "Load Script"; 
    loadScript.onClick = function() {
        resetOptions();
        openScript();
        readScript();
        populateList();
    };

var resetScript = actionsPanel.add("button", undefined, undefined, {name: "resetScript"}); 
    resetScript.text = "Reset Script"; 
    resetScript.onClick = function() {
        resetOptions();
        readScript();
        populateList();
    };

dialog.show();

doc.addEventListener('afterSelectionChanged', selectionChanged);

function selectionChanged() {
    if (doc.selection[0] instanceof TextFrame && doc.selection[0].contents == '') {
        placeText();
    }
}

function placeText() {
    if (list.selection != null) {
        if (doc.selection[0] instanceof TextFrame) {
            doc.selection[0].contents = list.selection.text;
            if (list.selection < list.items.length) {
                list.selection = list.selection + 1;
            }
        }
    }
}

function populateList() {
    if (scriptFile != "" && scriptFile != null && scriptFileName.indexOf(".txt") == -1){
        alert("This file type is not supported. Please use .txt files only.");
        return;
    }
    list.removeAll();
    for (var i=0; i<script.length; i++) {
        list.add('item', script[i]);
    }
    list.selection = 0;
}

function readScript() {
    scriptFile.open("r");
    script = [];
    var lines = scriptFile.read();
    var lineList = lines.split('\n');
    for (var i=0; i<lineList.length; i++) {
        var line = lineList[i];
        if (line != '') {
            script.push(line.replace('\t', ''));
        }
    }
}

function openScript() {
    scriptFile = File.openDialog("Select your script text file");
    if (scriptFile != null) {
        scriptFileName = scriptFile.name; 
    }
}

function resetOptions() {
        speakerText.value = 0;
        crossbarI.value = 0;
        ellipses.value = 0;
}
