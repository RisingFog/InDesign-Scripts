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
    list.preferredSize.height = 200; 

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
    settingsTab.spacing = 0; 
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

var trimPeriods = settingsTab.add("checkbox", undefined, undefined, {name: "trimPeriods"}); 
    trimPeriods.text = "Trim ...+ to ..."; 
    trimPeriods.onClick = function() {
    if (list != null) {
        trimPeriodsFunction();
        populateList() ;
    }
};

var removeJP = settingsTab.add("checkbox", undefined, undefined, {name: "removeJP"}); 
    removeJP.text = "Remove JP Characters"; 
    removeJP.onClick = function() {
    if (list != null) {
        removeJPFunction();
        populateList() ;
    }
};

var replaceSplit = settingsTab.add("checkbox", undefined, undefined, {name: "replaceSplit"}); 
    replaceSplit.text = "Replace Bubble Separator with New Line"; 
    replaceSplit.onClick = function() {
    if (list != null) {
        replaceSplitFunction();
        populateList() ;
    }
};

var splitText = settingsTab.add('edittext {properties: {name: "splitText"}}'); 
    splitText.text = "//"; 

var removePageNumbers = settingsTab.add("checkbox", undefined, undefined, {name: "removePageNumbers"}); 
    removePageNumbers.text = "Remove Page Numbers"; 
    removePageNumbers.onClick = function() {
    if (list != null) {
        removePageNumbersFunction();
        populateList() ;
    }
};

var removeParentheticalText = settingsTab.add("checkbox", undefined, undefined, {name: "removeParentheticalText"}); 
    removeParentheticalText.text = "Remove Parathentical Text"; 
    removeParentheticalText.onClick = function() {
    if (list != null) {
        removeParentheticalTextFunction();
        populateList() ;
    }
};

var removeBracketedText = settingsTab.add("checkbox", undefined, undefined, {name: "removeBracketedText"}); 
    removeBracketedText.text = "Remove Bracketed Text"; 
    removeBracketedText.onClick = function() {
    if (list != null) {
        removeBracketedTextFunction();
        populateList() ;
    }
};

