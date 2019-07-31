//////////
// Globals


var production=false;
var fixeddataset=true;
var fileid="";
var hostname="";
var dataurl="";

if(production && fixeddatset){
	fileid = "500";  // PUMS n=2000 subset on Dataverse-demo
} 

if(production && fileid=="") {
    alert("Error: No fileid has been provided.");
    throw new Error("Error: No fileid has been provided.");
}

if (!hostname && !production) {
       hostname="localhost:8080";
} else if (!hostname && production) {
    hostname="dataverse-demo.iq.harvard.edu"; //this will change when/if the production host changes
}

if (fileid && !dataurl) {
    // file id supplied; we are going to assume that we are dealing with
    // a dataverse and cook a standard dataverse data access url,
    // with the fileid supplied and the hostname we have
    // either supplied or configured:
    dataurl = "https://"+hostname+"/api/access/datafile/"+fileid;
    dataurl = dataurl+"?key="+apikey;
    // (it is also possible to supply dataurl to the script directly, 
    // as an argument -- L.A.)
}

if (!production) {
	// base URL for the R apps:
    var rappURL = "http://0.0.0.0:8000/custom/";
} else {
    var rappURL = "https://dataverse-demo.iq.harvard.edu/custom/"; //this will change when/if the production host changes
}


var metadataurl = "";
var ddiurl = "";
//BLOCK NEXT LINE IF WANT TO ACTIVATE TOGGLE
document.getElementById('accType').style.display = 'none';


// read DDI metadata with d3:
if (ddiurl) {
    // a complete ddiurl is supplied:
    metadataurl=ddiurl;
} else if (fileid) {
    // file id supplied; we're going to cook a standard dataverse
    // metadata url, with the file id provided and the hostname
    // supplied or configured:
    metadataurl="https://"+hostname+"/api/meta/datafile/"+fileid;
} else {
    // neither a full ddi url, nor file id supplied; use one of the sample DDIs that come with
    // the app, in the data directory:
    metadataurl="../../data/pumsmeta.xml"; // This is PUMS example metadata file
}



function requiredFieldValidator(value) {
    if (value == null || value == undefined || !value.length) {
      return {valid: false, msg: "This is a required field"};
    } else {
      return {valid: true, msg: null};
    }
  }


function formatter(row, cell, value, columnDef, dataContext){
	if(!value){
		return "";
	}
	else{
		var truncated = parseFloat(value).toPrecision(3);		
		return	truncated.toString()
	}
}

function deleteRow(row){
	var warning = false;
	if(data.length === 1){
	 	alert("Cannot delete a single unfinished row");
	 	warning = true;
	 }
	 
	else if(!isCompleteTable(data) && CompleteRow(row)){
	    alert("Cannot delete row while an incomplete row exists. Complete it or delete it.");
	 	warning = true;
	 }
	
	else {
		var output = getHolds(data);
		var numHolds = output.holds.length;
		var nonHolds = output.nonHolds;
		var numRows = data.length - 1
			
		if(numRows === numHolds){
			alert("Cannot delete row when all variables are held");
			warning = true;
		}
		//If deleting only unheld row:
		if(numRows === numHolds+1 && nonHolds[0] === parseInt(row)){
			alert("Cannot delete the only unheld row");
			warning = true;
		}
	}
		
	
if(!warning){
	data.splice(row, 1);
	grid.setData(data);
	grid.updateRowCount();
	grid.render();
	VarList.splice(row,1);
	
	var df = data;
	var x = 0; 
	var y = 0; 
    var btn="rowDeleted";
    var globals=getGlobalParameters();
    talktoR(btn, df, x, y, globals);
  }
}

function deleteFormatter(row,cell,value,columnDef,dataContext){
	var button = "<button class= 'del' type='button' title='Delete row' id='"+ row +"' onClick='deleteRow(id)' >X</button>" 
    return button;
}

function AddNewRow() {
	grid.getData().splice(grid.getDataLength(), 1, {});
	grid.invalidateRow(grid.getSelectedRows());
	grid.updateRowCount();
	grid.render();
}

