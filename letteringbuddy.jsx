#targetengine session;

var doc = app.activeDocument;
var script = []; // for storing script lines
var scriptFile = File.openDialog("Select your script text file");
var scriptFileName = scriptFile.name;

if (scriptFile != "" && scriptFile != null && scriptFileName.indexOf(".txt") !== -1) {
    scriptFile.open("r");
    var lines = scriptFile.read();
    var lineList = lines.split('\n');
    for (var i=0; i<lineList.length; i++) {
        var line = lineList[i];
        if (line != '') {
            script.push(line);
        }
    }

    var dialog = new Window('palette', 'Letterer Buddy');
    dialog.add('statictext', undefined, 'Script');
    var list = dialog.add('ListBox', [0, 0, 150, 150]);
    for (var i=0; i<script.length; i++) {
        list.add('item', script[i]);
    }
    list.selection = 0;
    dialog.show();

    doc.addEventListener('afterSelectionChanged', selectionChanged);

    function selectionChanged() {
        if (doc.selection[0] instanceof TextFrame && doc.selection[0].contents == '') {
            placeText();
        }
    }
}
else if (scriptFile != "" && scriptFile != null && scriptFileName.indexOf(".txt") == -1){
    alert("This file type is not supported. Please use .txt files only.");
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