var removeCurlyBracedText = settingsTab.add("checkbox", undefined, undefined, {name: "removeCurlyBracedText"}); 
    removeCurlyBracedText.text = "Remove Curly Braced Text"; 
    removeCurlyBracedText.onClick = function() {
    if (list != null) {
        removeCurlyBracedTextFunction();
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
    speakerTextFunction();
    crossbarIFunction();
    ellipsesFunction();
    trimPeriodsFunction();
    removeJPFunction();
    replaceSplitFunction();
    removePageNumbersFunction();
    removeParentheticalTextFunction();
    removeBracketedTextFunction();
    removeCurlyBracedTextFunction();
    populateList();
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
    trimPeriods.value = 0;
    removeJP.value = 0;
    replaceSplit.value = 0;
    removePageNumbers.value = 0;
    removeParentheticalText.value = 0;
    removeBracketedText.value = 0;
    removeCurlyBracedText.value = 0;
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
            if (option[0] == "trimPeriods") {
                trimPeriods.value = (option[1] == "true");
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
            if (option[0] == "removeJP") {
                removeJP.value = (option[1] == "true");
            }
            if (option[0] == "replaceSplit") {
                replaceSplit.value = (option[1] == "true");
            }
            if (option[0] == "splitText") {
                splitText.text = option[1];
            }
            if (option[0] == "removePageNumbers") {
                removePageNumbers.value = (option[1] == "true");
            }
            if (option[0] == "removeParentheticalText") {
                removeParentheticalText.value = (option[1] == "true");
            }
            if (option[0] == "removeBracketedText") {
                removeBracketedText.value = (option[1] == "true");
            }
            if (option[0] == "removeCurlyBracedText") {
                removeCurlyBracedText.value = (option[1] == "true");
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
        optionsFile.writeln("trimPeriods=" + trimPeriods.value);
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
        optionsFile.writeln("removeJP=" + removeJP.value);
        optionsFile.writeln("replaceSplit=" + replaceSplit.value);
        optionsFile.writeln("splitText=" + splitText.text);
        optionsFile.writeln("removePageNumbers=" + removePageNumbers.value);
        optionsFile.writeln("removeParentheticalText=" + removeParentheticalText.value);
        optionsFile.writeln("removeBracketedText=" + removeBracketedText.value);
        optionsFile.writeln("removeCurlyBracedText=" + removeCurlyBracedText.value);
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
        var regex = /\bI\B/g
        for (var i=0; i<script.length; i++) {
            if (script[i].match(regex)) {
                script[i] = script[i].replace(regex, "i");
            }
        }
        regex = /\bI-i\B/g
        for (var i=0; i<script.length; i++) {
            if (script[i].match(regex)) {
                script[i] = script[i].replace(regex, "i-i");
            }
        }
        regex = /\bI—i\B/g
        for (var i=0; i<script.length; i++) {
            if (script[i].match(regex)) {
                script[i] = script[i].replace(regex, "i-i");
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

function trimPeriodsFunction() {
    if (trimPeriods.value == 1) {
        var regex = /\.{3,}/
        for (var i=0; i<list.items.length; i++) {
            if (script[i].match(regex)) {
                script[i] = script[i].replace(regex, "...");
            }
        }
    }
}

function removeJPFunction() {
    if (removeJP.value) {
        var regex = /[\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\uff00-\uff9f\u4e00-\u9faf\u3400-\u4dbf]/g
        for (var i=0; i<script.length; i++) {
            if (script[i].match(regex)) {
                script[i] = trim(script[i].replace(regex, ""));
            }
        }
        script = removeEmptyLines(script);
    }
}

function replaceSplitFunction() {
    if (replaceSplit.value) {
        var regex = RegExp(splitText.text);
        for (var i=0; i<script.length; i++) {
            if (script[i].match(regex)) {
                var lines = script[i].split(splitText.text);
                for (var j=0; j<lines.length; j++) {
                    if (j==0) {
                        script[i] = trim(lines[0]);
                    }
                    else {
                        script.splice(i + j, 0, trim(lines[j]));
                    }
                }
            }
        }
    }
}

function removePageNumbersFunction() {
    if (removePageNumbers.value) {
        var regex = /([0-9]+)\.(\h*)/
        for (var i=0; i<script.length; i++) {
            if (script[i].match(regex)) {
                script[i] = script[i].replace(regex, "");
            }
        }
        script = removeEmptyLines(script);
    }
}

function removeParentheticalTextFunction() {
    if (removeParentheticalText.value) {
        var regex = /\(.*\)/
        for (var i=0; i<script.length; i++) {
            if (script[i].match(regex)) {
                script[i] = script[i].replace(regex, "");
            }
        }
        script = removeEmptyLines(script);
    }
}

function removeBracketedTextFunction() {
    if (removeBracketedText.value) {
        var regex = /\[.*\]/
        for (var i=0; i<script.length; i++) {
            if (script[i].match(regex)) {
                script[i] = script[i].replace(regex, "");
            }
        }
        script = removeEmptyLines(script);
    }
}

function removeCurlyBracedTextFunction() {
    if (removeCurlyBracedText.value) {
        var regex = /\{.*\}/
        for (var i=0; i<script.length; i++) {
            if (script[i].match(regex)) {
                script[i] = script[i].replace(regex, "");
            }
        }
        script = removeEmptyLines(script);
    }
}

function trim(strValue){
    var str = new String(strValue);
    return strValue !== null ? str.replace(/(^\s*)|(\s*$)/g,"") : "";
}

function removeEmptyLines(array) {
    var newArray = [];
    for (var i=0; i<array.length; i++) {
        if (array[i] != '') {
            newArray.push(array[i]);
        }
    }
    return newArray;
}