function CompleteRow(row){
	//check if row being edited is completed (and therefore 
	// we should get accuracy values)
	complete = false 
	d = data[row]
	
    if(d.Variable && d.Statistic){
		stat = d.Statistic	
 
		if(stat === "Mean" && d.UpperBound && d.LowerBound){
			complete = true
		}
		if(stat === "Quantile" && d.UpperBound && d.LowerBound && d.Granularity){
			complete = true
		}
		if(stat === "CDF" && d.UpperBound && d.LowerBound && d.Granularity){
			complete = true
		}
		if(stat === "Histogram" && d.Numberofbins){
			complete = true
		}
    }

	return complete;
}

function isCompleteTable(df){
	for(i=0; i<df.length; i++){
		if(df[i].Variable && !CompleteRow(i)){
			return(false);
		}
	}	
	return(true);
}

function getHolds(df){
	holds = [];
	nonHolds = [];
	for(i=0; i<df.length; i++){
		val = df[i].Hold
		if(val === true){
			holds.push(i);
		}
		else{
			if(df[i].Variable){
				nonHolds.push(i);
			}
		}
	}
	return({holds:holds, nonHolds:nonHolds});
}

function talktoR(btn, df, x, y, globals) {

  //package the output as JSON
  var estimated=false;
  var base = rappURL;
  
  // If hold was pressed, no need to send to R
  if(btn === "Hold"){
   	return;
  }


  isComplete = isCompleteTable(df);
 
  if(!isComplete){
  	alert("Action is invalid while incomplete row exists. Complete it or delete it.");
  	if(x === 0){
		resetGlobals(prevGlobals);	
		}
		else{
			undo();
		}
  }
  else{
  function estimateSuccess(btn,json) {
    allResults.push(json);
    console.log("json in: ", json);
    estimated=true;
    
	if(json["error"][0] ==="T"){
		alert(json["message"]);
		//if globals were edited
		if(x === 0){
			resetGlobals(prevGlobals);
		}
		else{
			undo();
		}
	}
		
	else{
		prevGlobals = getGlobalParameters()
		json = json["prd"];
		var n = getGlobalParameters()["n"];
		var accType = document.getElementById("accType").value;
		
		for(i=0; i < json.length; i++){ 
		  if(accType === "Absolute"){
		 	 newAcc = parseFloat(json[i].Accuracy)*n;
		 	 }
		  else{
		  	 newAcc = parseFloat(json[i].Accuracy);
		  }
		  newEps = parseFloat(json[i].Epsilon);
		  
		  //if(data[i].Hold !==true){
			data[i].Accuracy =newAcc.toString();
		 // }
		  data[i].Epsilon = newEps.toString();
		  grid.updateRow(i);
		}
	
		if(data[grid.getDataLength() - 1].Accuracy){
		  //last row has no acc value, make new row
		  AddNewRow()
		}
    }
  }
   

  function statisticsSuccess(btn,json) {  
  //Must do something else here if submit happened
    // SOMEWHEREHERE.push(json);
    console.log("json in: ", json);
  }


  function estimateFail(btn) {
    estimated=true;
  }

  if(document.getElementById("accType").value === "Absolute"){
  		var n = getGlobalParameters()["n"];
		for(i=0; i<data.length; i++){
			data[i].Accuracy = data[i].Accuracy/n
		}	
	}
  if(btn === "submit"){
    //check completeness here too
  	// if secrecy of the sample is active, provide boosted privacy parameters
  	if(secSamp){
  		globals["eps"] = document.getElementById("funcEp").value; 
  		var big_n = document.getElementById("secSamp").value; 
  		var n = globals["n"];
  		globals["del"] = globals["del"]*(big_n/n)
  	}
  	var jsonout = JSON.stringify({ df: df, fileid: fileid, globals: globals});  // Make this a local reference eventually
    urlcall = base+"privateStatistics.app";
    console.log("urlcall out: ", urlcall);
  
    makeCorsRequest(urlcall,btn, statisticsSuccess, estimateFail, jsonout);
  }

  else{
  	if(secSamp){
  		globals["eps"] = document.getElementById("funcEp").value; 
  		var big_n = document.getElementById("secSamp").value; 
  		var n = globals["n"];
  		globals["del"] = globals["del"]*(big_n/n)
  	}
  	var jsonout = JSON.stringify({ df: df, x: x, y: y, btn:btn, globals:globals});
  	console.log(jsonout)
    urlcall = base+"privateAccuracies.app`";
    console.log("urlcall out: ", urlcall);
    allResults = [];
    makeCorsRequest(urlcall,btn, estimateSuccess, estimateFail, jsonout);
  }
 } 
}


