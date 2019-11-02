#targetengine session;

var doc = app.activeDocument;
var script = [];
var scriptFile = null;
var scriptFileName = null;
var lastScriptPath = null;
var newScript = true;
var lastScriptIndex = 0;

var directory = new File($.fileName).parent;

// DIALOG
// ======
var dialog = new Window("window", undefined, undefined, {maximizeButton: false}); 
    dialog.text = "Letterer Buddy"; 
    dialog.orientation = "column"; 
    dialog.alignChildren = ["center","top"]; 
    dialog.spacing = 10; 
    dialog.margins = 16; 
    dialog.onClose = function() {
        doc.removeEventListener('afterSelectionChanged', selectionChanged);
        saveOptions();
    };

// TPANEL1
// =======
var tpanel1 = dialog.add("tabbedpanel", undefined, undefined, {name: "tpanel1"}); 
    tpanel1.alignChildren = "fill"; 
    tpanel1.preferredSize.width = 324; 
    tpanel1.margins = 0; 

// SCRIPTTAB
// =========
var scriptTab = tpanel1.add("tab", undefined, undefined, {name: "scriptTab"}); 
    scriptTab.text = "Script"; 
    scriptTab.orientation = "column"; 
    scriptTab.alignChildren = ["left","top"]; 
    scriptTab.spacing = 10; 
    scriptTab.margins = 10; 

var list = scriptTab.add("listbox", undefined, undefined, {name: "list"}); 
    list.preferredSize.width = 300; 
    list.preferredSize.height = 150; 

// ACTIONSPANEL
// ============
var actionsPanel = scriptTab.add("panel", undefined, undefined, {name: "actionsPanel"}); 
    actionsPanel.text = "Actions"; 
    actionsPanel.orientation = "row"; 
    actionsPanel.alignChildren = ["center","top"]; 
    actionsPanel.spacing = 10; 
    actionsPanel.margins = 10; 
    actionsPanel.preferredSize.width = 300;

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

// SETTINGSTAB
// ===========
var settingsTab = tpanel1.add("tab", undefined, undefined, {name: "settingsTab"}); 
    settingsTab.text = "Settings"; 
    settingsTab.orientation = "column"; 
    settingsTab.alignChildren = ["left","top"]; 
    settingsTab.spacing = 10; 
    settingsTab.margins = 10; 

var speakerText = settingsTab.add("checkbox", undefined, undefined, {name: "speakerText"}); 
    speakerText.text = "Remove Speaker Text"; 
    speakerText.onClick = function() {
    if (list != null) {
        speakerTextFunction();
        populateList();
    }
};

var crossbarI = settingsTab.add("checkbox", undefined, undefined, {name: "crossbarI"}); 
    crossbarI.text = "Replace Crossbar I"; 
    crossbarI.onClick = function() {
    if (list != null) {
        crossbarIFunction();
        populateList();
    }
};

var ellipses = settingsTab.add("checkbox", undefined, undefined, {name: "ellipses"}); 
    ellipses.text = "Replace Ellipses with Periods"; 
    ellipses.onClick = function() {
    if (list != null) {
        ellipsesFunction();
        populateList() ;
    }
};

var saveSettings = settingsTab.add("checkbox", undefined, undefined, {name: "saveSettings"}); 
    saveSettings.text = "Save Settings";

var loadLastScript = settingsTab.add("checkbox", undefined, undefined, {name: "loadLastScript"}); 
    loadLastScript.text = "Load Last Script"; 

loadOptions();

if (loadLastScript.value && lastScriptPath != null) {
    openScript();
    readScript();
    populateList();
    speakerTextFunction();
    crossbarIFunction();
    ellipsesFunction();
    populateList(); // Done again to also apply any of the above options if selected
}

dialog.show();

doc.addEventListener('afterSelectionChanged', selectionChanged);

function selectionChanged() {
    if (doc.selection[0] instanceof TextFrame && doc.selection[0].contents == '' && doc.selection[1] == null) {
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
    else if (scriptFile != "" && scriptFile != null) {
        list.removeAll();
        for (var i=0; i<script.length; i++) {
            list.add('item', script[i]);
        }
        if (newScript) {
            list.selection = 0;
        }
        else {
            list.selection = lastScriptIndex;
        }
    }
}

function readScript() {
    if (scriptFile != "" && scriptFile != null) {
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
}

function openScript() {
    var scriptFileOld = scriptFile;
    if (scriptFile == null && loadLastScript.value && lastScriptPath != null) {
        scriptFile = File(lastScriptPath);
        newScript = 0;
    }
    else {
        scriptFile = File.openDialog("Select your script text file");
        newScript = 1;
    }
    if (scriptFile != null) {
        scriptFileName = scriptFile.name; 
    }
    else if (scriptFileOld != null && scriptFile == null) {
        scriptFile = scriptFileOld;
    }
}

function resetOptions() {
    speakerText.value = 0;
    crossbarI.value = 0;
    ellipses.value = 0;

}

function loadOptions() {
    var optionsFile = new File(directory.toString() + "/lbsettings.txt");
    if (optionsFile.exists) {
        optionsFile.open("r");
        while (!optionsFile.eof) {
            var line = optionsFile.readln();
            var option = line.split("=");
            if (option[0] == "speakerText") {
                speakerText.value = (option[1] == "true");
            }
            if (option[0] == "crossbarI") {
                crossbarI.value = (option[1] == "true");
            }
            if (option[0] == "ellipses") {
                ellipses.value = (option[1] == "true");
            }
            if (option[0] == "saveSettings") {
                saveSettings.value = (option[1] == "true");
            }
            if (option[0] == "loadLastScript") {
                loadLastScript.value = (option[1] == "true");
            }
            if (option[0] == "lastScriptPath") {
                lastScriptPath = option[1];
            }
            if (option[0] == "scriptIndex") {
                lastScriptIndex = option[1];
            }
        }
    }
}

function saveOptions() {
    var optionsFile = new File(directory.toString() + "/lbsettings.txt");
    optionsFile.open("w");
    if (saveSettings.value) {
        optionsFile.writeln("speakerText=" + speakerText.value);
        optionsFile.writeln("crossbarI=" + crossbarI.value);
        optionsFile.writeln("ellipses=" + ellipses.value);
        optionsFile.writeln("saveSettings=" + saveSettings.value);
        optionsFile.writeln("loadLastScript=" + loadLastScript.value);
        if (loadLastScript.value) {
            if (list.selection != null) {
                optionsFile.writeln("scriptIndex=" + list.selection);
            }
            if (scriptFile != null) {
                optionsFile.writeln("lastScriptPath=" + scriptFile.toString());
            }
        }
    }
}

function speakerTextFunction() {
    if (speakerText.value) {
        var regex = /^\w+:\s?/
        for (var i=0; i<script.length; i++) {
            if (script[i].match(regex)) {
                script[i] = script[i].replace(regex, "");
            }
        }
    }
}

function crossbarIFunction() {
    if (crossbarI.value) {
        var regex = /\bI\B/
        for (var i=0; i<script.length; i++) {
            if (script[i].match(regex)) {
                script[i] = script[i].replace(regex, "i");
            }
        }
    }
}

function ellipsesFunction() {
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
}