// below from http://www.html5rocks.com/en/tutorials/cors/ for cross-origin resource sharing
// Create the XHR object.
function createCORSRequest(method, url, callback) {
    var xhr = new XMLHttpRequest();
    if ("withCredentials" in xhr) {
        // XHR for Chrome/Firefox/Opera/Safari.
        xhr.open(method, url, true);
    } else if (typeof XDomainRequest != "undefined") {
        // XDomainRequest for IE.
        xhr = new XDomainRequest();
        xhr.open(method, url);
    } else {
        // CORS not supported.
        xhr = null;
    }
    return xhr;  
}


// Make the actual CORS request.
function makeCorsRequest(url,btn,callback, warningcallback, json) {
    var xhr = createCORSRequest('POST', url);
    if (!xhr) {
        alert('CORS not supported');
        return;
    }
    // Response handlers for asynchronous load
    // onload or onreadystatechange?
    
    xhr.onload = function() {
        
      var text = xhr.responseText;
      console.log("text ", text);
      var json = JSON.parse(text);   // should wrap in try / catch
      var names = Object.keys(json);

      if (names[0] == "warning"){
        warningcallback(btn);
        alert("Warning: " + json.warning);
      }else{
        callback(btn, json);
      }
    };
    xhr.onerror = function() {
        // note: xhr.readystate should be 4, and status should be 200.  a status of 0 occurs when the url becomes too large
        if(xhr.status==0) {
            alert('xmlhttprequest status is 0. local server limitation?  url too long?');
        }
        else if(xhr.readyState!=4) {
            alert('xmlhttprequest readystate is not 4.');
        }
        else {
            alert('Woops, there was an error making the request.');
        }
        console.log(xhr);
    };
    console.log("sending")
    console.log(json);
    xhr.send("tableJSON="+json);   
}

function getGlobalParameters(){
	var epsval=document.getElementById("epsilonbox").value;
	var delval=document.getElementById("deltabox").value;
	var betaval=document.getElementById("betabox").value;
	var nval = 1223992 //Need to get this from metadata too 
	var globals={eps:epsval, del:delval, beta:betaval, n:nval};
	return globals;
	
}
var prevGlobals = getGlobalParameters();
function resetGlobals(prevGlobals){
	document.getElementById("epsilonbox").value = prevGlobals.eps
	if(secSamp){
		var big_n = document.getElementById("secSamp").value;
		var n = getGlobalParameters()["n"];
		var eps = getGlobalParameters()["eps"];
		document.getElementById("funcEp").value = Math.log((Math.exp(eps)-1)*(big_n/n)+1);
	}
	document.getElementById("deltabox").value = prevGlobals.del
	document.getElementById("betabox").value = prevGlobals.beta
}
function epsChange(){
	var btn = "epsChange";
	var df = data;
	var x = 0;
	var y= 0;
	var globals=getGlobalParameters();
	if(secSamp){
		var big_n = document.getElementById("secSamp").value;
		var n = getGlobalParameters()["n"];
		var eps = getGlobalParameters()["eps"];
		document.getElementById("funcEp").value = Math.log((Math.exp(eps)-1)*(big_n/n)+1);
	}
	talktoR(btn, df, x, y, globals);
}
function deltaChange(){
	var btn = "deltaChange";
	var df = data;
	var x = 0;
	var y= 0;
	var globals=getGlobalParameters();
	talktoR(btn, df, x, y, globals);
}
function betaChange(){
	var btn = "betaChange";
	var df = data;
	var x = 0;
	var y= 0;
	var globals=getGlobalParameters();
	talktoR(btn, df, x, y, globals);
}

function accTypeChange(){
	var toggle = {"Relative":"Absolute", "Absolute":"Relative"};
	var accType = document.getElementById("accType").value;
	var newType = toggle[accType];
	document.getElementById("accType").value = newType;
	var n = getGlobalParameters()["n"];
	for(i=0; i<data.length; i++){
		if(newType === "Relative"){
			data[i].Accuracy = data[i].Accuracy/n
		}
		else{
			data[i].Accuracy = data[i].Accuracy*n
		}
		grid.updateRow(i);
	}
	grid.render();
}

function secSampChange(){
	var big_n = document.getElementById("secSamp").value;
	var n = getGlobalParameters()["n"];
	if(isNaN(big_n) && big_n <= n){
		alert("Global population must be a number larger than your sample");
		document.getElementById("secSamp").value = "";
		document.getElementById("funcEp").value = "";
		secSamp = false;
	}
	else{
		var eps = document.getElementById("epsilonbox").value;
		console.log(typeof eps)
		console.log(typeof n)
		console.log(typeof big_n)
		console.log(Math.exp(eps))
		var funcEp = Math.log((Math.exp(eps)-1)*(big_n/n)+1);
		var funcDel = document.getElementById("deltabox").value*(big_n/n)
		document.getElementById("funcEp").value = funcEp;
		secSamp = true;	
		var btn = "secChange";
		var df = data;
		var x = 0;
		var y= 0;
		var globals=getGlobalParameters();
		talktoR(btn, df, x, y, globals);
	}
}

function submit(){

	var btn = "submit";
	var df = data;
	var x = 0;
	var y= 0;
	var globals=getGlobalParameters();
	talktoR(btn, df, x, y, globals);
}

//enable undo 2/24/15
var commandQueue = [];

function queueAndExecuteCommand(item, column, editCommand) {
	commandQueue.push(editCommand);
	editCommand.execute();
}

function undo() {
	var command = commandQueue.pop();
	if (command && Slick.GlobalEditorLock.cancelCurrentEdit()) {
		command.undo();
		grid.gotoCell(command.row, command.cell, false);
	}
}

///////////
  var grid;
  var allResults = [];
  var secSamp = false;
  var data = [];
  var VarList =[];
  d3.xml(metadataurl, "application/xml", function(xml) {
    var vars = xml.documentElement.getElementsByTagName("var");
    var Variables = [];
    var type;
    var typeMap = {};
    
    for(var j =0; j < vars.length; j++ ) {
      Variables.push(vars[j].getAttribute('name').replace(/"/g,""));    // regular expression removes all quotes -- might need to adjust
   	  type = vars[j].getAttribute('intrvl').replace(/"/g,"");    // regular expression removes all quotes -- might need to adjust
   	  if(type === "discrete"){
   	  	type = "Categorical";
   	  }
   	  if(type === "contin"){
   	  	type = "Numerical";
   	  }
   	  typeMap[Variables[j]] = type
    }
    //for demo only
    typeMap[Variables[3]]="Numerical";
    
    // dataset name trimmed to 12 chars
    var temp = xml.documentElement.getElementsByTagName("fileName");
    var dataname = temp[0].childNodes[0].nodeValue.replace( /\.(.*)/, "") ;  // regular expression to drop any file extension 
    console.log("metadata query output");
    console.log(Variables);
    console.log(dataname);
    console.log(typeMap)
    // Put dataset name, from meta-data, into header
    d3.select("#datasetName").selectAll("h2")
    .html(dataname);

  var columns = [
    {id: "delCol", name: "", field: "del", width: 40, minWidth:40, maxWidth: 40, formatter:deleteFormatter},
    {id: "Variable", name: "Variable", field: "Variable", width: 100, minWidth: 100, maxWidth:100, validator: requiredFieldValidator, options: Variables, toolTip:"Variable from the dataset on which to compute a statistic.", editor: Slick.Editors.SelectOption},
    {id: "Type", name: "Type", field: "Type", width: 100, minWidth:100, maxWidth: 100, options:["Numerical","Categorical", "Boolean"], toolTip:"Select numerical if data are numbers (e.g. age), categorical if data fall into distinct groups (e.g. multiple choice questions), and boolean if data only fall into two groups (e.g. yes or no questions).", editor: Slick.Editors.SelectOption},
    {id: "Statistic", name: "Statistic", width: 100, minWidth: 100, maxWidth: 100, field:"Statistic", options:["Mean","Quantile","Histogram","CDF"], toolTip: "Statistic to compute on variable. Selecting quantiles computes the entire cumulative distribution function. Histograms cannot be computed on numerical data and mean/quantile cannot be computed on categorical/boolean data.", editor: Slick.Editors.SelectOption},
    {id: "UpperBound", name: "Upper \nBound", field: "UpperBound", width: 80, minWidth: 80, maxWidth: 80, toolTip: "Estimate of the maximum value of this variable. If the reported upper bound is smaller than the true upper bound, data will be truncated to fit the reported value.", editor: Slick.Editors.Text},
    {id: "LowerBound", name: "Lower \nBound", field: "LowerBound", width: 80, minWidth: 80, maxWidth: 80, toolTip: "Estimate of the minimum value of this variable. If the reported lower bound is larger than the true lower bound, data will be truncated to fit the reported value.", editor: Slick.Editors.Text},
    {id: "Granularity", name: "Granularity", field: "Granularity", width: 80, minWidth: 80, maxWidth: 80, toolTip:"Estimate the minimum distance between any two values of this variable (e.g. age granularity = 1 year, income granularity = 100 dollars). The reported granularity dictates the distance between two points in the cumulative distribution function.", editor: Slick.Editors.Text},
    {id: "Numberofbins", name: "Number \nof bins", field: "Numberofbins", width: 80, minWidth: 80, maxWidth: 80, toolTip: "Estimate the number of distinct categories a categorical variable can take on. (e.g. Marriage Status = 2, U.S. State = 50).", editor: Slick.Editors.Text},
    {id: "Epsilon", name: "Epsilon", field: "Epsilon", width: 80, minWidth: 80, maxWidth: 80, toolTip:"Privacy parameter currently allocated to this statistic. Can only be changed by altering accuracy values.",formatter:formatter},
    {id: "Accuracy", name: "Accuracy", field: "Accuracy", width: 100, minWidth:100, maxWidth: 100, editor: Slick.Editors.Text, toolTip: "Worst case error guaranteed with probability of 1-Beta (see global privacy parameters).",formatter:formatter},
    {id: "Hold", name: "Hold", width: 50, minWidth: 50, maxWidth: 50, cssClass: "cell-effort-driven", field: "Hold", formatter: Slick.Formatters.Checkmark, toolTip:"Fixes epsilon and accuracy at their current values.",editor: Slick.Editors.Checkbox},
  ]; 
  
  var options = {
    editable: true,
    enableAddRow: false, 
    enableColumnReorder: false,
    enableCellNavigation: true,
    cellHighlightCssClass: "changed", 
    asyncEditorLoading: false,
    autoEdit: false,
    editCommandHandler: queueAndExecuteCommand
  };


//My data
  $(function () {
      
	  var d = (data[0] = {});  
	  d["Variable"] = "";
	  d["Type"] = "";
	  d["Statistic"] = "";
	  d["UpperBound"] = "";
	  d["LowerBound"] = "";
	  d["Granularity"] =""; 
	  d["Numberofbins"] = "";
   	  d["Epsilon"] = "";
	  d["Accuracy"] = "";
      d["Hold"]; 

    
    grid = new Slick.Grid("#myGrid", data, columns, options);
    grid.setSelectionModel(new Slick.RowSelectionModel({selectActiveRow: true}));


    grid.onAddNewRow.subscribe(function (e, args) {
      var item = args.item;
      grid.invalidateRow(data.length);
      data.push(item);
      grid.updateRowCount();
      grid.render();
    });
    
var prev_row;
var prev_data;
var current_col;
////////////////////////////////////////////////////////////////////////////////
grid.onCellChange.subscribe(function (e, args){
 	var row = grid.getSelectedRows()[0];
	d = data[row]
	
	if(d.Variable){
		 att = d.Variable
		 VarList[row] = att
		 if(!d.Type){
			d.Type = typeMap[att]
		 }
   if(d.Type === "Categorical"){ 
		d.Statistic = "Histogram"
	}
   
   
   if(d.Type === "Boolean"){
		d.Statistic = "Histogram"
		d.Numberofbins = 2
   }
	
}
	ind = VarList.indexOf(d.Variable)
	/*
	if(ind !== -1 && ind !== row){
		if(d.Statistic === data[ind].Statistic){
			alert("Cannot compute same statistic twice.")
			//undo();
			return;
		}
	}*/ 
   if(d.Statistic === "Mean"){
		if(d.UpperBound === "na"){
			d.UpperBound = ""
		}
		if(d.LowerBound === "na"){
			d.LowerBound = ""
			}
		
		if(ind !== -1 && ind !== row){
			autoUp = data[ind].UpperBound 
			autoLo = data[ind].LowerBound 
			
			if(!d.UpperBound  && autoUp !== "na"){
				d.UpperBound = autoUp
			}
			if(!d.LowerBound  && autoLo !== "na"){
				d.LowerBound = autoLo
			}
		}
		d.Granularity = "na"
		d.Numberofbins  = "na" 		
   }
   
   if(d.Statistic === "Quantile"){
		if(d.UpperBound === "na"){
			d.UpperBound = ""
		}
		if(d.LowerBound === "na"){
			d.LowerBound = ""
			}
		if(d.Granularity === "na"){
			d.Granularity = ""
		}
		
		if(ind !== -1 && ind !== row){
			//check if stat is already in the grid
			
			autoUp = data[ind].UpperBound 
			autoLo = data[ind].LowerBound 
			autoGran = data[ind].Granularity
			
			if(!d.UpperBound  && autoUp !== "na"){
				d.UpperBound = autoUp
			}
			if(!d.LowerBound  && autoLo !== "na"){
				d.LowerBound = autoLo
			}
			if(!d.Granularity  && autoGran !== "na"){
				d.Granularity = autoGran
			}
		}
		d.Numberofbins  = "na" 		
   }
    if(d.Statistic === "CDF"){
		if(d.UpperBound === "na"){
			d.UpperBound = ""
		}
		if(d.LowerBound === "na"){
			d.LowerBound = ""
			}
		if(d.Granularity === "na"){
			d.Granularity = ""
		}
		
		if(ind !== -1 && ind !== row){
			//check if stat is already in the grid
			
			autoUp = data[ind].UpperBound 
			autoLo = data[ind].LowerBound 
			autoGran = data[ind].Granularity
			
			if(!d.UpperBound  && autoUp !== "na"){
				d.UpperBound = autoUp
			}
			if(!d.LowerBound  && autoLo !== "na"){
				d.LowerBound = autoLo
			}
			if(!d.Granularity  && autoGran !== "na"){
				d.Granularity = autoGran
			}
		}
		d.Numberofbins  = "na" 		
   }
   if(d.Statistic === "Histogram"){
		if(d.Numberofbins === "na"){
			d.Numberofbins = ""
		}
		if(ind !== -1 && ind !== row){
			autoBins = data[ind].Numberofbins
			if(!d.Numberofbins  && autoBins !== "na"){
				d.Numberofbins= autoBins
			}
		}
			
		d.UpperBound = "na"
		d.LowerBound = "na"
		d.Granularity = "na"		
   }


   if(CompleteRow(row) === true){
		//MAKE FLASK CALL
	
		df = data;
		x = row+1;
		//console.log(args)
		//y = current_col;
		y = args.cell
		var btn; 
		//console.log(grid.getColumns()[current_col].id)
		console.log(grid.getColumns()[y].id)
		
		//if(grid.getColumns()[current_col].id === "Accuracy"){
		if(grid.getColumns()[y].id === "Accuracy"){
			 btn = "Accuracy";
		}
	//	else if(grid.getColumns()[current_col].id === "Hold"){
	else if(grid.getColumns()[y].id === "Hold"){
			 btn = "Hold";
		}
		else{
			 btn=1;
		}
		var globals=getGlobalParameters();
		talktoR(btn, df, x, y, globals);

   }

   grid.updateRow(row);
   e.stopPropagation();	
  
 });

   grid.onBeforeEditCell.subscribe(function(e,args) {
   
   		cell = args.cell
   		row = args.row
   		rowComplete = CompleteRow(row)
   		if(!data[row].Variable && grid.getColumns()[cell].id !== "Variable"){
   			return false;
   			}
   		if(!data[row].Statistic && grid.getColumns()[cell].id !== "Statistic" && grid.getColumns()[cell].id !== "Variable"){
   			return false;
   			}
   		if(grid.getColumns()[cell].id === "Accuracy" && !data[row].Accuracy){
   			return false;
   			} 
   		if(grid.getColumns()[cell].id === "Hold" && !rowComplete){
   			return false;
   			} 
   		if(!isCompleteTable(data) && rowComplete){
   			alert("Cannot edit while an incomplete row exists. Delete it or complete it.")
   			return false;
   		}
   
   });
   
      grid.onClick.subscribe(function (e) {
     
      var cell = grid.getCellFromEvent(e);
      row = cell.row;
      current_col = cell.cell
    if (grid.getColumns()[cell.cell].id === "Type") {
	if (!grid.getEditorLock().commitCurrentEdit()) {
	return;
	}
}
	      
    });
  });
});
   