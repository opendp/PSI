// to do:
//wipe out epsilon + accuracy for unchecked stats (done line 364)
// fd + fe should be sent when they are available
// add clear button for secrecy sample
// population size/database size (secrecy of sample/global variable * e or * d (w/ ss> n))
// don't send an empty
// multivariate analysis

// tell the thing the action is "accuracy change"
// change fe and fd when e and d are changed.

// checkbox, paragraph, text string, drop down


// JSON data of r-libraries and functions (Fanny's work will provide these)
var JSON_file = '{"rfunctions":[' +
    '{"statistic": "Mean", "stat_info": "Release the arithmetic mean of the chosen variable", "statistic_type": [{"stype": "Numerical", "parameter": ["Lower Bound", "Upper Bound"]}, {"stype": "Boolean", "parameter": []}]},' +
    '{"statistic": "Histogram", "stat_info": "Release counts of the categories represented in the chosen variable", "statistic_type": [{"stype": "Numerical", "parameter": ["Lower Bound", "Upper Bound", "Number of Bins"]}, {"stype": "Categorical", "parameter": ["Bin Names"],"all_metadata_optional":"True"}]},' +
     //'{"statistic": "Causal Inference", "stat_info": "Inferences", "statistic_type": [{"stype": "Numerical", "parameter": ["Lower Bound", "Upper Bound", "Treatment Variable"]}, {"stype": "Boolean", "parameter": ["Treatment Variable"]}]},' +
     '{"statistic": "OLS Regression", "stat_info": "Release an ordinary least squares regression on the group of variables", "statistic_type": [{"stype": "Multivar", "parameter": ["Regression"]}], "type_params_dict": {"General":["Outcome Variable"],"Numerical":["Lower Bound", "Upper Bound", "Correlation"],"Categorical":["Lower Bound", "Upper Bound"],"Boolean":[]},"requirements":["outcome_non_categorical"]},' +
     '{"statistic": "Logistic Regression", "stat_info": "Release a logistic regression on the group of variables", "statistic_type": [{"stype": "Multivar", "parameter": ["Regression"]}], "type_params_dict": {"General":["Outcome Variable"],"Numerical":["Lower Bound", "Upper Bound", "Correlation"],"Categorical":["Lower Bound", "Upper Bound"],"Boolean":[]},"requirements":["outcome_boolean"]},' +
     '{"statistic": "Probit Regression", "stat_info": "Release a probit regression on the group of variables", "statistic_type": [{"stype": "Multivar", "parameter": ["Regression"]}], "type_params_dict": {"General":["Outcome Variable"],"Numerical":["Lower Bound", "Upper Bound", "Correlation"],"Categorical":["Lower Bound", "Upper Bound"],"Boolean":[]},"requirements":["outcome_boolean"]},' +
    '{"statistic": "ATT with Matching", "stat_info": "Computes the average treatment effect on the treated with the option to first match the dataset", "statistic_type": [{"stype": "Multivar", "parameter": ["ATT"]}], "type_params_dict": {"General":["Outcome Variable", "Treatment Variable", "Matching Multiplier"],"Numerical":["Coarsening"],"Categorical":[],"Boolean":[]},"requirements":["outcome_boolean","two_booleans","three_vars"]},' +
     //'{"statistic": "Difference of Means", "stat_info": "Release a difference of means on the chosen variables", "statistic_type": [{"stype": "Multivar", "parameter": ["Outcome Variable", "Lower Bound", "Upper Bound"]}], "requirements":[]},' +
    '{"statistic": "Quantile", "stat_info": "Release a cumulative distribution function at the given level of granularity (can extract median, percentiles, quartiles, etc from this).", "statistic_type": [{"stype": "Numerical", "parameter": ["Lower Bound", "Upper Bound", "Number of Bins"]}]} ],' +
    '"type_label": [ {"stype": "Numerical", "type_info": "Data should be treated as numbers"}, {"stype": "Boolean", "type_info": "Data contains two possible categories"}, {"stype": "Categorical", "type_info": "Datapoints should be treated as categories/bins"} ],' +
    '"parameter_info": [ {"parameter": "Lower Bound", "entry_type": "number", "pinfo": "Minimum value that the chosen variable can take on", "input_type": "text"}, {"parameter": "Upper Bound", "entry_type": "number", "pinfo": "Maximum value that the chosen variable can take on", "input_type": "text"}, {"parameter": "Number of Bins", "entry_type": "pos_integer", "pinfo": "Number of distinct categories the variable can take on", "input_type": "text"}, {"parameter": "Number of Bins", "entry_type": "pos_integer", "pinfo": "The minimum positive distance between two different records in the data", "input_type": "text"}, {"parameter": "Treatment Variable", "entry_type": "none", "pinfo": "Treatment variable in the model", "input_type": "multiple_choice_from_group_with_reqs"}, {"parameter": "Bin Names", "entry_type": "none", "pinfo": "Give the names of all the bins", "input_type": "text"}, {"parameter": "Outcome Variable", "entry_type": "none", "pinfo": "Outcome variable in the model", "input_type": "multiple_choice_from_group_with_reqs"}, {"parameter": "Coarsening", "entry_type": "pos_number", "pinfo": "Coarsening for coarsened exact matching", "input_type": "text"},{"parameter": "Matching Multiplier", "entry_type": "pos_int", "pinfo": "A positive integer indicating the structure of matched strata", "input_type": "text"}, {"parameter": "Correlation", "entry_type": "number", "pinfo": "Variable correlation for regression error guarantees", "input_type": "text"} ] }';

// Parses the function and varlist data structure
var rfunctions = JSON.parse(JSON_file);

// List of possible variables, including transforms
var variable_list = [];
// Maps the names of transform variables to their formulas (and other data? TODO).
// This works like a map but doesn't need ES6 compatibility.
var transforms_data = Object.create(null);


// Active and inactive variable list
var varlist_active = [];
var varlist_inactive = variable_list;

// Array that is to be passed to the R-servers
// Format: inputted_metadata[variable_name] = ['Variable_Type', 'Statistic1', 'Epsilon1', 'Accuracy1', 'Hold1', ... Repeats for all possible statistics ... All Possible Metadata];
var inputted_metadata = {};

// Memory of the previous table
var previous_inputted_metadata = {};

// Function epsilon, delta, and secrecy of the sample.
var global_size = 0;
var SS_value_past = "";

var varColor = '#f0f8ff';   //d3.rgb("aliceblue");
var selVarColor = '#fa8072';    //d3.rgb("salmon");

var released_statistics = "not yet built";

var testJSON = JSON.stringify({ test: 5});


// CSS when variable selected
var variable_selected_class =
    "color: black;" +
    "list-style: none;" +
    "padding: 5px;" +
    "margin: 5px 0;" +
    "background: #fa8072;"+
    "opacity:0.5;"+
    "text-align: center;";

// CSS when variable unselected
var variable_unselected_class =
    "color: black;" +
    "list-style: none;" +
    "padding: 5px;" +
    "margin: 5px 0;" +
    "background: #f0f8ff;"+
   // "opacity:0.5;"+
    "text-align: center;";


var urlparameters = getJsonFromUrl(location.href);

// toggle below for interactive query mode
// Should only be true when called with interactiveInterface.html
// var interactive = urlparameters['interactive'] === 'true';
var global_epsilon = 0.5;
var global_delta = 0.000001;
var global_beta = 0.05;
var fixed_epsilon = global_epsilon;
var reserved_epsilon = 0;
var reserved_delta = 0;
var global_sliderValue = 0;
var reserved_epsilon_toggle = false;
var batch_num = 1; //track what batch number interactive analyst is on.
var old_batch_tables = {};
// secrecy of sample/global variable * e or * d
//JM: changed functioning epsilon and delta to default to global eps and del
if(interactive){
	var global_fe = .1*global_epsilon; // functioning privacy parameters are batch parameters in IQ mode.
	var global_fd = .1*global_delta;
	document.getElementById("batcheval").textContent = global_fe.toFixed(4);
	document.getElementById("batchdval").textContent = global_fd.toExponential(4);
}
else{
	var global_fe = global_epsilon;
	var global_fd = global_delta;
}

//color and size of information buttons
var qmark_color = "#090533"; //old value: #FA8072
var qmark_size = "15px"; // old value: 12px

//tutorial mode globals
var tutorial_mode = true;
if(interactive){
	tutorial_mode = false;
	//todo make second tutorial for interactive
}
var first_edit_window_closed = true;
var first_variable_selected = true;
var first_type_selected = true;
var first_stat_selected = true;
var first_completed_statistic = true;
var first_reserved_epsilon = true;

// List of possible statisitics
var statistic_list = [];
for (var n = 0; n < rfunctions.rfunctions.length; n++) {
    statistic_list.push(rfunctions.rfunctions[n].statistic.replace(/\s/g, '_'));
};

var multivar_stat_list = [];
for (var n = 0; n < rfunctions.rfunctions.length; n++) {
   if(rfunctions.rfunctions[n].statistic_type[0].stype == "Multivar"){
   		multivar_stat_list.push(rfunctions.rfunctions[n].statistic.replace(/\s/g, '_'));
   }
};

// List of all types
var type_list = [];
for (var n = 0; n < rfunctions.type_label.length; n++) {
    type_list.push(rfunctions.type_label[n].stype);
};



// List of statistics per type and metadata required
for (var n = 0; n < type_list.length; n++) {
    var var_type = type_list[n];
    eval("var " + var_type.replace(/\s/g, '_') + "_stat_list = [];");
    eval("var " + var_type.replace(/\s/g, '_') + "_stat_parameter_list = [];");
    for (var m = 0; m < rfunctions.rfunctions.length; m++) {
        for (var l = 0; l < rfunctions.rfunctions[m].statistic_type.length; l++) {
            if (rfunctions.rfunctions[m].statistic_type[l].stype == var_type) {
                eval(var_type.replace(/\s/g, '_') + "_stat_list.push('" + rfunctions.rfunctions[m].statistic + "');");
                eval(var_type.replace(/\s/g, '_') + "_stat_parameter_list.push({'rfunctions_index': " + m + ", 'parameter_index': " + l + "});");
            }
            else {}
        };
    };
};

// List of all metadata
var metadata_list = [];
for (var n = 0; n < rfunctions.parameter_info.length; n++) {
    metadata_list.push(rfunctions.parameter_info[n].parameter.replace(/\s/g, '_'));
};






// Column index dictionary
// Format: inputted_metadata[variable_name] = ['Variable_Type', 'Statistic1', 'Epsilon1', 'Accuracy1', 'Hold1', ... Repeats for all possible statistics ... All Possible Metadata];
var column_index = {}
column_index["Variable_Type"] = 0;
for (var n = 0; n < statistic_list.length; n ++) {
    var m = 4 * n;
    var statistic_index = statistic_list[n].replace(/\s/g, '_');
    column_index[statistic_index] = m + 1;
    column_index["epsilon_" + statistic_index] = m + 2;
    column_index["accuracy_" + statistic_index] = m + 3;
    column_index["hold_" + statistic_index] = m + 4;
};
for (var n = 0; n < metadata_list.length; n++) {
    m = 4 * statistic_list.length + 1;
    column_index[metadata_list[n].replace(/\s/g, '_')] = m + n;
};
column_index_length = 1 + 4 * statistic_list.length + metadata_list.length;
// add missing data columns to column_index
column_index["Missing_Type"]=column_index_length;
column_index["Missing_Input"]=column_index_length+1;
column_index_length = column_index_length + 2;
if(interactive){
	column_index["Batch_Number"]=column_index_length+2;
	column_index_length = column_index_length + 3;
}


// Reverse column_index: http://stackoverflow.com/questions/1159277/array-flip-in-javascript
var index_column = {};
$.each(column_index, function(i, el) {
    index_column[el]=i;
});


console.log(variable_list);





//////////////
// Globals

var production = false;
var hostname = "";
var metadataurl = "";
var ddiurl = "";

var dataverse_available = false;  // When Dataverse repository goes down, or is otherwise unavailable, this is a quick override for searching for metadata by url.

// Types of variables according to default/user confirmation
var types_for_vars = {};

// Total number of modals for calculating percentage of modal progress bar
var number_of_modals = 5;

// determine whether in initial sequence of modals
var initial_sequence = true;

// Set default variables types according to metadata
function initTypes() {
  // Boolean for production/file supplied/online or not
  var online = false;
  var json_raw_data = null;
  var var_types_url = null;
  if (online) {
    // Retrieve from dataverse API
  } else {
    // Read from local'
    var_types_url = "getData"
    // var_types_url =  "../../data/preprocess_4_v1-0.json";
  }

  d3.json(var_types_url, function(json_data) {
    var json_variables = json_data['variables'];
    // Loop through all the variables
    for(var key in json_variables) {
      var current_variable = json_variables[key];
      // Boolean
      if (current_variable['binary'] == 'yes') {
        types_for_vars[key] = 'Boolean';
      } else {
        var current_variable_nature = current_variable['nature'];
        if (current_variable_nature == 'ordinal') {
          // Numerical
          types_for_vars[key] = 'Numerical';
        } else if (current_variable_nature == 'nominal') {
          // Categorical
          types_for_vars[key] = 'Categorical';
        }
      }
    }
    generate_modal4();
  });
}

initTypes();


function medtomaxpdf() {
  document.getElementById('pdf-icon').setAttribute('class', 'glyphicon glyphicon-arrow-down');
  document.getElementById("pdf-button").setAttribute('onclick', 'maxtomedpdf()');
  document.getElementById("pdf-viewer").setAttribute('class', 'full-pdf');
  document.getElementById("pdf-icon-second").setAttribute('class', "");
  document.getElementById("pdf-object").setAttribute('style', "height: 100%");
  document.getElementById("pdf-button-second").setAttribute('class', "gone");
}

function medtominpdf() {
  document.getElementById('pdf-icon').setAttribute('class', 'glyphicon glyphicon-arrow-up');
  document.getElementById("pdf-button").setAttribute('onclick', 'mintomedpdf()');
  document.getElementById("pdf-viewer").setAttribute('class', 'hidden-pdf');
  document.getElementById("pdf-icon-second").setAttribute('class', "");
  document.getElementById("pdf-button-second").setAttribute('class', "gone");
  document.getElementById("pdf-object").setAttribute('style', "height: 0");
  document.getElementById("budget-section").setAttribute('style', "height: 500px");
  // odd bug of disappearing sidebar in safari only; all other elements are fine, so just force re-render");
  document.getElementById("nudge_variable_sidebar").setAttribute("style", "transform: translateZ(0);");
}

function maxtomedpdf() {
  document.getElementById('pdf-icon').setAttribute('class', 'glyphicon glyphicon-arrow-up');
  document.getElementById("pdf-button").setAttribute('onclick', 'medtomaxpdf()');
  document.getElementById("pdf-viewer").setAttribute('class', 'normal-pdf');
  document.getElementById("pdf-object").setAttribute('style', "height: calc(100% - 434px)");
  document.getElementById("pdf-icon-second").setAttribute('class', "glyphicon glyphicon-arrow-down");
  document.getElementById("pdf-button-second").setAttribute('class', "");
}

function mintomedpdf() {
  document.getElementById('pdf-icon').setAttribute('class', 'glyphicon glyphicon-arrow-up');
  document.getElementById("pdf-button").setAttribute('onclick', 'medtomaxpdf()');
  document.getElementById("pdf-viewer").setAttribute('class', 'normal-pdf');
  document.getElementById("pdf-icon-second").setAttribute('class', "glyphicon glyphicon-arrow-down");
  document.getElementById("pdf-button-second").setAttribute('class', "");
  document.getElementById("pdf-object").setAttribute('style', "height: calc(100% - 434px)");
  document.getElementById("budget-section").setAttribute('style', "height: 300px");
}

// Find fields and values from URL
var fileid = "";
var apitoken = "";
let apitokenavailable = false;
var writemetadataurl = "";

function getJsonFromUrl() {
  var query = location.search.substr(1);
  var result = {};
  query.split("&").forEach(function(part) {
    var item = part.split("=");
    result[item[0]] = decodeURIComponent(item[1]);
  });
  return result;
}

if(urlparameters['fileid']){
  fileid = urlparameters['fileid'];
} else {
  fileid = "5265";                                   // define the default dataset as PUMS
}
console.log("fileid:")
console.log(fileid)

if(urlparameters['key']){
  apitoken = urlparameters['key'];
  apitokenavailable = true;
  writemetadataurl ="https://beta.dataverse.org/api/access/datafile/" + fileid + "/metadata/preprocessed?key=" + apitoken;

  console.log("apitoken:")
  console.log(apitoken)
  console.log(writemetadataurl)

}

// Move between UI test and prototype modes
var UI = true;
var UIvalue = "";
if(urlparameters['UI']){
  UIvalue = urlparameters['UI'];
  UI = false;
  $('#dataselect').val(fileid);                     // change value in selector box
}
console.log("UI:")
console.log(UI)

if(UI){
  console.log("switching from prototype to test mode");
  var element = document.getElementById("setdataset");     // delete the dataset selection header
  element.outerHTML = "";
  delete element;
};


// When beta.dataverse.org is down, need to override getting files live from Repository:

console.log("dataverse available: ", dataverse_available);

if(!dataverse_available){
  fileid = "";    // This is overriding the lines above that set fileid by the header/selection bar
}




console.log(fileid)

if(production && fileid=="") {
    alert("Error: No fileid has been provided.");
    throw new Error("Error: No fileid has been provided.");
}

if (!hostname && !production) {
    hostname="localhost:8080";
} else if (!hostname && production) {
    hostname="beta.dataverse.org"; 		//this will change when/if the production host changes
}

if (!production) {
    var rappURL = "http://0.0.0.0:8000/custom/";  		// base URL for the R apps:
} else {
    var rappURL = "https://beta.dataverse.org/custom/";	//this will change when/if the production host changes
}


// read DDI metadata with d3:
if (ddiurl) {
    // a complete ddiurl is supplied:
    metadataurl=ddiurl;
} else if (fileid) {
    // file id supplied; we're going to cook a standard dataverse
    // metadata url, with the file id provided and the hostname
    // supplied or configured:
    console.log("Retrieving data from dataverse");
    //metadataurl="https://beta.dataverse.org/api/meta/datafile/"+fileid;
    metadataurl="https://psi.hmdc.harvard.edu/"
} else {
    // neither a full ddi url, nor file id supplied; use one of the sample DDIs that come with
    // the app, in the data directory:
    //metadataurl="../../data/Census_PUMS5_California_Subsample-ddi.xml";  // This is PUMS example metadata file
    //metadataurl="../../data/pumsmetaui.xml"; //For UI/UX
    metadataurl="getXML";
    console.log("Retrieving Metadata Locally");
}



var uni_variable_list = [];

var bound_data_stored = {};

var dict_var_bounds = {};

var bins_data_stored = {};

var dict_var_bins = {};

///////////
var grid;
var allResults = [];
var secSamp = false;
var data = [];
var VarList =[];
var dataTitle;
d3.xml(metadataurl, "application/xml", function(xml) {
    console.log("XML: ", xml);
    var vars = xml.documentElement.getElementsByTagName("var");
    var Variables = [];
    var type;
    var typeMap = {};
    var caseQnty = xml.documentElement.getElementsByTagName("caseQnty");

    // Set the sample size from the metadata

    global_size = caseQnty[0].childNodes[0].nodeValue;
   // global_size = 1000; //for ui
    // document.getElementsByName('SS')[0].placeholder='value > ' + global_size;  // set the secrecy of the sample placeholder message

    for(var j =0; j < vars.length; j++ ) {
      Variables.push(vars[j].getAttribute('name').replace(/"/g,""));    // regular expression removes all quotes -- might need to adjust
      type = vars[j].getAttribute('intrvl').replace(/"/g,"");    // regular expression removes all quotes -- might need to adjust
      //if(type === "discrete"){
      //  type = "Categorical";
      //}
      //if(type === "contin"){
      //  type = "Numerical";
      //}
      //typeMap[Variables[j]] = type
    }
    //for demo only
    //typeMap[Variables[3]]="Numerical";

    // dataset name trimmed to 12 chars
    var temp = xml.documentElement.getElementsByTagName("fileName");
    var dataname = temp[0].childNodes[0].nodeValue.replace( /\.(.*)/, "") ;  // regular expression to drop any file extension
    dataTitle = dataname;
    console.log("metadata query output");
    console.log(Variables);
    console.log(dataname);
    console.log(typeMap);
    // Put dataset name, from meta-data, into header
    d3.select("#datasetName").selectAll("h2")
    .html(dataname);

  	variable_list = Variables;


	console.log(variable_list);

	// Active and inactive variable list
	varlist_active = [];
	varlist_inactive = variable_list.slice();
	populate_variable_selection_sidebar();

  // $('#myModal4').find('.modal-body').load("psiVariables.html");

  uni_variable_list = variable_list.slice();
  generate_modal4();

  for (var n = 0; n < uni_variable_list.length; n++) {
    dict_var_bounds[uni_variable_list[n]] = false;
  }

  // var variable_output = "";
  // for (var n = 0; n < uni_variable_list.length; n++) {
  //     variable = uni_variable_list[n];
  //     variable_output += variable + ": <select id='variable_type_" + variable + "' onchange='type_selected(value,\"" + variable + "\")'>" +
  //         // "<option id='default_" + variable + "' value='default'>Please select a type</option>" +
  //         list_of_types_selected(variable, types_for_vars[variable]) + "</select><br><br>";
  //    // result += '<li> ' + variable + '</li>';
  //     //$('#myModal4').find(".variable_modal ul").append("<li id='selection_sidebar_" + variable.replace(/\s/g, '_') + "' data-search-term='" + variable.toLowerCase() + "' onclick='variable_selected(\""+variable+"\")'>" + "!!!" + variable + "</li>")
  // }
  // $('#myModal4').find('.modal-body ul').append(variable_output);

	// Unique array function (source: http://stackoverflow.com/questions/11246758/how-to-get-unique-values-in-an-array)
	Array.prototype.unique = function () {
    	var arr = this;
    	return $.grep(arr, function (v, i) {
        return $.inArray(v, arr) === i;
    	});
	};

	// Element included in array function: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/includes
	if (!Array.prototype.includes) {
  		Array.prototype.includes = function(searchElement /*, fromIndex*/) {
    		'use strict';
    		if (this == null) {
      			throw new TypeError('Array.prototype.includes called on null or undefined');
    		}

    		var O = Object(this);
    		var len = parseInt(O.length, 10) || 0;
    		if (len === 0) {
      			return false;
    		}
    		var n = parseInt(arguments[1], 10) || 0;
    		var k;
    		if (n >= 0) {
      			k = n;
    		} else {
      			k = len + n;
      			if (k < 0) {k = 0;}
    		}
    		var currentElement;
    		while (k < len) {
      			currentElement = O[k];
      			if (searchElement === currentElement ||
         			(searchElement !== searchElement && currentElement !== currentElement)) { // NaN !== NaN
        			return true;
      				}
      			k++;
    		}
    		return false;
  		};
	}

  // Parse metadata for default variable types, call: init_types(data)

	// end JM
	///////////////////////////////////////////////////////////////////////
});   // JH: Here is where asynchronous xml read ends

///////////////////////////////////////////////////////////////////////
// JM talk to R mini example
// Full list of inputs that talk to R needs:
// dict: inputted_metadata
// indices: column_index
// stats: ["Mean", "Quantile", "Histogram"]
// metadata: ["Lower_Bound","Upper_Bound","Number_of_Bins", "Granularity"]
// globals: {eps=.1, del=.0000001, Beta=.05, n=2000)}
// action: string. either "betaChange" if beta was just changed, "accuracyEdited" if
//         accuracy was just edited, or an empty string otherwise
// var:    if accuracy was edited, the associated variable name. Otherwise empty string
// stat:   if accuracy was edited, the associated statistic. Otherwise empty string.

//function talktoR(action="", variable="", stat="") { JH: This default assignment is ES6 syntax not available in all browsers (Safari 10, but not 9, Chrome but not IE)
function talktoR(action, variable, stat) {
  var sh = number_of_complete_stats_and_holds();
  if (sh[0] != 0) {
    action = typeof action !== 'undefined' ? action : "";  // This gives the same behaviour: set as "" if undefined when function called
    variable = typeof variable !== 'undefined' ? variable : "";
    stat = typeof stat !== 'undefined' ? stat : "";

   //package the output as JSON
   var estimated=false;
   var base = rappURL;
   var btn = 0;

   function estimateSuccess(json) {

        // If all went well, replace inputted_metadata with the returned dictionary
        // and rebuild the epsilon table.

	  if(JSON.parse(JSON.stringify(json["error"]))=="T"){

	  	alert(JSON.parse(JSON.stringify(json["message"])));
	  	inputted_metadata = JSON.parse(JSON.stringify(previous_inputted_metadata));
    	generate_epsilon_table();
	  }else{

     	 inputted_metadata = JSON.parse(JSON.stringify(json["prd"]));
     	 generate_epsilon_table();
	  }

     estimated=true;

   }

   function estimateFail(warning) {
     //undo to previous state of page
     inputted_metadata = JSON.parse(JSON.stringify(previous_inputted_metadata));
     generate_epsilon_table();
     estimated=true;
     alert(warning);
   }
// JMIdea: change below to just always send functioning
 //  if (SS_value_past != "") {
    var jsonout = JSON.stringify({ dict: inputted_metadata, indices: column_index, stats: statistic_list, metadata: metadata_list, globals: {eps: global_fe, del: global_fd, Beta: global_beta, n: global_size, grouped_var_dict: grouped_var_dict}, action: action, variable: variable, stat: stat });
 //  }
   //else {
    //var jsonout = JSON.stringify({ dict: inputted_metadata, indices: column_index, stats: statistic_list, metadata: metadata_list, globals: {eps: global_epsilon, del: global_delta, Beta: global_beta, n: global_size}, action: action, variable: variable, stat: stat });
   //}

   console.log(jsonout)
   urlcall = FLASK_SVC_URL + "privateAccuracies.app"
   console.log("urlcall out: ", urlcall);
   makeCorsRequest(urlcall, estimateSuccess, estimateFail, jsonout);
}
}


function splash (releases) {
  var released_statistics = JSON.stringify(releases)
  var released_objects = JSON.parse(released_statistics)
  var paragraph =
    "<h2>Splash Result Page</h2>" +
    "<h3>Global Values</h3>" +
    "<p>Epsilon: " + released_objects.globals["eps"] + "</p>" +
    "<p>Delta: " + released_objects.globals["del"] + "</p>" +
    "<p>Beta: " + released_objects.globals["Beta"] + "</p>" +
    "<p>Data Size (n): " + released_objects.globals["n"] + "</p>";

  var variable_num = 1;
  for (var i = 0; i < released_objects.df.length; i++) {
    if (i != 0) {
      if (released_objects.df[i]["Variable"] == released_objects.df[i-1]["Variable"]) {
        paragraph += "<p>" + released_objects.df[i]["Statistic"] + " Releases: " + released_objects.df[i]["Releases"] + "</p>";
      }
      else {
        paragraph += "<h4>Variable " + variable_num + ": " + released_objects.df[i]["Variable"] + "</h4>" +
        "<p>" + released_objects.df[i]["Statistic"] + " Releases: " + released_objects.df[i]["Releases"] + "</p>";
        variable_num++;
      }
    }
    else {
      paragraph += "<h4>Variable " + variable_num + ": " + released_objects.df[i]["Variable"] + "</h4>" +
      "<p>" + released_objects.df[i]["Statistic"] + " Releases: " + released_objects.df[i]["Releases"] + "</p>";
      variable_num++;
    }
  }
  // console.log(released_objects.df[1]["Variable"]);
  // var paragraph = "<pre> <code>" + released_statistics + "</code> </pre>";
  return paragraph;
}

function submit(){
	if(interactive){
		submit_interactive()
	}
	else{
		var no_stats_selected = true;
		//If no statistics have been selected, don't talk to R
		for (var n = 0; n < varlist_active.length; n++) {
			for (var m = 0; m < statistic_list.length; m++) {
				var stat_index = 4 * m + 1;
				if (inputted_metadata[varlist_active[n].replace(/\s/g, '_')][stat_index] == 2) {
					no_stats_selected = false;
				}
			}
		}

        if (no_stats_selected)
            alert("You have not selected any statistics to submit.");
        else if (confirm("This will finalize your current selections and spend your privacy budget on them. This action cannot be undone."))
            talktoRtwo();
    }
}

function submit_interactive(){
	var no_stats_selected = true;
	//If no statistics have been selected, don't talk to R
	for (var n = 0; n < varlist_active.length; n++) {
        for (var m = 0; m < statistic_list.length; m++) {
            var stat_index = 4 * m + 1;
           	if (inputted_metadata[varlist_active[n].replace(/\s/g, '_')][stat_index] == 2) {
           		no_stats_selected = false;
           	}
        }
    }
    if(no_stats_selected){
    	alert("You have not selected any statistics to submit.");
    }
	else{
		var confirm_message;
		if(global_epsilon > global_fe){
			var remaining = global_epsilon-global_fe;
			confirm_message = 'This action will spend a portion of your finite privacy budget and cannot be undone. Your remaining epsilon budget will be '+remaining.toFixed(4)+'. Are you sure you want to continue?';
			if(confirm(confirm_message)){
				// var submit_info = window.open("");  // Have to open in main thread, and then adjust in async callback, as most browsers won't allow new tab creation in async function
				//unblock below when actually calculating stats
				talktoRtwo();
				//subtract batch parameters from global parameters and set new batch parameters defaulted to 10% of the new global ones.
				set_new_globals();
				//save underlying table for current batch
				archive_underlying_table();
				//clear all page states particular to the current batch
				reset_for_new_batch();
				//console.log(old_batch_tables);
				batch_num++;
			}
		}
		else{
			confirm_message = 'This action will spend all of your remaining privacy budget and cannot be undone. You will not be allowed to ask for any more statistics from the dataset. Are you sure you want to continue?';
			if(confirm(confirm_message)){
				var submit_info = window.open("");  // Have to open in main thread, and then adjust in async callback, as most browsers won't allow new tab creation in async function
				//unblock below when actually calculating stats
				talktoRtwo(submit_info);

				archive_underlying_table();
				// end session somehow
			}
		}
    document.getElementById("pdf-viewer-object").data = "/static/files/test.pdf";
	}
}

function reset_for_new_batch(){
	for(var i=0; i<varlist_active.length; i++){
		var variable = varlist_active[i];
		document.getElementById("selection_sidebar_" + variable.replace(/\s/g, '_')).style.cssText = variable_unselected_class;
        document.getElementById(variable.replace(/\s/g, '_')).remove();
	}
	varlist_active = [];
	varlist_inactive = variable_list;
	inputted_metadata = {};
	previous_inputted_metadata = {};
	generate_epsilon_table();
}

function archive_underlying_table(){
	var keys = Object.keys(inputted_metadata)
	for(var i=0; i<keys.length; i++){
		var new_key = keys[i]+'_'+batch_num;
		old_batch_tables[new_key] = JSON.parse(JSON.stringify(inputted_metadata[keys[i]]));
	}
}

// might want to do this somewhere secure and run the appropriate checks
function set_new_globals(){
	slider.setValue(10);
	global_epsilon = global_epsilon - global_fe;
	global_delta = global_delta - global_fd;
	global_fe = .1*global_epsilon;
	global_fd = .1*global_delta;
	document.getElementById("re_value").textContent = 10;
	document.getElementById("batcheval").textContent = global_fe.toFixed(4);
	document.getElementById("batchdval").textContent = global_fd.toExponential(4);
	document.getElementById("batchEpsDisplay").textContent = global_fe.toFixed(4);
  	document.getElementById("batchDelDisplay").textContent = global_fd.toExponential(4);
  	document.getElementById("remainingEpsDisplay").textContent = global_epsilon.toFixed(4);
  	document.getElementById("remainingDelDisplay").textContent = global_delta.toExponential(4);
    if(interactive) {
      document.getElementById("epsilon-progress").style.width = 100 * (1 - global_epsilon / fixed_epsilon).toFixed(4) + "%";
      document.getElementById("epsilon-progress-proposed").style.width = 100 * (global_fe / fixed_epsilon).toFixed(4) + "%";
    }
}

///////////////////////////////////////////////////////////////////////
// JH talk to R for generating release
// Previously, this used to be folded into the talktoR function,
// but that was pared down for this version
// so presently this is a stand alone shortened function
//
// Lots of duplicated code, however.

let release;
function talktoRtwo() {
    //check completeness here too
  	// if secrecy of the sample is active, provide boosted privacy parameters

   let estimated=false;

   function storeMetaSuccess(){
      console.log("metadata to dataverse: SUCCESS");
   }

   function storeMetaFail(){
      console.log("metadata to dataverse: FAILURE");
   }

   /**
      Process a successful response from the R "privateStatistics.app"
    */
   function statisticsSuccess(json) {
       console.log("start: statisticsSuccess");
       console.log("json in stat s: ", json);

       let reportCallback = response => {

           let reportURL = `${FLASK_SVC_URL}${response.report_url.replace(/^\/+/g, '')}`;
           let reportElement = document.getElementById('pdf-viewer-object');
           reportElement.data = reportURL;
           reportElement.style.display = "block";
           document.getElementById('pdf-alternate-url').href = reportURL;
       };
       release = json.release;
       makeCorsRequest(`${FLASK_SVC_URL}report.app`, reportCallback, console.warn, JSON.stringify(release));
       estimated = true;

       // In production, if PSI has been called with an API token, then try to deposit metadata to dataverse when DP statistics have been successfully released
       if (apitokenavailable && production) {
           console.log("attempting to post metadata to dataverse")
           console.log("writemetadataurl out: ", writemetadataurl);
           makeCorsRequest2(writemetadataurl, storeMetaSuccess, storeMetaFail, testJSON);
       }

   }  // end: statisticsSuccess


    function estimateFail(warning) {
        estimated = true;
        console.log("ran estimateFail")
        alert(warning)
    }

// JMIdea always use functioning
  // if (SS_value_past != "") {
    var jsonout = JSON.stringify({release, dict: inputted_metadata, indices: column_index, stats: statistic_list, metadata: metadata_list, globals: {eps: global_fe, del: global_fd, Beta: global_beta, n: global_size, grouped_var_dict: grouped_var_dict}, fileid: fileid, apitoken: apitoken, transforms: generateTransform()});
  // }
   //else {
   // var jsonout = JSON.stringify({ dict: inputted_metadata, indices: column_index, stats: statistic_list, metadata: metadata_list, globals: {eps: global_epsilon, del: global_delta, Beta: global_beta, n: global_size}, fileid: fileid });
   //}

	console.log(jsonout)
    // urlcall = base+"privateStatisticsapp";
    urlcall = FLASK_SVC_URL + "privateStatistics.app"
    console.log("urlcall out: ", urlcall);

    makeCorsRequest(urlcall, statisticsSuccess, estimateFail, jsonout);
}


// below from http://www.html5rocks.com/en/tutorials/cors/ for cross-origin resource sharing
// Create the XHR object.
function createCORSRequest(method, url, callback) {
     var xhr = new XMLHttpRequest();
     if ("withCredentials" in xhr) {
         // XHR for Chrome/Firefox/Opera/Safari.
         console.log("XHR request has credentials")
         xhr.open(method, url, true);
     } else if (typeof XDomainRequest != "undefined") {

         // XDomainRequest for IE.
         xhr = new XDomainRequest();
         xhr.open(method, url);
     } else {
         // CORS not supported.
         xhr = null;
     }

     xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
     return xhr;
}


// CHANGED TO multipart Content-Type
// below from http://www.html5rocks.com/en/tutorials/cors/ for cross-origin resource sharing
// Create the XHR object.
function createCORSRequest2(method, url, callback) {
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
function makeCorsRequest(url, callback, warningcallback, json) {
     console.log('makeCorsRequest: ' + url);
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

       // changed json format: make sure twoRavens has commit [master 460a2f5].

       /* Call routed through django and should return:
              {success: false,
               message: "some error"}
          OR
              {success: true,
               data: {your flask response}}
            -- which may include --
              {success: true,
               data: {
                warning: "your rook warning"}
              }
       */
       if (!json.success){
          console.log(json.message);
          alert(json.message + "\nurl: " + url);
       }else{
          if (json.data.warning){
            warningcallback(json.data.warning)
          }else{
            callback(json.data);
          }
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
             alert('There was an error making the request.');
         }
         console.log(xhr);
     };
     console.log("sending")
     console.log(json);

     //xhr.send("tableJSON="+encodeURIComponent(json));
     xhr.send(json);
}


// Make the actual CORS request.
// Use FormData for multipart request
function makeCorsRequest2(url,callback, warningcallback, json) {
     var xhr = createCORSRequest2('POST', url);
     var fd = new FormData();

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

       // changed json format: make sure twoRavens has commit [master 460a2f5].
       if (json.warning) {
          console.log("calling warning callback")
          warningcallback(json.warning)
       }else{
          callback(json);
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
             alert('There was an error making the request.');
         }
         console.log(xhr);
     };
     console.log("sending by FormData():" + json)
     //console.log("metadata: " + json + "; diffPrivate: true");
     fd.append("metadata", json);
     xhr.send(fd);
}



// Variable selection boxes change to signify selection
function variable_selected (variable) {
    if (inputted_metadata[variable.replace(/\s/g, '_')] == undefined) {
        document.getElementById("selection_sidebar_" + variable.replace(/\s/g, '_')).style.cssText = variable_selected_class;
        activate_variable(variable);
    }
    else {
        //delete_variable(variable); //JM collapse box here
    }
    document.getElementById("live-search-box").value = "";
    $('.live-search-list li').each(function() {
        $(this).show();
    });
    if(first_variable_selected && tutorial_mode){
    	hopscotch.endTour(true);
		var type_text =  "<ul><li>Numerical: The dataset entries for this variable should be treated as numbers.</li><li> Boolean: The dataset entries for this variable fall into two possible categories/bins. </li><li> Categorical: The dataset entries for this variable should be treated as categories/bins.</li></ul>";
		var tour_target = "variable_type_" + variable;
		var variable_selected_tour = {
		  "id": "type_selection",
		   "i18n": {
			"doneBtn":'Ok'
		  },
		  "steps": [
			{
			  "target": tour_target,
			  "placement": "right",
			  "title": "Select variable type",
			  "content": type_text,
			  "yOffset":-20,
			  "showCTAButton":true,
			  "ctaLabel": "Disable these messages",
			  "onCTA": function() {
				hopscotch.endTour(true);
				tutorial_mode = false;
			  },
			}
		  ],
		  "showCloseButton":false,
		  "scrollDuration": 300,
		  "onEnd":  function() {
			   first_variable_selected = false;
			  },
		};
    	hopscotch.startTour(variable_selected_tour);
    }
};





// Updates varlist_active, varlist_inactive, and creates bubble
function activate_variable (variable) {
    // fixes javascript pass by value/reference issue
    previous_inputted_metadata = JSON.parse(JSON.stringify(inputted_metadata));
    var variable_index = varlist_inactive.indexOf(variable);
    varlist_inactive.splice(variable_index, 1);
    varlist_active.push(variable);
    inputted_metadata[variable.replace(/\s/g, '_')] = array_default();
    $("#bubble_form").prepend(make_bubble(variable));
    // if new variable is multivariate, prepopulate available types
	if(variable in grouped_var_dict){
		// var varlist = grouped_var_dict[variable];
		// var v;
		// for(var i=0; i< varlist.length; i++){
		// 	v = varlist[i];
		// 	if(document.getElementById('variable_type_'+v) && document.getElementById('variable_type_'+v).value){
		// 		document.getElementById("variable_type_" + v + "_group_"+variable).value = document.getElementById('variable_type_'+v).value;
		// 		check_group_types(variable);
		// 	}
		// }
    check_group_types(variable);
	} else {
    	// // Trigger selection of type
    	if (!(variable in types_for_vars)){
    		types_for_vars[variable] = "Categorical";
    	};

    	//   	// Object.keys(types_for_vars).sort().map(t => `"${t}"`).join(',');
     	//  		let user_msg = 'Error in "activate_variable".  Type not found for variable "' + variable + '"\nVariables with known types: ' + Object.keys(types_for_vars).sort().map(t => `"${t}"`).join(', ');
     	//  		show_debug_error(user_msg);
     	//  		return;
    	// }

    	type_selected(types_for_vars[variable], variable);
  	}
    //Default to open accordion
    open_acc = "accordion_"+variable;
    jamestoggle(document.getElementById(open_acc));
    if(transforms_data[variable]) {
        $("#formula_" + variable).text("Formula: " + transforms_data[variable].formula).show()
    }
};



// Remove variable from bubble list; if it's a transform, delete it entirely
function delete_variable (variable) {
    // if deleting variable would result in all held statistics, don't delete.
        if (areAllHeld1(variable)) {
          alert("Deletion would result in all held statistics. Try removing some holds before deleting");
        }

        else {
            previous_inputted_metadata = JSON.parse(JSON.stringify(inputted_metadata));
            delete inputted_metadata[variable.replace(/\s/g, '_')];
            var variable_index = varlist_active.indexOf(variable);
            varlist_active.splice(variable_index, 1);
            varlist_inactive.push(variable);
            document.getElementById("selection_sidebar_" + variable.replace(/\s/g, '_')).style.cssText = variable_unselected_class;
            document.getElementById(variable.replace(/\s/g, '_')).remove();

            // TODO will need to remove all other associated data
           //  if(transforms_data[variable]) {
//                 delete transforms_data[variable]
//                 variable_list.splice(variable_list.indexOf(variable), 1)
//                 remove_variable_from_sidebar(variable)
//             }

            talktoR();
        }

        generate_epsilon_table();
        console.log(previous_inputted_metadata);

};

function add_variable_to_sidebar(variable) {
  console.log(variable)
    $(".variable_sidebar ul").append("<li id='selection_sidebar_" + variable.replace(/\s/g, '_') + "' data-search-term='" + variable.toLowerCase() + "' onclick='variable_selected(\""+variable+"\")'>" + variable + "</li>")

}

function remove_variable_from_sidebar(variable) {
    var currently_in_use = false;
    if (!grouped_var_dict[variable]) {
      for (var multikey in grouped_var_dict) {
        // if current variable in use somewhere
        if (grouped_var_dict[multikey].indexOf(variable) != -1) {
          currently_in_use = true;
          break;
        }
      }
    }

    if (currently_in_use) {
      alert("This variable is currently part of a grouped variable. Please delete the grouped variable before trying again.");
    } else {
      var remove_index = uni_variable_list.indexOf(variable);
      uni_variable_list.splice(remove_index, 1);
      delete grouped_var_dict[variable];
      remove_index = variable_list.indexOf(variable);
      variable_list.splice(remove_index, 1);
      delete_variable(variable);
      $('#selection_sidebar_' + variable.replace(/\s/g, '_')).remove();
    }
}

// Adding variables to the variable selection column
function populate_variable_selection_sidebar () {
    document.getElementById('live-search-box').style.display = "inline";
    var variable_selection_sidebar =""; //=
   // "<ul id='variable_sidebar' class='live-search-list'>";

    for (n = 0; n < variable_list.length; n++) {
        add_variable_to_sidebar(variable_list[n]);
    };

    document.getElementById('new-transform-box').style.display = "inline";
};

// A reset function for rows
function reset (row, type_chosen, variable) {
    row[0] = "default";
    for (var m = 0; m < statistic_list.length; m ++) {
        var n = 4 * m + 1;
        row[n] = 0;
        row[n + 1] = "";
        row[n + 2] = "";
        row[n + 3] = 0;
    };
    var default_metadata = "";
    if(variable in grouped_var_dict){
    	var varlist = grouped_var_dict[variable];
    	default_metadata = {};
    	for(var i=0; i<varlist.length; i++){
    		var v = varlist[i];
    		default_metadata[v] = "";
    	}
    	default_metadata["General"] = "";
    }
    for (var l = 0; l < metadata_list.length; l++) {
        var n = 1 + 4 * statistic_list.length;
        row[n + l] = JSON.parse(JSON.stringify(default_metadata));
    };
    if(type_chosen == "Categorical"){
    	row[column_index["Missing_Type"]] = "separate_bin";
    }
    else {
    	row[column_index["Missing_Type"]] = "random_value";
    }
    row[column_index["Missing_Input"]] = "";
    if(interactive){
    	row[column_index["Batch_Number"]] = batch_num;
    }
};

// A default array
function array_default () {
    var array_default = ['default'];
    for (var m = 0; m < statistic_list.length; m ++) {
        array_default.push(0);
        array_default.push("");
        array_default.push("");
        array_default.push(0);
    };
    for (var l = 0; l < metadata_list.length; l++) {
        array_default.push("");
    };
    return array_default;
};


// Make the category dropdown
// Tooltip: http://stackoverflow.com/questions/682643/tooltip-on-a-dropdown-list
function list_of_types (variable) {
    type_menu = "";
    for (var m = 0; m < type_list.length; m++) {
        type_menu += "<option id='" + type_list[m] + "_" + variable + "' value='" + type_list[m] + "' title='" + rfunctions.type_label[m].type_info + "'>" + type_list[m] + "</option>";
    };
    return type_menu;
};

function list_of_types_selected (variable, selected) {
    type_menu = "";
    for (var m = 0; m < type_list.length; m++) {
        if (type_list[m] == selected) {
            type_menu += "<option id='" + type_list[m] + "_" + variable + "' value='" + type_list[m] + "' title='" + rfunctions.type_label[m].type_info + "' selected='selected'>" + type_list[m] + "</option>";
        }else{
            type_menu += "<option id='" + type_list[m] + "_" + variable + "' value='" + type_list[m] + "' title='" + rfunctions.type_label[m].type_info + "'>" + type_list[m] + "</option>";
        }
    };
    return type_menu;
};

// Produces checkboxes on selected type
// this function will change when we change the way we collect types
function type_selected(type_chosen, variable, bool_multi) {

  if (typeof type_chosen == 'undefined'){
    let user_err_msg = 'Error: type_selected; "type_chosen" is undefined. variable was: ' + variable;
    show_debug_error(user_err_msg);
    return;
  }
    // Update type for variable when selected in dropdown
    console.log('selected "' + type_chosen + '" for "' + variable + '"');
    // if (type_chosen.length == 1) {
      console.log(type_chosen);
      types_for_vars[variable] = type_chosen;
    // }
    // Update variable bubble
    $('#type-' + variable).html(type_chosen);
    $('table tbody tr td').find('#type-' + variable).html(type_chosen);

    variable = variable.replace(/\s/g, '_');
    previous_inputted_metadata = JSON.parse(JSON.stringify(inputted_metadata));
    mytype = "Numerical";
    if (!bool_multi && variable in inputted_metadata) {
      reset(inputted_metadata[variable], type_chosen, variable);


    if (!areAllHeld1()) {
		  inputted_metadata[variable][0] = type_chosen;
  		generate_epsilon_table();

      if (type_chosen != "default") {
  			document.getElementById("released_statistics_" + variable).innerHTML = list_of_statistics(type_chosen, variable);
  			document.getElementById('necessary_parameters_' + variable).innerHTML = "";
  			document.getElementById('missing_data_' + variable).innerHTML = "";
  		}else {
  			document.getElementById("released_statistics_" + variable).innerHTML = "";
  			document.getElementById('necessary_parameters_' + variable).innerHTML = "";
  			document.getElementById('missing_data_' + variable).innerHTML = "";
  		}


		if (previous_inputted_metadata[variable][0] != "default") {
      if (variable in grouped_var_dict) {
        talktoR();
      } else {
  			var stat_changed = 0;
  			eval("var ppparameter = " + previous_inputted_metadata[variable][0] + "_stat_parameter_list;");
  			for (var m = 0; m < ppparameter.length; m++) {
  				stat_index = 4 * ppparameter[m].rfunctions_index + 1;
  				if (previous_inputted_metadata[variable][stat_index] == 2) {
  					stat_changed++;
  				}
  			};
  			if (stat_changed > 0) {
  				console.log("talk to r bc type has changed and there was valid stats removed");
  				talktoR();
  			}
      }
		}
  }
  else {
    inputted_metadata = JSON.parse(JSON.stringify(previous_inputted_metadata));
    $("#variable_type_" + variable).val(inputted_metadata[variable][column_index["Variable_Type"]]);
    alert("Changing types would result in all held statistics. Try removing some holds before changing types.")
  }

}

	if(first_type_selected && tutorial_mode){
		hopscotch.endTour(true);
		var tour_content =  "<ul><li>Mean: Average of the variable.</li><li> Histogram: Bar graph/counts of the categories/bins in the variable. </li><li> Quantile: Cumulative distribution function from which all quantiles can be extracted (e.g. median, percentiles, etc.)</li><li>Regression models: OLS, Logistic, and Probit regression models.</li><li>Average Treatment Effect on the Treated (ATT with Matching): Performs coarsened exact matching and then uses the matched dataset to compute the ATT and a confidence interval.</li></ul> Note: available statistics depend on variable type.";
		var tour_target = "released_statistics_" + variable;
		var type_selected_tour = {
		  "id": "stat_selection",
		   "i18n": {
			"doneBtn":'Ok'
		  },
		  "steps": [
			{
			  "target": tour_target,
			  "placement": "bottom",
			  "title": "Select statistics to release",
			  "content": tour_content,
			  "showCTAButton":true,
			  "ctaLabel": "Disable these messages",
			  "onCTA": function() {
				hopscotch.endTour(true);
				tutorial_mode = false;
			  },
			}
		  ],
		  "showCloseButton":false,
		  "scrollDuration": 300,
		  "onEnd":  function() {
			   first_type_selected = false;
			  },
		};
    	hopscotch.startTour(type_selected_tour);
}

};

// Display help text
function display_help(text) {
  d3.select("#datasetName").selectAll("h2").html('');
  d3.select("#datasetSmallName").html('<h4 style="display:inline;">' + dataTitle + '</h4>');
  d3.select("#datasetHelp").html(text);
};

// Display help id
function display_help_id(id) {
  d3.select("#datasetName").selectAll("h2").html('');
  d3.select("#datasetSmallName").html('<h4 style="display:inline;">' + dataTitle + '</h4>');
  $("#datasetHelp").load(CONTENT_PAGES_BASE_URL + 'psiIntroduction.html #' + id);
}

/*
    try to handle errors that reach here in other ways
 */
function show_debug_error(user_err_msg){
  console.log(user_err_msg);
  alert(user_err_msg)
}

// Makes the checkboxes
function list_of_statistics (type_chosen, variable) {

	if(variable in grouped_var_dict){
		return list_of_multivar_statistics (type_chosen, variable)
	}
	else{
		variable = variable.replace(/\s/g, '_');
		var options = "";
		eval("var type_chosen_list = " + type_chosen + "_stat_list;");
		for (var n = 0; n < type_chosen_list.length; n++) {
      console.log(type_chosen_list[n].replace(/\s/g, '_') + '_help');
      options += "<input type='checkbox' name='" + type_chosen_list[n].replace(/\s/g, '_') + "' onclick='Parameter_Populate(this," + n + ",\"" + variable + "\",\"" + type_chosen + "\"); generate_epsilon_table();' id='" + type_chosen_list[n].replace(/\s/g, '_') + "_" + variable + "'> <span onclick='display_help_id(\"" + type_chosen_list[n].replace(/\s/g, '_') + '_help' + "\")' style='cursor:help;'>" + type_chosen_list[n] + "</span><br>";
		};
		return options;
	}
};

// Makes the checkboxes for multivariate statistics
function list_of_multivar_statistics (type_chosen, variable) {
	var reqs;
	var options = "";
	for(var i = 0; i < rfunctions.rfunctions.length; i++){
		if(rfunctions.rfunctions[i].statistic_type[0].stype == "Multivar"){
			reqs = rfunctions.rfunctions[i].requirements;
			var allTrue = true;
			for(var j = 0; j < reqs.length; j++){
				req = reqs[j];
			if(!(multivar_stat_applicable(type_chosen, req))){
				allTrue = false;
			}
			}
			if(allTrue){
				options += "<input type='checkbox' name='" + rfunctions.rfunctions[i].statistic.replace(/\s/g, '_') + "' onclick='Parameter_Populate(this," + n + ",\"" + variable + "\",\"" + 'Multivar' + "\"); generate_epsilon_table();' id='"+ rfunctions.rfunctions[i].statistic.replace(/\s/g, '_') + "_" + variable + "'> <span>" + rfunctions.rfunctions[i].statistic + "</span><br>";
			}
		}
	}
	if(options == ""){
		options = "There are no statistics available that work with the chosen set of variable types.";
	}
	return options;
}

function multivar_stat_applicable(typedict, req){
	var types = [];
	for(var key in typedict){
		types.push(typedict[key]);
	}
	var all_categorical = true;
	all_categorical = false;
	all_categorical = false;

	if(req == "outcome_non_categorical"){
		var all_categorical = true;
		for(var i=0; i<types.length; i++){
			if(!(types[i] == "Categorical")){
				all_categorical = false;
			}
		}
		return !all_categorical;
	}
	else if(req == "outcome_boolean"){
		if(types.indexOf('Boolean') > -1){
			return true;
		}
		else{
			return false;
		}
	}
	else if (req == "two_booleans"){
		var boolcount = 0;
		for(var i=0; i<types.length; i++){
			if(types[i]=="Boolean"){
				boolcount++
			}
		}
		if(boolcount >= 2){
			return true;
		}
		else{
			return false;
		}
	}
	else if (req == "three_vars"){
		if(types.length < 3){
			return false;
		}
		else{
			return true;
		}
	}
	else {
		return false;
	}

}


function jamestoggle(button) {
    accordion(button);
    if (button.classList.contains("active")) {
      $(button).find(".glyphicon").removeClass("glyphicon-menu-up").addClass("glyphicon-menu-down");
    } else {
      $(button).find(".glyphicon").removeClass("glyphicon-menu-down").addClass("glyphicon-menu-up");
    }
  };

function make_bubble (variable) {
    var variable_raw = variable;
    variable = variable.replace(/\s/g, '_');
    var blank_bubble =
    "<div id='" + variable + "'>" +
        "<div class='bubble' id='bubble_" + variable + "'>" +
            "<button class='accordion' id='accordion_" + variable + "' onclick=jamestoggle(this);>" +
                variable_raw +
            "<i class='glyphicon glyphicon-menu-up' style='color:#A0A0A0;font-size:16px;float:right;'></i>" +
            "</button>" +
            "<div id='panel_" + variable + "' class='panel'>" +
                "<div id='formula_" + variable + "' class ='formulas'> </div>" +
                "<div id='variable_types_" + variable + "' class='variable_types'>";
                if(variable in grouped_var_dict){
                	var varlist = grouped_var_dict[variable];
                	var v;
                	// blank_bubble += "Enter variable types:";
                  blank_bubble += "Variable Types";

                  blank_bubble += "&nbsp;&nbsp;<a href='#myModal5' id='variable_type_" + variable + "' data-toggle='modal' data-dismiss='modal'><button onclick='generate_modal5(\"" + variable + "\")' ><span class='glyphicon glyphicon-pencil'></span></button></a>";

                	blank_bubble += "<button type='button' class='manualinfo' data-load-url='" + CONTENT_PAGES_BASE_URL + "psiIntroduction.html' data-toggle='modal' data-target='#myModal' data-id='statistics' style='float:right;' onclick='generate_modalinfo()'><span class='glyphicon glyphicon-question-sign' style='color:"+qmark_color+";font-size:"+qmark_size+";'></span></button>";
                	blank_bubble += "<table>";
                	for(var i=0; i< varlist.length; i++){
                		v = varlist[i];
                		// blank_bubble += "<tr><td>"+ v + ":  </td>" +
                    // "<td><select id='variable_type_" + v + "_group_"+variable+"' onchange='check_group_types(\""+variable+"\")'>" +
                    //     "<option id='default_" + v + "' value='default'>Please select a type</option>" +
                    //     list_of_types(v) +
                    // "</select></td></tr>";

                    blank_bubble += "<tr><td>"+ v + ":  </td>" + "<td><span id='type-" + v + "'>" + types_for_vars[v] + "</span></td></tr>";
                	}
                	blank_bubble += "</table>";
                }
                else{
                    // blank_bubble += "Variable Type: " +
                    // "<select id='variable_type_" + variable + "' onchange='type_selected(value,\"" + variable + "\")'>" +
                    //     "<option id='default_" + variable + "' value='default'>Please select a type</option>" +
                    //     list_of_types(variable) +
                    // "</select>";

                    // Display confirmed type
                    blank_bubble += "Variable Type: <span id='type-" + variable + "'>" + types_for_vars[variable] + "</span>";
                    // Option to return to modal window to change
                    blank_bubble += "&nbsp;&nbsp;<a href='#myModal4' id='variable_type_" + variable + "' data-toggle='modal' data-dismiss='modal'><button class='btn btn-default' onclick='generate_modal4()' ><span class='glyphicon glyphicon-pencil'></span></button></a>";
                    blank_bubble += "<button type='button' class='manualinfo' data-load-url='" + CONTENT_PAGES_BASE_URL + "psiIntroduction.html' data-toggle='modal' data-target='#myModal' data-id='statistics' style='float:right;'  onclick='generate_modalinfo()'><span class='glyphicon glyphicon-question-sign' style='color:"+qmark_color+";font-size:"+qmark_size+";'></span></button>";
                }
                 blank_bubble += "</div>" +
                "<hr style='margin-top: -0.25em'>" +
                "<div id='released_statistics_" + variable + "' class='released_statistics'>" +
                "</div>" +
                "<hr style='margin-top: -0.25em'>" +
                "<div id='necessary_parameters_" + variable + "' class='necessary_parameters'></div>" +
                "<hr style='margin-top: -0.25em'>" +
                "<div id='missing_data_" + variable + "' class='missing_data'></div>" + "<br><div>";
                //"<div id='missing_data_input_" + variable + "' class='missing_data'></div>" +
                if (transforms_data[variable] || grouped_var_dict[variable]) {
                    blank_bubble += "<button class='btn btn-danger' onclick='remove_variable_from_sidebar(\"" + variable_raw + "\");'>Delete variable</button>";
                }
                blank_bubble += "<button class='btn btn-default' onclick='delete_variable(\"" + variable_raw + "\")' style='float:right;'>Disable variable</button><br /></div>" +
            "<br>"+
            "</div>" +
        "</div>" +
        "<br>" +
    "</div>";
    return blank_bubble;
};

function singlevar_type_selected (value, variable) {
  type_selected(value, variable);
  check_all_multivars();
}

function multivar_type_selected (subtype, variable, single_variable) {
  type_selected(subtype, single_variable, true);
  check_all_multivars();
}

function check_all_multivars () {
  // Update possible statistics for active multivars
  for (var i = 0; i < varlist_active.length; i++) {
    var active_var = varlist_active[i];
    if (active_var in grouped_var_dict) {
      check_group_types(active_var);
    }
  }
}

function generate_modalinfo () {
  if (!initial_sequence) {
    $('#myModal').find('.modal-footer').html('<button type="button" class="btn btn-default" data-dismiss="modal" onclick="edit_window_closed();">Close</button>');
  }
}

function generate_modal4 () {
  $('#myModal4').find('.modal-body ul').html("");
  var variable_output = "";
  variable_output += "<table style='table-layout:fixed;'>";
  for (var n = 0; n < uni_variable_list.length; n++) {
      variable = uni_variable_list[n];
      variable_output += "<tr><td style='white-space: nowrap; text-overflow:ellipsis; overflow: hidden; max-width:200px;'>";
      variable_output += variable + ":</td> <td style='height: 40px'><select id='variable_type_" + variable + "' onchange='singlevar_type_selected(value,\"" + variable + "\")'>" +
          list_of_types_selected(variable, types_for_vars[variable]) + "</select></td></tr>";
  }
  variable_output += "</table>";
  $('#myModal4').find('.modal-body ul').append(variable_output);
  if (!initial_sequence) {
    $('#myModal4').find('.modal-footer').html('<button type="button" class="btn btn-default" data-dismiss="modal" onclick="edit_window_closed();">Close</button>');
  }
}

function generate_modal5 (variable) {
  $('#myModal5').find('.modal-body ul').html("");
  var variable_output = "";
  variable_output += "<table style='table-layout:fixed;'>";
  for (var n = 0; n < uni_variable_list.length; n++) {
      var_list_item = uni_variable_list[n];
      variable_output += "<tr><td style='white-space: nowrap; text-overflow:ellipsis; overflow: hidden; max-width:200px;'>";
      variable_output += var_list_item + ": </td> <td style='height: 40px'>";
      if (types_for_vars[var_list_item] == var_list_item) {
        variable_output += "<select id='variable_type_" + var_list_item + "_group_" + variable + "' selected='selected' onchange='multivar_type_selected(value,\"" + variable + "\", \"" + var_list_item + "\")'>" +
            list_of_types_selected(var_list_item, types_for_vars[var_list_item]) + "</select>";
      } else {
        variable_output += "<select id='variable_type_" + var_list_item + "_group_" + variable + "' onchange='multivar_type_selected(value,\"" + variable + "\", \"" + var_list_item + "\")'>" +
            list_of_types_selected(var_list_item, types_for_vars[var_list_item]) + "</select>";
      }
      variable_output += "</td></tr>";
  }
  variable_output += "</table>";
  $('#myModal5').find('.modal-body ul').append(variable_output);
  if (!initial_sequence) {
    $('#myModal4').find('.modal-footer').html('<button type="button" class="btn btn-default" data-dismiss="modal" onclick="edit_window_closed();">Close</button>');
  }
}

// After types have been implemented, generate and add logic for bounds/bin names modals
function generate_modals_with_types () {
  var current_modal_counter = 3;
  var modal6_exists = generate_modal6();
  var modal7_exists = generate_modal7();
  if (modal6_exists) {
    number_of_modals = current_modal_counter + 2;
    if (!modal7_exists) {
        number_of_modals = current_modal_counter + 1;
        $("#myModal6").find('.modal-footer .btn-info')[0].setAttribute("href", "#");
        $("#myModal6").find('.modal-footer .btn-info')[0].setAttribute("onclick", "hide_modal_progress();");
    } else {
        $("#myModal6").find('.modal-footer .btn-info')[0].setAttribute("href", "#myModal7");
        $("#myModal6").find('.modal-footer .btn-info')[0].setAttribute("onclick", "update_modal_progress(5);");
    }
    $('#myModal6').modal('show');
    update_modal_progress(current_modal_counter + 1);
  } else {
    number_of_modals = current_modal_counter;
    if (modal7_exists) {
      number_of_modals = current_modal_counter + 1;
      $('#myModal7').modal('show');
      update_modal_progress(current_modal_counter + 1);
      $("#myModal7").find('.modal-footer #modal6back')[0].setAttribute("href", "#myModal4");
      $("#myModal7").find('.modal-footer #modal6back')[0].setAttribute("onclick", "update_modal_progress(3);");
    } else {
      hide_modal_progress();
    }
    // $("#myModal4").find('.modal-footer a').setAttribute("href", "#myModal7");
    // $("#myModal4").find('.modal-footer a').setAttribute("onclick", "update_modal_progress(" + current_modal_counter+ ");");
  }
  // if (generate_modal7()) {
  //   $("#myModal6").find('.modal-footer a').setAttribute("href", "#myModal7");
  //   current_modal_counter++;
  //   $("#myModal4").find('.modal-footer a').setAttribute("onclick", "update_modal_progress(" + current_modal_counter+ ");");
  // }
}

/* Modal for Lower and Upper Bounds */
function generate_modal6 () {
  $('#myModal6').find('.modal-body ul').html("");
  var is_table_not_empty = false;
  for (var n = 0; n < uni_variable_list.length; n++) {
    var var_entry = uni_variable_list[n];
    if (types_for_vars[var_entry] == "Numerical") {
      is_table_not_empty = true;
    }
  }
  if (!is_table_not_empty) {
    $('#myModal6').find('.modal-body ul').append("There are no numerical variables in the dataset.");
  } else {
    var table_output = "";
    table_output += "<table style='table-layout: fixed;'>";
    // select/deselect all button
    table_output += "<tr><td><button class='bounds_all_button' id='all_vars_button' onclick='select_bound_vars()'>Select All</button></td><td></td><td></td></tr>";
    table_output += "<tr><td><b>Variable</b></td><td></td><td><b>Lower Bound</b></td><td><b>Upper Bound</b></td></tr>"; // Header
    for (var n = 0; n < uni_variable_list.length; n++) {
      var var_entry = uni_variable_list[n];
      if (types_for_vars[var_entry] == "Numerical") {
        table_output += "<tr>";
        table_output += "<td class='var_selectable var_bound_text' id='var_selectable_" + var_entry.replace(/\s/g, '_') + "' onclick='select_bounds_group(\"" + var_entry + "\")'>" + var_entry + "</td>"; // Variable button
        table_output += "<td class='bound_buffer'></td>";
        var lower_value = '';
        if (var_entry in bound_data_stored && "Lower" in bound_data_stored[var_entry]) {
          lower_value = bound_data_stored[var_entry]["Lower"];
        }
        var upper_value = '';
        if (var_entry in bound_data_stored && "Upper" in bound_data_stored[var_entry]) {
          upper_value = bound_data_stored[var_entry]["Upper"];
        }
        // <button class='btn btn-primary' type='button' data-toggle='button' aria-pressed='false'>" + var_entry + "</button>
        table_output += "<td><input id='input_Lower_Bound_" + var_entry.replace(/\s/g, '_') + "' onfocusout='bound_input_group(\"" + var_entry + "\", \"Lower\", this)' onchange='ValidateInput(this, \"number\", \"" + var_entry + "\")' class='bound_input' type='text' value='" + lower_value + "' placeholder='Lower Bound'/></td>"; // Lower bound
        // table_output += "<td><input type='text' value='' class='bound_input' placeholder='Lower Bound' name='Lower_Bound' id='input_Lower_Bound_" + var_entry.replace(/\s/g, '_') + "' onfocusin='record_table()' oninput='Parameter_Memory(this,\"" + var_entry + "\")' onchange='ValidateInput(this, \"number\", \"" + var_entry + "\")' onfocusout='bound_input_group(\"" + var_entry + "\", \"Lower\", this)'></td>"; // Lower bound
        table_output += "<td><input id='input_Upper_Bound_" + var_entry.replace(/\s/g, '_') + "' onfocusout='bound_input_group(\"" + var_entry + "\", \"Upper\", this)' onchange='ValidateInput(this, \"number\", \"" + var_entry + "\")' class='bound_input' type='text' value='" + upper_value + "' placeholder='Upper Bound'/></td>"; // Upper bound
        // table_output += "<td><input type='text' value='' class='bound_input' placeholder='Upper Bound' name='Upper_Bound' id='input_Upper_Bound_" + var_entry.replace(/\s/g, '_') + "' onfocusin='record_table()' oninput='Parameter_Memory(this,\"" + var_entry + "\")' onchange='ValidateInput(this, \"number\", \"" + var_entry + "\")' onfocusout='bound_input_group(\"" + var_entry + "\", \"Upper\", this)'></td>"; // Upper bound
        table_output += "</tr>";
      }
    }
    table_output += "</table>";
    $('#myModal6').find('.modal-body ul').append(table_output);
  }
  if (!initial_sequence) {
    $('#myModal6').find('.modal-footer').html('<button type="button" class="btn btn-default" data-dismiss="modal" onclick="edit_window_closed();">Close</button>');
  }
  return is_table_not_empty;
}

// Stores metadata in memory
function parameter_memory_flexible (parameter_name, parameter_value, variable) {
 	 inputted_metadata[variable][column_index[parameter_name]] = parameter_value;
};

function bound_input_group (changed_var, lower_upper_type, field) {
  // if changed variable is part of a group
  var bound_input_value = field.value;
  if (dict_var_bounds[changed_var]) {
    // loop through all variables
    for (var n = 0; n < uni_variable_list.length; n++) {
      var current_var_name = uni_variable_list[n];
      // Check if part of selected currently active group
      if (dict_var_bounds[current_var_name]) {
        document.getElementById("input_" + lower_upper_type + "_Bound_" + current_var_name.replace(/\s/g, '_')).value = bound_input_value;
        if (!(current_var_name in bound_data_stored)) {
          bound_data_stored[current_var_name] = {};
        }
        bound_data_stored[current_var_name][lower_upper_type] = bound_input_value;
        // parameter_memory_flexible(lower_upper_type + "_Bound", bound_input_value, current_var_name);
      }
    }
  } else {
    // for single variable change only
    document.getElementById("input_" + lower_upper_type + "_Bound_" + changed_var.replace(/\s/g, '_')).value = bound_input_value;
    if (!(changed_var in bound_data_stored)) {
      bound_data_stored[changed_var] = {};
    }
    bound_data_stored[changed_var][lower_upper_type] = bound_input_value;
    // parameter_memory_flexible(lower_upper_type + "_Bound", bound_input_value, changed_var);
  }
  console.log(bound_data_stored);
}

function select_bounds_group (variable) {
  dict_var_bounds[variable] = true;
  document.getElementById("var_selectable_" + variable.replace(/\s/g, '_')).setAttribute('class', 'var_selected var_bound_text');
  document.getElementById("var_selectable_" + variable.replace(/\s/g, '_')).setAttribute('onclick', 'unselect_bounds_group("' + variable + '")');
}

function unselect_bounds_group (variable) {
  dict_var_bounds[variable] = false;
  document.getElementById("var_selectable_" + variable.replace(/\s/g, '_')).setAttribute('class', 'var_selectable var_bound_text');
  document.getElementById("var_selectable_" + variable.replace(/\s/g, '_')).setAttribute('onclick', 'select_bounds_group("' + variable + '")');
}

function check_group_types(variable) {
	var varlist = grouped_var_dict[variable];
	var all_types_selected = true;
	var v;
	var type_chosen = {};
	for(var i=0; i < varlist.length; i++){
		v = varlist[i];
		// type = document.getElementById('variable_type_' + v + '_group_'+variable).value;
    type = types_for_vars[v];
		type_chosen[v] = type;
		if(type == 'default'){
			all_types_selected = false;
		}
	}
	if(all_types_selected){
		type_selected(type_chosen, variable);
	}
// type_selected(document.getElementById('variable_type_' + subtype + '_group_'+variable).value, subtype);
}

function select_bound_vars () {
  document.getElementById("all_vars_button").innerHTML = 'Deselect All';
  document.getElementById("all_vars_button").setAttribute('onclick', 'deselect_bound_vars()');
  for (var i = 0; i < uni_variable_list.length; i++) {
    if (types_for_vars[uni_variable_list[i]] == "Numerical") {
      select_bounds_group(uni_variable_list[i]);
    }
  }
}

function deselect_bound_vars () {
  document.getElementById("all_vars_button").innerHTML = 'Select All';
  document.getElementById("all_vars_button").setAttribute('onclick', 'select_bound_vars()');
  for (var i = 0; i < uni_variable_list.length; i++) {
    if (types_for_vars[uni_variable_list[i]] == "Numerical") {
      unselect_bounds_group(uni_variable_list[i]);
    }
  }
}

/* Modal for Bin Names */
function generate_modal7 () {
  $('#myModal7').find('.modal-body ul').html("");
  var is_table_not_empty = false;
  for (var n = 0; n < uni_variable_list.length; n++) {
    var var_entry = uni_variable_list[n];
    if (types_for_vars[var_entry] == "Categorical") {
      is_table_not_empty = true;
    }
  }
  if (!is_table_not_empty) {
    $('#myModal7').find('.modal-body ul').append("There are no categorical variables in this dataset.");
  } else {
    var table_output = "";
    table_output += "<table style='table-layout: fixed;'>";
    // select/deselect all button
    table_output += "<tr><td><button class='bounds_all_button' id='all_vars_button_bins' onclick='select_bins_vars()'>Select All</button></td><td></td><td></td></tr>";
    table_output += "<tr><td><b>Variable</b></td><td></td><td><b>Bin Names</b></td></tr>"; // Header
    var is_table_not_empty = false;
    for (var n = 0; n < uni_variable_list.length; n++) {
      var var_entry = uni_variable_list[n];
      if (types_for_vars[var_entry] == "Categorical") {
        is_table_not_empty = true;
        table_output += "<tr>";
        table_output += "<td class='var_selectable var_bound_text' id='var_selectable_" + var_entry.replace(/\s/g, '_') + "_bins' onclick='select_bins_group(\"" + var_entry + "\")'>" + var_entry + "</td>"; // Variable button
        table_output += "<td class='bound_buffer'></td>";
        var stored_bins = "";
        if (var_entry in bins_data_stored) {
          stored_bins = bins_data_stored[var_entry];
        }
        // <button class='btn btn-primary' type='button' data-toggle='button' aria-pressed='false'>" + var_entry + "</button>
        table_output += "<td><input style='width: 200px;' id='input_Bin_Names_" + var_entry.replace(/\s/g, '_') + "' onfocusout='bins_input_group(\"" + var_entry + "\", this)' onchange='ValidateInput(this, \"none\", \"" + var_entry + "\")' class='bound_input' value='" + stored_bins + "' type='text' placeholder='Optional but recommended'/></td>";
        table_output += "</tr>";
      }
    }
    table_output += "</table>";
    $('#myModal7').find('.modal-body ul').append(table_output);
  }
  if (!initial_sequence) {
    $('#myModal7').find('.modal-footer').html('<button type="button" class="btn btn-default" data-dismiss="modal" onclick="edit_window_closed();">Close</button>');
  }
  return is_table_not_empty;
}

function bins_input_group (changed_var, field) {
  // if changed variable is part of a group
  var bins_input_value = field.value;
  if (dict_var_bins[changed_var]) {
    // loop through all variables
    for (var n = 0; n < uni_variable_list.length; n++) {
      if (types_for_vars[uni_variable_list[n]] == "Categorical") {
        var current_var_name = uni_variable_list[n];
        // Check if part of selected currently active group
        if (dict_var_bins[current_var_name]) {
          document.getElementById("input_Bin_Names_" + current_var_name.replace(/\s/g, '_')).value = bins_input_value;
          bins_data_stored[current_var_name] = bins_input_value;
        }
      }
    }
  } else {
    // for single variable change only
    document.getElementById("input_Bin_Names_" + changed_var.replace(/\s/g, '_')).value = bins_input_value;
    bins_data_stored[changed_var] = bins_input_value;
  }
}


function select_bins_group (variable) {
  dict_var_bins[variable] = true;
  document.getElementById("var_selectable_" + variable.replace(/\s/g, '_') + "_bins").setAttribute('class', 'var_selected var_bound_text');
  document.getElementById("var_selectable_" + variable.replace(/\s/g, '_') + "_bins").setAttribute('onclick', 'unselect_bins_group("' + variable + '")');
}

function unselect_bins_group (variable) {
  dict_var_bins[variable] = false;
  document.getElementById("var_selectable_" + variable.replace(/\s/g, '_') + "_bins").setAttribute('class', 'var_selectable var_bound_text');
  document.getElementById("var_selectable_" + variable.replace(/\s/g, '_') + "_bins").setAttribute('onclick', 'select_bins_group("' + variable + '")');
}

function select_bins_vars () {
  document.getElementById("all_vars_button_bins").innerHTML = 'Deselect All';
  document.getElementById("all_vars_button_bins").setAttribute('onclick', 'deselect_bins_vars()');
  for (var i = 0; i < uni_variable_list.length; i++) {
    if (types_for_vars[uni_variable_list[i]] == "Categorical") {
      select_bins_group(uni_variable_list[i]);
    }
  }
}

function deselect_bins_vars () {
  document.getElementById("all_vars_button_bins").innerHTML = 'Select All';
  document.getElementById("all_vars_button_bins").setAttribute('onclick', 'select_bins_vars()');
  for (var i = 0; i < uni_variable_list.length; i++) {
    if (types_for_vars[uni_variable_list[i]] == "Categorical") {
      unselect_bins_group(uni_variable_list[i]);
    }
  }
}

function update_modal_progress(current_modal) {
  document.getElementById("progress-modal-bar").style.width = 100 * (current_modal / number_of_modals) + "%";
}

function hide_modal_progress() {
  document.getElementById("progress-modal").setAttribute("class", "progress_modal_hidden");
  initial_sequence = false;
}

// Enables Collapsable Sections for JS Generated HTML
function accordion (bubble) {
    var variable = bubble.id.slice(10, bubble.id.length);
    if (bubble.className == "accordion") {
        bubble.className = "accordion active";
        document.getElementById("panel_" + variable).className = "panel show";
    }
    else {
        bubble.className = "accordion";
        document.getElementById("panel_" + variable).className = "panel";
    };
};

// Generates html based on statistics choosen
function parameter_fields (variable, type_chosen) {
	if(variable in grouped_var_dict){
		multivar_parameter_fields(variable, type_chosen);
	}
	else{
		eval("var pparameter = " + type_chosen + "_stat_list;");
		eval("var ppparameter = " + type_chosen + "_stat_parameter_list;");

		var needed_parameters = [];
		for (var i = 0; i < ppparameter.length; i++) {
			if (inputted_metadata[variable][column_index[pparameter[i].replace(/\s/g, '_')]] > 0) {
				needed_parameters = needed_parameters.concat(rfunctions.rfunctions[ppparameter[i].rfunctions_index].statistic_type[ppparameter[i].parameter_index].parameter);
			}
			else {}
		};
		needed_parameters = needed_parameters.unique();
		// makes blank html text
		var parameter_field = "<table>";
		if(needed_parameters.length > 0){
			parameter_field+="<div><p><span style='color:blue;line-height:1.1;display:block; font-size:small'>The selected statistic(s) require the metadata fields below. Fill these in with reasonable estimates that a knowledgeable person could make without having looked at the raw data. <b>Do not use values directly from your raw data as this may leak private information</b>. Click <button type='button' class='manualinfo' data-load-url='" + CONTENT_PAGES_BASE_URL + "psiIntroduction.html' data-toggle='modal' data-target='#myModal' data-id='metadata' onclick='generate_modalinfo()' style='padding-left:0'><u>here for more information.</u></button></span></p></div>";
		}

    if (variable in bound_data_stored) {
      record_table();
      if ("Lower" in bound_data_stored[variable]) {
        parameter_memory_flexible("Lower_Bound", bound_data_stored[variable]["Lower"], variable);
        ValidateInput(document.getElementById("input_Lower_Bound_" + variable), null, variable);
      }
      if ("Upper" in bound_data_stored[variable]) {
        parameter_memory_flexible("Upper_Bound", bound_data_stored[variable]["Upper"], variable);
        ValidateInput(document.getElementById("input_Upper_Bound_" + variable), null, variable);
      }
    }

    if (variable in bins_data_stored) {
      record_table();
      parameter_memory_flexible("Bin_Names", bins_data_stored[variable], variable);
    }
		// uses .unique() to get all unique values and iterate through
		for (var j = 0; j < needed_parameters.length; j++) {
		  // creates html list in .sort() (alphabet order)
		  // parameter_field += "<span title='" + rfunctions.parameter_info[metadata_list.indexOf(needed_parameters[j].replace(/\s/g, '_'))].pinfo + "'>" + needed_parameters[j] + ":</span> <input type='text' value='" + inputted_metadata[variable][column_index[needed_parameters[j].replace(/\s/g, '_')]] + "' name='" + needed_parameters[j].replace(/\s/g, '_') + "'id='input_" + needed_parameters[j].replace(/\s/g, '_') + "_" + variable + "' onfocusin='record_table()' oninput='Parameter_Memory(this,\"" + variable + "\")' onfocusout='ValidateInput(this, \"" + rfunctions.parameter_info[metadata_list.indexOf(needed_parameters[j].replace(/\s/g, '_'))].entry_type + "\", \"" + variable + "\");'><br>";

      // parameter_field += "<tr><td style='width:150px;vertical-align:middle;'><span title='" + rfunctions.parameter_info[metadata_list.indexOf(needed_parameters[j].replace(/\s/g, '_'))].pinfo + "'>" + needed_parameters[j] + ":</span></td><td style='vertical-align:middle;'>";
      console.log(needed_parameters[j].replace(/\s/g, '_') + '_help');
      parameter_field += "<tr><td style='width:150px;vertical-align:middle;'><span onclick='display_help_id(\"" + needed_parameters[j].replace(/\s/g, '_') + '_help' + "\")' style='cursor:help;'>" + needed_parameters[j] + ":</span></td><td style='vertical-align:middle;'>";

		  if (rfunctions.parameter_info[metadata_list.indexOf(needed_parameters[j].replace(/\s/g, '_'))].input_type == "text") {
        if (needed_parameters[j].replace(/\s/g, '_') == "Bin_Names") {
    			parameter_field += "<input type='text' value='" + inputted_metadata[variable][column_index[needed_parameters[j].replace(/\s/g, '_')]] + "' name='" + needed_parameters[j].replace(/\s/g, '_') + "'id='input_" + needed_parameters[j].replace(/\s/g, '_') + "_" + variable + "' onfocusin='record_table()' oninput='Parameter_Memory(this,\"" + variable + "\")' onchange='ValidateInput(this, \"" + rfunctions.parameter_info[metadata_list.indexOf(needed_parameters[j].replace(/\s/g, '_'))].entry_type + "\", \"" + variable + "\")' placeholder='Optional but recommended'></td></tr>";
        } else {
    			parameter_field += "<input type='text' value='" + inputted_metadata[variable][column_index[needed_parameters[j].replace(/\s/g, '_')]] + "' name='" + needed_parameters[j].replace(/\s/g, '_') + "'id='input_" + needed_parameters[j].replace(/\s/g, '_') + "_" + variable + "' onfocusin='record_table()' oninput='Parameter_Memory(this,\"" + variable + "\")' onchange='ValidateInput(this, \"" + rfunctions.parameter_info[metadata_list.indexOf(needed_parameters[j].replace(/\s/g, '_'))].entry_type + "\", \"" + variable + "\")'></td></tr>";
        }
		  }
		  else if (rfunctions.parameter_info[metadata_list.indexOf(needed_parameters[j].replace(/\s/g, '_'))].input_type == "multiple_choice_with_other_variables") {
			parameter_field +=
			  "<select name='" + needed_parameters[j].replace(/\s/g, '_') + "' id='input_" + needed_parameters[j].replace(/\s/g, '_') + "_" + variable + "' onchange='record_table(); Parameter_Memory(this,\"" + variable + "\"); ValidateInput(this, \"" + rfunctions.parameter_info[metadata_list.indexOf(needed_parameters[j].replace(/\s/g, '_'))].entry_type + "\", \"" + variable + "\");'>" +
				"<option value=''>---</option>";

			for (var n = 0; n < variable_list.length; n++) {
			  if (variable_list[n].replace(/\s/g, '_') != variable.replace(/\s/g, '_')) {
				if (variable_list[n].replace(/\s/g, '_') != variable.replace(/\s/g, '_')) {
				  if (variable_list[n].replace(/\s/g, '_') == inputted_metadata[variable][column_index[needed_parameters[j].replace(/\s/g, '_')]]) {
					parameter_field += "<option value='" + variable_list[n].replace(/\s/g, '_') + "' selected='selected'>" + variable_list[n] + "</option>";
				  }
				  else {
					parameter_field += "<option value='" + variable_list[n].replace(/\s/g, '_') + "'>" + variable_list[n] + "</option>";
				  }
				};
			  };
			};

			 parameter_field +=
			  "</select></td></tr>";
		  }
		}

    		var missing_field = make_missing_field(variable, type_chosen);

    document.getElementById('necessary_parameters_' + variable).innerHTML = parameter_field + '</table>';
   	document.getElementById('missing_data_' + variable).innerHTML = missing_field;

    }
};



//returns metadata needed for set of statistics for variable of given type (for multivar stats)
function get_needed_parameters(statlist, type){
	var needed_params = [];
	// For multivariate regression, categorical types should be treated as numbers hence the line below. Find a better fix in the future.
	// if(type == "Categorical"){  // messes with detecting when ready to send. Fix
// 		type = "Numerical";
// 	}
	for(var i=0; i<statlist.length; i++){
		var stat = statlist[i];
		var required_params = rfunctions.rfunctions[statistic_list.indexOf(stat)].type_params_dict[type];
		for(var j=0; j<required_params.length; j++){
			needed_params.push(required_params[j]);
		}
	}
	return needed_params.unique();
}
// note this system assumes that all requirements apply to all general variables. Might want to make more flexible for some multivar stats.
function make_selection_with_reqs(variable, reqlist){
	var varlist = grouped_var_dict[variable];
	var typedict = inputted_metadata[variable][column_index["Variable_Type"]];
	var returnlist = [];
	for(var i=0; i<varlist.length; i++){
		var canAdd = true;
		var v = varlist[i];
		for(var j=0; j<reqlist.length; j++){
			var req = reqlist[j];
			if(req == "outcome_non_categorical"){
				if(typedict[v] == "Categorical"){
					canAdd = false;
				}
			}
			else if(req == "outcome_boolean"){
				if(typedict[v] != "Boolean"){
					canAdd = false;
				}
			}
		}
		if(canAdd){
			returnlist.push(v);
		}
	}
	return returnlist;
}

function make_mult_with_reqs(variable, param, reqlist){
	var varlist = grouped_var_dict[variable];
	var parameter_field =
			  "<select name='" + param + "' id='input_" + param + "_" + variable + "' onchange='record_table(); Parameter_Memory(this,\"" + variable + "\",\""+"General"+"\"); ValidateInput(this, \"" + rfunctions.parameter_info[metadata_list.indexOf(param)].entry_type + "\", \"" + variable + "\");'>" +
			"<option value=''>Please select a variable</option>";
	var addlist = make_selection_with_reqs(variable, reqlist);
	for (var n = 0; n < addlist.length; n++) {
		var v = addlist[n];
		  if (v == inputted_metadata[variable][column_index[param]]["General"]) {
			parameter_field += "<option value='" + v.replace(/\s/g, '_') + "' selected='selected'>" + v + "</option>";
		  }
		  else {
			parameter_field += "<option value='" + v.replace(/\s/g, '_') + "'>" + v + "</option>";
		  }
		}
		parameter_field += "</select></td></tr><br>";
		return parameter_field;
	}

function multivar_parameter_fields(variable){
	var parameter_field ="<div><p><span style='color:blue;line-height:1.1;display:block; font-size:small'>The selected statistic(s) require the metadata fields below. Fill these in with reasonable estimates that a knowledgeable person could make without having looked at the raw data. <b>Do not use values directly from your raw data as this may leak private information</b>. Click <button type='button' class='manualinfo' data-load-url='" + CONTENT_PAGES_BASE_URL + "psiIntroduction.html' data-toggle='modal' data-target='#myModal' data-id='statistics' onclick='generate_modalinfo()' style='padding-left:0'><u>here for more information.</u></button></span></p></div>";
	var varlist = grouped_var_dict[variable];
	var typedict = inputted_metadata[variable][column_index["Variable_Type"]];
	var statlist = [];
	for(var i=0; i<multivar_stat_list.length; i++){
		var stat = multivar_stat_list[i];
		var id = stat + "_" + variable;
		 if ($("#" + id).prop('checked')) {
			statlist.push(stat);
		}

	}
	//display general metadata first (not tied to a specific variable)
	var general_paramlist = get_needed_parameters(statlist, "General");
	// for(var k=0; k<statlist.length; k++){
// 		var stat = statlist[k];
// 		var general_paramlist = rfunctions.rfunctions[statistic_list.indexOf(stat)].type_params_dict["General"];
// 		var gen_stat = statlist[k];
		if(general_paramlist.length > 0){
			//parameter_field += "<br><div><p><span display:block; >"+gen_stat+":</span></p></div>";
			parameter_field += "<table>";
			for(var i=0; i<general_paramlist.length; i++){
				var gen_param_no_underscore = general_paramlist[i];
				var gen_param = gen_param_no_underscore.replace(/\s/g, '_');
				var gen_default_value = inputted_metadata[variable][column_index[gen_param]]["General"];

        // parameter_field += "<tr><td style='width:150px;vertical-align:middle;'><span title='" + rfunctions.parameter_info[metadata_list.indexOf(gen_param)].pinfo + "'>" + gen_param_no_underscore+ ": </span></td><td style='vertical-align:middle;'>";
        parameter_field += "<tr><td style='width:150px;vertical-align:middle;'><span onclick='display_help(\"" + rfunctions.parameter_info[metadata_list.indexOf(gen_param)].pinfo + "\")' style='cursor:help;'>" + gen_param_no_underscore+ ": </span></td><td style='vertical-align:middle;'>";

				if(rfunctions.parameter_info[metadata_list.indexOf(gen_param)].input_type == "text"){
					parameter_field += "<input type='text' value='" + gen_default_value + "' name='" + gen_param + "'id=General_input_" + gen_param + "_" + variable + "' onfocusin='record_table()' oninput='Parameter_Memory(this,\"" + variable + "\",\""+"General"+"\")' onchange='ValidateInput(this, \"" + rfunctions.parameter_info[metadata_list.indexOf(gen_param)].entry_type + "\", \"" + variable + "\",\""+"General"+"\")'></td></tr>";
			  	}
			  	else if(rfunctions.parameter_info[metadata_list.indexOf(gen_param)].input_type == "multiple_choice_from_group_with_reqs"){
			  		var reqlist = [];
			  		for(var q=0; q<statlist.length; q++){
			  			for(var p=0; p< rfunctions.rfunctions[statistic_list.indexOf(statlist[q])].requirements.length; p++){
			  				reqlist.push(rfunctions.rfunctions[statistic_list.indexOf(statlist[q])].requirements[p]);
			  			}
			  		}
			  		reqlist = reqlist.unique();
			  		var next_parameter_field = make_mult_with_reqs(variable, gen_param, reqlist);
			  		parameter_field += next_parameter_field;
			  	}
			}
		}
	//}
	parameter_field += "</table>";
	for(var i=0; i<varlist.length; i++){
 		var v = varlist[i]
 		var paramlist = get_needed_parameters(statlist, typedict[v])
 		if(paramlist.length > 0){
			parameter_field += "<br><div><p><span display:block; >"+v+":</span></p></div>";
			parameter_field += "<table>";
			for(var j=0; j<paramlist.length; j++){
				var param_no_underscore = paramlist[j];
				var param = paramlist[j].replace(/\s/g, '_');
				// parameter_field += "<tr><td style='width:150px;vertical-align:middle;'><span title='" + rfunctions.parameter_info[metadata_list.indexOf(param)].pinfo + "'>" + param_no_underscore + ":</span></td><td style='vertical-align:middle;'>";
        parameter_field += "<tr><td style='width:150px;vertical-align:middle;'><span onclick='display_help_id(\"" + param + "_help\")' style='cursor:help;'>" + param_no_underscore + ":</span></td><td style='vertical-align:middle;'>";
				if (rfunctions.parameter_info[metadata_list.indexOf(param)].input_type == "text") {
				//prepopulate if already given
				var default_val = inputted_metadata[variable][column_index[param]][v];
				if(typeof inputted_metadata[v] != 'undefined' && default_val == ""){
					default_val = inputted_metadata[v][column_index[param]];
					var parameter = new Object();
					parameter.name = param;
					parameter.value = default_val;
					record_table();
					Parameter_Memory(parameter, variable, v);
					ValidateInput(parameter, rfunctions.parameter_info[metadata_list.indexOf(param)].entry_type, variable, v);
				}
				if(rfunctions.parameter_info[metadata_list.indexOf(param)].input_type == "text"){
              if (param == "Bin_Names") {
                parameter_field += "<input type='text' value='" + default_val + "' name='" + param + "'id="+v+"_input_" + param + "_" + variable + "' onfocusin='record_table()' oninput='Parameter_Memory(this,\"" + variable + "\",\""+v+"\")' onchange='ValidateInput(this, \"" + rfunctions.parameter_info[metadata_list.indexOf(param)].entry_type + "\", \"" + variable + "\",\""+v+"\")' placeholder='Optional but recommended'></td></tr>";
              } else if (param == "Correlation") {
                // hard code correlation as 0.3 for nowrap
                parameter_field += "<input type='text' value='" + 0.3 + "' name='" + param + "'id="+v+"_input_" + param + "_" + variable + "' onfocusin='record_table()' oninput='Parameter_Memory(this,\"" + variable + "\",\""+v+"\")' onchange='ValidateInput(this, \"" + rfunctions.parameter_info[metadata_list.indexOf(param)].entry_type + "\", \"" + variable + "\",\""+v+"\")'></td></tr>";
              } else {
    					parameter_field += "<input type='text' value='" + default_val + "' name='" + param + "'id="+v+"_input_" + param + "_" + variable + "' onfocusin='record_table()' oninput='Parameter_Memory(this,\"" + variable + "\",\""+v+"\")' onchange='ValidateInput(this, \"" + rfunctions.parameter_info[metadata_list.indexOf(param)].entry_type + "\", \"" + variable + "\",\""+v+"\")'></td></tr>";
            }
			  	}
			  	else if(rfunctions.parameter_info[metadata_list.indexOf(param)].input_type == "multiple_choice_from_group_with_reqs"){
			  		var reqlist = [];
			  		for(var q=0; q<statlist.length; q++){
			  			for(var p=0; p< rfunctions.rfunctions[statistic_list.indexOf(statlist[q])].requirements.length; p++){
			  				reqlist.push(rfunctions.rfunctions[statistic_list.indexOf(statlist[q])].requirements[p]);
			  			}
			  		}
			  		reqlist = reqlist.unique();
			  		var next_parameter_field = make_mult_with_reqs(variable, gen_param, reqlist);
			  		parameter_field += next_parameter_field;
			  	}
			  }
			  //what to do about missing data
			}
			parameter_field += "</table>";
		}
 	}
 	 document.getElementById('necessary_parameters_' + variable).innerHTML = parameter_field;
 }



function make_missing_field(variable, type_chosen){
	var options;
    if(type_chosen == "Numerical"){
        options = "<option value='random_value' title='Missing values are replaced with uniformly random numbers from the range of the variable'>Random value</option><option value='fixed_value' title='Missing values are all replaced with the same number'>Fixed value</option><option value='custom_range' title='Missing values are replaced with uniformly random numbers from a custom range'>Custom range";
    }
    else if(type_chosen == "Categorical"){
       // disabling fixed bin for now
       //  options = "<option value='separate_bin' title='Missing values are treated as their own category'>Separate bin</option><option value='random_value' title='Missing values are replaced with uniformly random bins'>Random bin</option><option value='fixed_value' title='Missing values are all replaced with the same bin'>Fixed bin";
   	   // only allowing random bin or separate bin
   	    options = "<option value='separate_bin' title='Missing values are treated as their own category'>Separate bin</option><option value='random_value' title='Missing values are replaced with uniformly random bins'>Random bin</option>";
    }
     else if(type_chosen == "Boolean"){
   		 options = "<option value='random_value' title='Missing values are replaced with uniformly random bins'>Random bin</option><option value='separate_bin' title='Missing values are treated as their own category'>Separate bin</option>";
    }

    missing_field = "<table><tr><td style='width:150px;vertical-align:middle;'><span>Missing Values:</span></td><td style='vertical-align:middle;'><select onchange=missing_change(this,\"" + variable + "\",\""+type_chosen+"\");>"+options+"<\select></td></tr>"
     +"<tr id='missing_input_row' style='display:none;'><td style='width:150px;vertical-align:middle;'><span id='missing_input_prompt'>Enter value:</span></td><td style='vertical-align:middle;'><input name= 'Missing_Input' type='text' id='missing_input_"+variable+"' onfocusin='record_table()' oninput='Parameter_Memory(this,\"" + variable + "\")'></input></td></tr></table>";

	return(missing_field);
}

function missing_change(val, variable,type_chosen){
	var val = val.value;
	if(type_chosen == "Boolean" && val == "separate_bin"){
		alert("Opting to put missing values in a separate bin will release a histogram of counts (0,1, and NA) rather than a mean.");
	}
	if(val == "fixed_value"){
		document.getElementById('missing_input_row').style.display = 'table-row';
		document.getElementById('missing_input_prompt').innerHTML = 'Enter fixed value:';
	}
	else if(val == "custom_range"){
		document.getElementById('missing_input_row').style.display = 'table-row';
		document.getElementById('missing_input_prompt').innerHTML = 'Enter custom range:';
	}
	else {
		document.getElementById('missing_input_row').style.display = 'none';
		document.getElementById('missing_input_prompt').innerHTML = '';
	}
	record_table();

	inputted_metadata[variable][column_index["Missing_Type"]] = val;
	inputted_metadata[variable][column_index["Missing_Input"]] = "";
	document.getElementById('missing_input_'+variable).value = "";

	console.log(inputted_metadata[variable][column_index["Missing_Type"]])
}
// Produce parameter fields
// http://www.w3schools.com/jsref/tryit.asp?filename=tryjsref_oninput
function Parameter_Populate (stat, stat_index, variable, type_chosen) {
    previous_inputted_metadata = JSON.parse(JSON.stringify(inputted_metadata));

    // checks if thing is checked
    if ($("#" + stat.id).prop('checked')) {
        // Updating the master data-array
        inputted_metadata[variable][column_index[stat.name]] = 1;
        // In case zero parameters needed
        epsilon_table_validation(variable, "undefined");
        // calls the parameter HTML generating function
        parameter_fields(variable, type_chosen);
    }

    // if not checked
    else {
        // splice.() help: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_fobjects/Array/splice
        // index() help: https://api.jquery.com/index/

        // Updating the master data-array
        inputted_metadata[variable][column_index[stat.name]] = 0;
        inputted_metadata[variable][column_index["epsilon_" + stat.name]] = "";
        inputted_metadata[variable][column_index["accuracy_" + stat.name]] = "";
        inputted_metadata[variable][column_index["hold_" + stat.name]] = 0;

        if (areAllHeld1()) {
          inputted_metadata = JSON.parse(JSON.stringify(previous_inputted_metadata));
          $("#" + stat.id).prop('checked', true)
          alert("Deselecting stat would result in all held statistics. Try removing some holds before deselecting stat.")
        }
        else {
        // Updates epsilon table
        if (previous_inputted_metadata[variable][column_index[stat.name]] == 2) {
            console.log("talk to r bc a statistics was removed");
            talktoR();
        }

        // calls the parameter HTML generating function
        	parameter_fields(variable, type_chosen);
      }
    }
    if(first_stat_selected && tutorial_mode && type_chosen!="Boolean"){
		hopscotch.endTour(true);
		var tour_content =  "To see a description of possible metadata, click the link in the blue text above. When you have finished filling in the required metadata, hit tab, enter, or click anywhere outside the entry box to add your statistic.";
		var tour_target = "necessary_parameters_" + variable;
		var stat_selected_tour = {
		  "id": "metadata_tour",
		   "i18n": {
			"doneBtn":'Ok'
		  },
		  "steps": [
			{
			  "target": tour_target,
			  "placement": "bottom",
			  "title": "Fill in the requested metadata",
			  "content": tour_content,
			  "showCTAButton":true,
			  "ctaLabel": "Disable these messages",
			  "onCTA": function() {
				hopscotch.endTour(true);
				tutorial_mode = false;
			  },
			}
		  ],
		  "showCloseButton":false,
		  "scrollDuration": 300,
		  "onEnd":  function() {
			   first_stat_selected = false;
			  },
		};
		hopscotch.startTour(stat_selected_tour);
        console.log(previous_inputted_metadata);
    }
};

// Stores metadata in memory
function Parameter_Memory (parameter, variable, specific_var) {
	if(variable in grouped_var_dict){
	  inputted_metadata[variable][column_index[parameter.name]][specific_var] = parameter.value;
	}
	else{
   	 inputted_metadata[variable][column_index[parameter.name]] = parameter.value;
     // add to the other copy for bound data storage specifically
     if (parameter.name == "Lower_Bound") {
       if (!(variable in bound_data_stored)) {
         bound_data_stored[variable] = {};
       }
       bound_data_stored[variable]["Lower"] = parameter.value;
     } else if (parameter.name == "Upper_Bound") {
       if (!(variable in bound_data_stored)) {
         bound_data_stored[variable] = {};
       }
       bound_data_stored[variable]["Upper"] = parameter.value;
     }
   	}
    // add to other copy for bin names storage
    if (parameter.name == "Bin_Names") {
      bins_data_stored[variable] = parameter.value;
    }
};

function newtransform(x) {
    var formula = x.value
    x.value=""

    if(!formula)
        return

    var base_name = formula.split(/[ =<]/)[0]
    var name = base_name

    // an empty object means "success"
    function newtransSuccess(json) {
        console.log(json)
        if(!variable_list.includes(name)) {
            variable_list.push(name)
            transforms_data[name] = {formula: formula, ok: true}
            add_variable_to_sidebar(name)
            uni_variable_list.push(name);        // add variable to list of variables for which metadata can be stored
            // TODO look into what this replace is
            document.getElementById("selection_sidebar_" + name.replace(/\s/g, '_')).style.cssText = variable_selected_class;
            activate_variable(name)
        }
        // TODO this will be unfriendly if the server is slow
        else newtransFailure ("Name in use!")
    }

    function newtransFailure(warning) {
        alert(warning)
    }
	//disable ifelse statements in transformer
	if(formula.indexOf('ifelse') !== -1){
		alert("TransformeR does not currently support if else statements.");
	}
	else{
    var jsonout = JSON.stringify({formula: formula, names: variable_list})

    console.log(jsonout)
    // urlcall = rappURL+"verifyTransformapp";
    urlcall = FLASK_SVC_URL + "verifyTransform.app";
    console.log("urlcall out: ", urlcall);
    makeCorsRequest(urlcall, newtransSuccess, newtransFailure, jsonout);
    }
}

function generateTransform() {
    keys = Object.keys(transforms_data)
    if(keys.length == 0)
        return undefined;
    ret = transforms_data[keys[0]].formula
    for (i = 1; i < keys.length; i++) {
        ret += ";" + transforms_data[keys[i]].formula
    }
    return ret;
}




function Validation (valid_entry, entry) {
    if (valid_entry == "none") {
        return "true";
    }

    if (valid_entry == "general_text") {
        if (!entry.match(/^[a-zA-Z0-9]+$/)) {
            alert("Invalid entry. Entry can only contain numbers and letters only!");
            return "false";
        }
    }

    if (valid_entry == "text_only") {
        if (!entry.match(/^[a-zA-Z]+$/)) {
            alert("Invalid entry. Entry can only contain letters only!");
            return "false";
        }
    }

    if (valid_entry == "pos_decimal") {
        if (!entry.match(/^[+]?[0-9]*[.]{1}[0-9]+$/)) {
            alert("Invalid entry. Entry can only be positive decimals!");
            return "false";
        }
    }

    if (valid_entry == "neg_decimal") {
        if (!entry.match(/^[-]{1}[0-9]*[.]{1}[0-9]+$/)) {
            alert("Invalid entry. Entry can only be negative decimals. Must have negative sign (-) in front!");
            return "false";
        }
    }

    if (valid_entry == "decimal") {
        if (!entry.match(/^[+-]?[0-9]*[.]{1}[0-9]+$/)) {
            alert("Invalid entry. Entry can only be decimals!");
            return "false";
        }
    }

    if (valid_entry == "pos_integer") {
        if (!entry.match(/^[+]?[0-9]+$/)) {
            alert("Invalid entry. Entry can only be positive integer!");
            return "false";
        }
    }

    if (valid_entry == "neg_integer") {
        if (!entry.match(/^[-]{1}[0-9]+$/)) {
            alert("Invalid entry. Entry can only be negative integer. Must have negative sign (-) in front!");
            return "false";
        }
    }

    if (valid_entry == "integer") {
        if (!entry.match(/^[+-]?[0-9]+$/)) {
            alert("Invalid entry. Entry can only be integers!");
            return "false";
        }
    }

    if (valid_entry == "pos_number") {
        if (!(entry.match(/^[+]?[0-9]+[.]?$/) || entry.match(/^[+]?[0-9]*[.]{1}[0-9]+$/))) {
            alert("Invalid entry. Entry can only be positive numbers!");
            return "false";
        }
    }

    if (valid_entry == "neg_number") {
        if (!(entry.match(/^[-]{1}[0-9]+[.]?$/) || entry.match(/^[-]{1}[0-9]*[.]{1}[0-9]+$/))) {
            alert("Invalid entry. Entry can only be negative numbers!");
            return "false";
        }
    }

    if (valid_entry == "number") {
        if (!(entry.match(/^[+-]?[0-9]+[.]?$/) || entry.match(/^[+-]?[0-9]*[.]{1}[0-9]+$/))) {
            alert("Invalid entry. Entry can only be numbers!");
            return "false";
        }
    }
};







// Regex: http://www.w3schools.com/jsref/jsref_obj_regexp.asp
// Validate form based on entry_type info
function ValidateInput (input, valid_entry, variable, univar) {
    // Actual input validation
    // if variable is a grouped variable, univar contains the single variable that was just edited
    if (!input) return;
    var entry = input.value;

    if (entry == "") {
        epsilon_table_validation(variable, input);
        return false;
    }

    if (Validation(valid_entry, entry) == "false") {
    	if(variable in grouped_var_dict){
        if (variable in inputted_metadata) {
    		  inputted_metadata[variable][column_index[input.name]][univar] = previous_inputted_metadata[variable][column_index[input.name]][univar];
        	input.value = inputted_metadata[variable][column_index[input.name]][univar];
        } else {
          input.value = "";
        }

    	}
    	else{
        if (variable in inputted_metadata) {
        	inputted_metadata[variable][column_index[input.name]] = previous_inputted_metadata[variable][column_index[input.name]];
        	input.value = inputted_metadata[variable][column_index[input.name]];
        } else {
          input.value = "";
        }
        }
    }

    epsilon_table_validation(variable, input);
};




// Epsilon Table Validation
function epsilon_table_validation (variable, input) {
	if(variable in grouped_var_dict){
		multivar_epsilon_table_validation(variable, input);
	}
	else{
		var type_chosen = inputted_metadata[variable][0];
		eval("var pparameter = " + type_chosen + "_stat_list;");
		eval("var ppparameter = " + type_chosen + "_stat_parameter_list;");
		var previous_stat_state;
		for (var q = 0; q < pparameter.length; q++) {
			if (inputted_metadata[variable][column_index[pparameter[q].replace(/\s/g, '_')]] > 0) {
				var sparameter = rfunctions.rfunctions[(ppparameter[(pparameter.indexOf(pparameter[q]))].rfunctions_index)].statistic_type[ppparameter[pparameter.indexOf(pparameter[q])].parameter_index].parameter;
				inputted_metadata[variable][column_index[pparameter[q].replace(/\s/g, '_')]] = 2 + sparameter.length;

				for (var r = 0; r < sparameter.length; r++) {
					if (inputted_metadata[variable][column_index[sparameter[r].replace(/\s/g, '_')]] != "") {
					  inputted_metadata[variable][column_index[pparameter[q].replace(/\s/g, '_')]]--;
					}
				};
				 if("all_metadata_optional" in rfunctions.rfunctions[(ppparameter[(pparameter.indexOf(pparameter[q]))].rfunctions_index)].statistic_type[ppparameter[pparameter.indexOf(pparameter[q])].parameter_index]){
					if(rfunctions.rfunctions[(ppparameter[(pparameter.indexOf(pparameter[q]))].rfunctions_index)].statistic_type[ppparameter[pparameter.indexOf(pparameter[q])].parameter_index].all_metadata_optional == "True"){
						inputted_metadata[variable][column_index[pparameter[q].replace(/\s/g, '_')]] = 2;
					}
				}
			}
		};
		pass_to_r_metadata(variable, input, ppparameter);
		generate_epsilon_table();
	}
};

function multivar_epsilon_table_validation (variable, input) {
    var type_chosen = inputted_metadata[variable][0];
   	var num_needed;
   	var num_filled;
    for (var q = 0; q < multivar_stat_list.length; q++) {
//test if statistic has been selected
        if (inputted_metadata[variable][column_index[multivar_stat_list[q]]] > 0) {
			num_unfilled = get_num_unfilled(variable, multivar_stat_list[q]);
			inputted_metadata[variable][column_index[multivar_stat_list[q]]] = 2 + num_unfilled
		}
    };
    var ppparameter ="";
    pass_to_r_metadata(variable, input, ppparameter);
    generate_epsilon_table();

};

// input: a grouped variable and statistic that currently has a bubble with types filled out.
// returns:  number of required pieces of metadata that have yet to be filled
function get_num_unfilled(variable, stat){
	var type_dict = inputted_metadata[variable][column_index["Variable_Type"]]
	var input_typelist = [];
	for(var key in type_dict){
		input_typelist.push(type_dict[key]);
	}
	var type_nums_dict = {};
	for(var j=0; j< type_list.length; j++){
	 	type_nums_dict[type_list[j]] = 0;
	 }
	 for(var i=0; i < input_typelist.length; i++){
	 		type_nums_dict[input_typelist[i]]++;
	 }

	var type_params_dict = rfunctions.rfunctions[statistic_list.indexOf(stat)].type_params_dict;
	//calculate number of parameters needed
	var num_needed = type_params_dict["General"].length;
	for(var i=0; i<type_list.length; i++){
		var key = type_list[i];
		if(key in type_nums_dict && key in type_params_dict){
			num_needed += type_nums_dict[key]*type_params_dict[key].length;
		 }
	  }
	//calculate number of parameters filled already.
	var num_filled = 0;
	for(var i=0; i<type_params_dict["General"].length; i++){
		if(inputted_metadata[variable][column_index[type_params_dict["General"][i].replace(/\s/g, '_')]]["General"] != ""){
			num_filled++;
		}
	}
	for(var v in type_dict){
		var t = type_dict[v];
		for(var j=0; j < type_params_dict[t].length; j++){
			if(inputted_metadata[variable][column_index[type_params_dict[t][j].replace(/\s/g, '_')]][v] != ""){
					num_filled++;
			}
		}
	}
	var num_unfilled = num_needed - num_filled;
	return num_unfilled;
}


// call talktoR when form is updated
function pass_to_r_metadata (variable, input, ppparameter) {

    var number_changed_metadata = 0;
    var changed_metadata = 0;

    var should_call_r = 0;
	var metadata_optional = 0;

    var metadata_changed_statistic_is_two = 0;
    if(variable in grouped_var_dict){
    	talktoR();
    // 	var varlist = grouped_var_dict[variable];
// 		var typedict = inputted_metadata[variable][column_index["Variable_Type"]];
// 		var statlist = [];
// 		for(var i=0; i<multivar_stat_list.length; i++){
// 			var stat = multivar_stat_list[i];
// 			var id = stat + "_" + variable;
// 			 if ($("#" + id).prop('checked')) {
// 				statlist.push(stat);
// 			}
//
// 		}
// 		for(var i=0; i<statlist.length; i++){
// 			var stat = statlist[i];
// 			var stat_index = column_index[stat];
// 			var prev_state = previous_inputted_metadata[variable][stat_index];
// 			var curr_state = inputted_metadata[variable][stat_index];
// 			if (curr_state >= 2) {
// 				number_changed_metadata++;
// 			}
// 			if ((prev_state != 2 && curr_state == 2) || (prev_state == 2 && curr_state != 2)) {
// 				inputted_metadata[variable][stat_index + 1] = "";
// 				inputted_metadata[variable][stat_index + 2] = "";
// 				inputted_metadata[variable][stat_index + 3] = 0;
// 				should_call_r++;
// 			}
// 			//if metadata just changed on a completed statistic.
// 			if (prev_state == 2 && curr_state == 2 && input != "undefined") {
// 				for(var key in previous_inputted_metadata[variable][column_index[input.name]]){
// 					if (previous_inputted_metadata[variable][column_index[input.name]][key] != inputted_metadata[variable][column_index[input.name]][key] && previous_inputted_metadata[variable][column_index[input.name]][key] != "") {
// 						changed_metadata++;
// 						var paramlist = get_needed_parameters()
// 				//how to adapt this if to multivar setting?		if (rfunctions.rfunctions[statistic_list.indexOf(stat)].statistic_type[ppparameter[k].parameter_index].parameter.includes(input.name.replace(/_/g, ' '))) {
// 							metadata_changed_statistic_is_two++;
// 						}
// 					}
// 				}
// 			}
		}

    else{
		for (var k = 0; k < ppparameter.length; k++) {
			// stat_index = 4 * k + 1;
			stat_index = 4 * ppparameter[k].rfunctions_index + 1;

			var prev_state = previous_inputted_metadata[variable][stat_index];
			var curr_state = inputted_metadata[variable][stat_index];
			if (curr_state >= 2) {
				number_changed_metadata++;
			}
			if ((prev_state != 2 && curr_state == 2) || (prev_state == 2 && curr_state != 2)) {
				inputted_metadata[variable][stat_index + 1] = "";
				inputted_metadata[variable][stat_index + 2] = "";
				inputted_metadata[variable][stat_index + 3] = 0;
				should_call_r++;
			}
			//if metadata just changed on a completed statistic.
				if (prev_state == 2 && curr_state == 2 && input != "undefined") {
				if (previous_inputted_metadata[variable][column_index[input.name]] != inputted_metadata[variable][column_index[input.name]] && previous_inputted_metadata[variable][column_index[input.name]] != "") {
					changed_metadata++;
					if (rfunctions.rfunctions[ppparameter[k].rfunctions_index].statistic_type[ppparameter[k].parameter_index].parameter.includes(input.name.replace(/_/g, ' '))) {
						metadata_changed_statistic_is_two++;
					}
				}
				//if all metadata is optional, talk to R
				 if("all_metadata_optional" in rfunctions.rfunctions[ppparameter[k].rfunctions_index].statistic_type[ppparameter[k].parameter_index]){
					if(rfunctions.rfunctions[ppparameter[k].rfunctions_index].statistic_type[ppparameter[k].parameter_index].all_metadata_optional == "True"){
						metadata_optional++;
					}
				}
			}
		};
	}
    if (areAllHeld1()) {
      alert("Removing metadata would result in all held statistics. Try removing some holds before removing metadata.");
      if(variable in grouped_var_dict){
      	 inputted_metadata = JSON.parse(JSON.stringify(previous_inputted_metadata));
      	 var str = input.id;
      	 var index = str.indexOf("_input");
    	 var univar = str.substring(0,index);
      	 input.value = inputted_metadata[variable][column_index[input.name]][univar];
      }
      else{
      	inputted_metadata = JSON.parse(JSON.stringify(previous_inputted_metadata));
      	input.value = inputted_metadata[variable][column_index[input.name]]
      }
    }
    else {
    if (should_call_r > 0) {
        console.log("talking to r bc statistic can now be editted but doesn't cover the later case where the field becomes null");
        talktoR();
    }

    if (number_changed_metadata == changed_metadata && number_changed_metadata > 0 && changed_metadata > 0 && should_call_r == 0) {
        console.log("talking to r bc metadata field just changed but all entry are filled/none are blank")
        talktoR();
    }

    if (metadata_changed_statistic_is_two > 0 && number_changed_metadata != changed_metadata) {
        console.log("talking to R bc a statistic which is now edittable has it's been changed w/ some fields blank");
        talktoR();
    }

    if (metadata_optional > 0) {
        console.log("talking to R bc metadata is optional");
        talktoR();
    }
  }
};






// Record the table when text-field being editted and has changed
function record_table () {
    previous_inputted_metadata = JSON.parse(JSON.stringify(inputted_metadata));
}


// Does the hold function
function hold_status (hold_checkbox, variable, statistic) {

    previous_inputted_metadata = JSON.parse(JSON.stringify(inputted_metadata));
    if ($("#" + hold_checkbox.id).prop('checked')) {
        inputted_metadata[variable][column_index["hold_" + statistic]] = 1;
            console.log(number_of_complete_stats_and_holds());

        var allHeld = areAllHeld1();
        if(allHeld){
            alert("Cannot hold every statistic");
            inputted_metadata[variable][column_index["hold_" + statistic]] = 0;
            document.getElementById(hold_checkbox.id).checked=false;
        }
    }
    else {

        inputted_metadata[variable][column_index["hold_" + statistic]] = 0;
    }
    console.log(previous_inputted_metadata);
    console.log(number_of_complete_stats_and_holds());
};

// checks if every statistic is being held. If variable is not null, checks if
// deleting that variable would result in all statistics being held.
// function areAllHeld (variable=null){  JH: This default assignment is ES6 syntax not available in all browsers (Safari 10, but not 9, Chrome but not IE)
//  function areAllHeld (variable){
//     // var allHeld = false;
//     variable = typeof variable !== 'undefined' ? variable : null;  // This gives the same behaviour: set as null if undefined when function called

//     var allHeld = true;
//     var tempvarlist = JSON.parse(JSON.stringify(varlist_active));
//     //TO Do: If no statistics are active yet, just return false.
//     if(variable){
//         var index = tempvarlist.indexOf(variable);
//         if(index > -1){
//             tempvarlist.splice(index, 1);
//         }
//     }
//      for (n = 0; n < tempvarlist.length; n++) {
//         for (m = 0; m < statistic_list.length; m++) {
//             var stat_index = 4 * m + 1;
//             var hold_index = 4 * m + 4;
//             // if any completed statistic is unheld, return false
//             if (inputted_metadata[tempvarlist[n].replace(/\s/g, '_')][stat_index] == 2 && inputted_metadata[tempvarlist[n].replace(/\s/g, '_')][hold_index] == 0) {
//                 allHeld = false;
//             }
//         }
//     }
//     return allHeld;
// }

// If passed ignore_var, it won't count stats and holds from that variable name.
function number_of_complete_stats_and_holds (ignore_var) {
  var table = inputted_metadata;

  var stat_count = 0;
  var hold_count = 0;
  for (var i = 0; i < varlist_active.length; i++) {
    if(varlist_active[i] !== ignore_var) {
      for (var j = 0; j < statistic_list.length; j++) {
        var stat_index = 4 * j + 1;
        var hold_index = 4 * j + 4;
        if (table[varlist_active[i].replace(/\s/g, '_')][stat_index] == 2) {
          stat_count++;
        }
        if (table[varlist_active[i].replace(/\s/g, '_')][hold_index] == 1) {
          hold_count++;
        }
      }
    }
  }
  return [stat_count, hold_count];
}

// If passed ignore_var, it won't count stats and holds from that variable name,
// so you can use it to check if all stats except that variable's are held.
function areAllHeld1 (ignore_var) {
  // var allHeld = true;
  // for (i = 0; i < varlist_active.length; i++) {
  //   for (j = 0; j < statistic_list.length; j++) {
  //     var stat_index = 4 * j + 1;
  //     var hold_index = 4 * j + 4;
  //     if (inputted_metadata[varlist_active[i].replace(/\s/g, '_')][stat_index] == 2 && inputted_metadata[varlist_active[i].replace(/\s/g, '_')][hold_index] == 0) {
  //       allHeld = false;
  //     }
  //   }
  // }
  // return allHeld;
  var sh = number_of_complete_stats_and_holds(ignore_var);
  if (sh[0] == sh[1] && sh[0] != 0 && sh[1] != 0) {
    return true;
  }
  return false;
}

function areAllHeld2 (variable) {

}

display_epsilon_bool = false;
reserved_epsilon_bool = false;

function toggle_epsilon_display () {
  display_epsilon_bool = !display_epsilon_bool;
  generate_epsilon_table();
}
function toggle_reserved_epsilon_tool () {
  reserved_epsilon_bool = !reserved_epsilon_bool;
  var sli = document.getElementById('slider_div');
    if (sli.style.display === 'none') {
        sli.style.display = 'block';
    } else {
        sli.style.display = 'none';
    }
  generate_epsilon_table();
}
// Creates Epsilon
function generate_epsilon_table () {
    var completed_statistic = false;
    var epsilon_table =
    "<button type='button' class='manualinfo' data-load-url='" + CONTENT_PAGES_BASE_URL  + "psiIntroduction.html' data-toggle='modal' data-target='#myModal' data-id='accuracy' style='float:right;padding-top:0.5em;' onclick='generate_modalinfo()'><span class='glyphicon glyphicon-question-sign' style='color:"+qmark_color+";font-size:"+qmark_size+";'></span></button>" +
    "<table id='epsilon_table' style='width: calc(100% - 30px);'>" +
        "<tr>" +
            "<td style='font-weight: bold;'>" +
                "Variable Name" +
            "</td>" +
            "<td style='font-weight: bold;'>" +
                "Statistic" +
            "</td>";
    if (display_epsilon_bool) {
      epsilon_table +=
            "<td title='Privacy parameter' style='font-weight: bold;'>" +
                "Epsilon" +
            "</td>";
      }
    epsilon_table +=
            "<td title='Error measures differ across statistics. Click the red question mark next to any error value to learn more' style='font-weight: bold;'>" +
                "Error" +
            "</td>" +
            "<td title='The portion of the privacy budget will stay fixed for all statistics being Held' style='font-weight: bold;'>" +
                "Hold" +
            "</td>" +
        "</tr>";
    for (var n = 0; n < varlist_active.length; n++) {
        for (var m = 0; m < statistic_list.length; m++) {
            var stat_index = 4 * m + 1;
           	if (inputted_metadata[varlist_active[n].replace(/\s/g, '_')][stat_index] > 0) {
			// if (inputted_metadata[varlist_active[n].replace(/\s/g, '_')][stat_index] == 2) {
                epsilon_table +=
                "<tr>" +
                    "<td>" +
                        varlist_active[n] +
                    "</td>" +
                    "<td>" +
                        rfunctions.rfunctions[m].statistic +
                    "</td>";

                  if (inputted_metadata[varlist_active[n].replace(/\s/g, '_')][stat_index] == 2) {
                  		completed_statistic = true;
                        if (display_epsilon_bool) {
                          epsilon_table +=
                          "<td>" +
                              (parseFloat(inputted_metadata[varlist_active[n].replace(/\s/g, '_')][stat_index + 1]).toFixed(4)).toString() +
                          "</td>";
                        }
                        epsilon_table +=
                        "<td>" +
                            "<div style='text-align:center'><input type='text' style='width:50px' value='" + (parseFloat(inputted_metadata[varlist_active[n].replace(/\s/g, '_')][stat_index + 2]).toFixed(4)).toString() + "' name='accuracy_" + statistic_list[m] + "' onclick='record_table()' onchange='ValidateAccuracy(this, \"pos_number\", \"" + varlist_active[n].replace(/\s/g, '_') + "\", \"" + statistic_list[m] + "\")'>" + "<button type='button' class='manualinfo' onclick='explain_accuracy(\"" + varlist_active[n] + "\",\"" + rfunctions.rfunctions[m].statistic + "\",\"" + (parseFloat(inputted_metadata[varlist_active[n].replace(/\s/g, '_')][stat_index + 2]).toFixed(4)).toString() + "\",\"" + inputted_metadata[varlist_active[n].replace(/\s/g, '_')][0] + "\")' style='cursor:help;width:0px;' title='Explains what the error measure means.'><span class='glyphicon glyphicon-question-sign' style='color:#FA8072;;font-size:"+qmark_size+";cursor:help;'></button></div>" +
                        "</td>" +
                        "<td>";

                        if (inputted_metadata[varlist_active[n].replace(/\s/g, '_')][column_index["hold_" + statistic_list[m]]] == 1) {
                            epsilon_table += "<input type='checkbox' id='hold_" + varlist_active[n].replace(/\s/g, '_') + "_" + statistic_list[m] + "' onclick='hold_status(this,\"" + varlist_active[n].replace(/\s/g, '_') + "\",\"" + statistic_list[m] + "\")' checked>";
                        }
                        else {
                            epsilon_table += "<input type='checkbox' id='hold_" + varlist_active[n].replace(/\s/g, '_') + "_" + statistic_list[m] + "' onclick='hold_status(this,\"" + varlist_active[n].replace(/\s/g, '_') + "\",\"" + statistic_list[m] + "\")'>";
                        }
                  }

                    else {
                        if (display_epsilon_bool) {
                          epsilon_table +=
                            "<td title='Epsilon will be editable after putting in the necessary metadata fields.'>"
                        }
                        epsilon_table +=
                        "</td>" +
                        "<td title='Error will be editable after putting in the necessary metadata fields.'>" +
                        "</td>" +
                        "<td title='Hold status will be editable after putting in the necessary metadata fields.'>";
                    }

                epsilon_table +=
                    "</td>" +
                "</tr>";
            }
            else {}
        };
    };
    epsilon_table +=
    "</table>";

    var epsilon_toggle_button_text = display_epsilon_bool ? 'Hide Epsilon' : 'Show Epsilon';
    var reserved_epsilon_toggle_button_text = reserved_epsilon_bool ? "Hide Slider" : "Reserve budget for future users";

    epsilon_table += "<br><div style='text-align:center; float:left; margin:0 0 0 30px'><input onclick='toggle_epsilon_display()' type='button' class='btn btn-default' value='" + epsilon_toggle_button_text + "' id='epsilon_toggle_button' style='width:125px'> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Confidence Level (&alpha;) <input name='beta' id='global_beta_edit' onfocusout='global_parameters_beta(this)' title='Confidence level for error estimates' value='" + global_beta + "' style='color: black;' size='4' type='text' placeholder='Beta'>";

     $("#reserve_epsilon_toggle_button").remove();
     if(!interactive){
    	epsilon_table += "<br><div style='text-align:center; float:left; margin:20px 0 0 50px'><input onclick='toggle_reserved_epsilon_tool()' type='button' class='btn btn-default' value='" + reserved_epsilon_toggle_button_text + "' id='reserve_epsilon_toggle_button' style='width:225px'> </button>";
   	 }

    /////
    document.getElementById('epsilon_sidebar_top').innerHTML = epsilon_table;
    if(completed_statistic && first_completed_statistic && tutorial_mode){
    	hopscotch.endTour(true);
		var variable_selected_tour = {
		  "id": "completed_stat",
		  "steps": [
			{
			  "target": "epsilon_table",
			  "arrowOffset":260,
			  "xOffset":50,
			  "placement": "bottom",
			  "title": "See the worst-case error estimates in your statistics",
			  "content": "To request that certain statistics be made more or less accurate, you can directly edit the error cell corresponding to each statistic. <br><br>Since your entire budget is spent on the set of statistics that you have selected at any given time, you may only alter the errors when you have more than one statistic selected. Click the red question mark for an interpretation of the error. <br><br> Click Next to continue the tour.",
			  "xOffset":70,
			  "showCTAButton":true,
			  "ctaLabel": "Disable these messages",
			  "onCTA": function() {
				hopscotch.endTour(true);
				tutorial_mode = false;
			  },
			},
			{
			  "target": "hold_" + varlist_active[0].replace(/\s/g, '_') + "_" + statistic_list[0],
			  "placement": "bottom",
			  "xOffset":-280,
			  "arrowOffset":260,
			  "title": "Clicking 'hold' for a particular statistic fixes the portion of your budget to be spent on that statistic",
			  "content": "As you add or edit the error for other statistics, the held statistics will maintain their portion of the budget.You cannot hold every statistic. <br><br> Click Next to continue the tour.",
			  "showCTAButton":true,
			  "ctaLabel": "Disable these messages",
			  "onCTA": function() {
				hopscotch.endTour(true);
				tutorial_mode = false;
			  },
			},
			{
			  "target": global_beta_edit,
			  "placement": "left",
			  "yOffset":-20,
			  //"arrowOffset":260,
			  "title": "Change the confidence level of the error estimates here",
			  "content": "When this number is set to &alpha;, the probability that the worst-case error for each of the above statistics will not exceed the estimates shown in the table is 1-&alpha;. By default, &alpha; is set to 0.05, providing at least a 95 percent confidence level in the error estimates. <br><br> Click Next to continue the tour.",
			  "showCTAButton":true,
			  "ctaLabel": "Disable these messages",
			  "onCTA": function() {
				hopscotch.endTour(true);
				tutorial_mode = false;
			  },
			},
			{
			  "target": "edit_button",
			  //"arrowOffset":260,
			  "yOffset":-20,
			  "placement": "left",
			  "title": "You can change your global privacy loss parameters and population size here",
			  "content": "Click Next to continue the tour.",
			  "showCTAButton":true,
			  "ctaLabel": "Disable these messages",
			  "onCTA": function() {
				hopscotch.endTour(true);
				tutorial_mode = false;
			  },
			},
			{
			  "target": "reserve_epsilon_toggle_button",
			  "placement": "bottom",
			  "title": "Slide to reserve a percentage of your budget for future users (optional)",
			  "content":"The privacy budget for any given dataset is finite. Each time someone requests statistics from a dataset, the overall budget is depleted. As the data depositor, you decide how your budget will be spent. <br> <br>You can reserve some or all of the budget for future users, allowing other researchers to choose which differentially private statistics are calculated. In turn, however, you reduce the amount of the budget that you get to spend on releasing statistics of your choice. Keep in mind that, as the data depositor, you may have the best sense of which statistics are the most valuable in your data. <br><br> Click Next to continue the tour.",
			  "yOffset":40,
			  "showCTAButton":true,
			  "ctaLabel": "Disable these messages",
			  "onCTA": function() {
				hopscotch.endTour(true);
				tutorial_mode = false;
			  },
			  "onShow": function(){
			  	var sli = document.getElementById('slider_div');
                sli.style.display = 'block';
                generate_epsilon_table();
			  },
			  "onNext": function(){
			  	var sli = document.getElementById('slider_div');
                sli.style.display = 'none';
                generate_epsilon_table();
			  },
			},
			{
			  "target": "group_vars",
			  //"arrowOffset":260,
			  "yOffset":-20,
			  "placement": "bottom",
			  "title": "Click here to release multivariate statistics",
			  "content": "For statistics involving more than one variable (e.g. regressions, ATT with matching) begin by clicking here and placing the relevant variables in a group. The grouped variable will then be added to the variable list and you can release statistics on the group.",
			  "showCTAButton":true,
			  "ctaLabel": "Disable these messages",
			  "onCTA": function() {
				hopscotch.endTour(true);
				tutorial_mode = false;
			  },
			},
			{
			  "target": "new-transform-box",
			  //"arrowOffset":260,
			  "yOffset":-20,
			  "placement": "bottom",
			  "title": "Perform variable transformations on the dataset",
			  "content": "For example, if you want to run a regression involving log(income) rather than income, you can type 'myNewVariable <- log(income)' into the formula box. If 'income' is a variable in your dataset, a new variable called myNewVariable corresponding to the log of the income variable will spawn and you can release statistics about it. <br> <br> Click the help button next to the transformation box for more information.",
			  "showCTAButton":true,
			  "ctaLabel": "Disable these messages",
			  "onCTA": function() {
				hopscotch.endTour(true);
				tutorial_mode = false;
			  },
			},
			{
			  "target": "submit_button",
			  //"arrowOffset":260,
			  //"xOffset":50,
			  "placement": "top",
			  "title": "Finalize your set of statistics here",
			  "content": "When you have finished selecting which statistics to release, have provided the necessary metadata, and are satisfied with the error estimates, submit your decisions here. This will spend your budget and calculate your statistics. This cannot be undone.<br><br> Click Next to continue the tour.",
			  "showCTAButton":true,
			  "ctaLabel": "Disable these messages",
			  "onCTA": function() {
				hopscotch.endTour(true);
				tutorial_mode = false;
			   },
			 },
             {
			  "target": "submit_info_button",
			  //"arrowOffset":260,
			  //"xOffset":50,
			  "placement": "top",
			  "title": "For more detailed information click any of the info buttons around the page",
			  "content": "",
			  "showCTAButton":true,
			  "xOffset":-20,
			  "ctaLabel": "Disable these messages",
			  "onCTA": function() {
				hopscotch.endTour(true);
				tutorial_mode = false;
			  },
			  },
		  ],
		  "showCloseButton":false,
		  "scrollDuration": 300,
		  "onEnd":  function() {
			   first_completed_statistic = false;
			  },
		};
    	hopscotch.startTour(variable_selected_tour);
    }
};



// https://github.com/seiyria/bootstrap-slider

var slider = new Slider("#re_slider", {
  formatter: function(value) {
	  if(!interactive){
		return 'Reserved: ' + value + "%";
	  }
	  else{
	  	return value;
	  }
  },
});

slider.on("slide", function(sliderValue) {
  document.getElementById("re_value").textContent = sliderValue;
  if(interactive){
	  var batcheps = sliderValue*.01*global_epsilon;
	  var batchdel = sliderValue*.01*global_delta;
	  document.getElementById("batcheval").textContent = batcheps.toFixed(4);
	  document.getElementById("batchdval").textContent = batchdel.toExponential(4);
  }
});

 slider.on("slideStop", function(sliderValue) {
 if(!interactive){
	  // If reserving entire budget, warn user and give them an option to take it back
	  if(sliderValue == 100){
		if(confirm("This will give your entire privacy budget to future users. Your session will end and the only statistics released about your data will be those requested by other researchers. Are you sure you would like to continue?")){
			//Session ends
			//location.reload();
		}
		else{
			sliderValue = global_sliderValue;
			slider.setValue(sliderValue);
		}
	  }
	  if(sliderValue == 0){
		reserved_epsilon_toggle = false;
	  }
	  else{
		reserved_epsilon_toggle = true;
	  }
	  document.getElementById("re_value").textContent = sliderValue;
	  global_sliderValue = sliderValue;
	  reserved_epsilon = global_epsilon*(sliderValue/100);
	  reserved_delta = global_delta*(sliderValue/100);
	  calculate_fe();
	  calculate_fd();
	  display_params();
	  talktoR();
 }
 else{
  // If reserving entire budget, warn user and give them an option to take it back
  if(sliderValue == 100){
  	alert("This will spend your entire privacy budget on the current batch of statistics. You will not be allowed to request any more statistics after this.");
  }
  global_fe = sliderValue*.01*global_epsilon;
  global_fd = sliderValue*.01*global_delta;
  document.getElementById("batchEpsDisplay").textContent = global_fe.toFixed(4);
  document.getElementById("batchDelDisplay").textContent = global_fd.toExponential(4);
  if (interactive) {
    document.getElementById("epsilon-progress").style.width = 100 * (1 - global_epsilon / fixed_epsilon).toFixed(4) + "%";
    document.getElementById("epsilon-progress-proposed").style.width = 100 * (global_fe / fixed_epsilon).toFixed(4) + "%";
  }
  talktoR();
 }
 });



// JM function for displaying the privacy parameters
function display_params () {
  var active_param_name;
  if(!interactive){
  	 active_param_name = " Functioning";
  }
  else{
  	active_param_name = " Batch";
  }
  var delta_split = parseFloat(global_delta);
  if (delta_split.toString().length > 10) {
    delta_split = delta_split.toFixed(10);
  }
  delta_split = parseFloat(delta_split).toExponential();
  delta_split = delta_split.split('e');

  var delta_split2 = parseFloat(global_fd);
  if (delta_split2.toString().length > 10) {
    delta_split2 = delta_split2.toFixed(10);
  }
  delta_split2 = parseFloat(delta_split2).toExponential();
  delta_split2 = delta_split2.split('e');
  //JM displaying function parameters even if sec of samp is off but reserved epsilon is on
  if (SS_value_past == '') {
  	if(reserved_epsilon_toggle){
  			var html = '<table align="center"><tr><td style="text-align:right; padding-right: 15px;">Epsilon (&epsilon;):</td><td style="text-align:left;">' + parseFloat(global_epsilon).toFixed(4) + '</td><td style="text-align:left; padding-left:15px;">( ' + parseFloat(global_fe).toFixed(4) + '</td><td style="text-align:left; padding-left:5px;">'+ active_param_name +' Epsilon )</td></tr><tr><td style="text-align:right; padding-right: 15px; padding-left: 60px;">Delta (&delta;):</td><td style="text-align:left;">' + delta_split[0] + '&times;10<sup>' + delta_split[1] + '</sup></td><td style="text-align:left; padding-left:15px;">( ' + delta_split2[0] + '&times;10<sup>' + delta_split2[1] + '</sup></td><td style="text-align:left; padding-left:5px;">'+ active_param_name+' Delta )</td></tr></table>';
   		document.getElementById('display_parameters').innerHTML = html;
  	}
  	else{
  		var html = '<table align="center"><tr><td style="text-align:right; padding-right: 15px;">Epsilon (&epsilon;):</td><td style="text-align:left;">' + parseFloat(global_epsilon).toFixed(4) + '</td></tr><tr><td style="text-align:right; padding-right: 15px;">Delta (&delta;):</td><td style="text-align:left;">' + delta_split[0] + '&times;10<sup>' + delta_split[1] + '</sup></td></tr><tr><td style="text-align:right; padding-right: 15px;"> </td><td style="text-align:left; padding-left: 15px;"> </td></tr></table>';
   	    document.getElementById('display_parameters').innerHTML = html;
  	}
  }
  else {
    var html = '<table align="center"><tr><td style="text-align:right; padding-right: 15px;">Epsilon (&epsilon;):</td><td style="text-align:left;">' + parseFloat(global_epsilon).toFixed(4) + '</td><td style="text-align:left; padding-left:15px;">( ' + parseFloat(global_fe).toFixed(4) + '</td><td style="text-align:left; padding-left:5px;">'+ active_param_name+' Epsilon )</td></tr><tr><td style="text-align:right; padding-right: 15px; padding-left: 60px;">Delta (&delta;):</td><td style="text-align:left;">' + delta_split[0] + '&times;10<sup>' + delta_split[1] + '</sup></td><td style="text-align:left; padding-left:15px;">( ' + delta_split2[0] + '&times;10<sup>' + delta_split2[1] + '</sup></td><td style="text-align:left; padding-left:5px;">'+ active_param_name+' Delta )</td></tr><tr><td style="text-align:center" colspan="4">Population size (optional): <span style="text-align:left; padding-left:15px;">' + SS_value_past + '</span></td></tr></table>';
    document.getElementById('display_parameters').innerHTML = html;
  }
}

function explain_accuracy (variable, statistic, accuracy, variable_type) {
	//Might want to put these in the JSON file so we don't have to write a separate one for each statistic (JM)
	var prob = 1-global_beta;
	//var unnormed_acc = (accuracy*global_size).toFixed(3);
	var acc_explanation = "";
	var acc_prefix = "Releasing " + statistic + " for the variable " + variable +"."
	var acc_suffix = " Here the units are the same units the variable has in the dataset.";
	if(statistic == "Mean"){
		acc_explanation =  acc_prefix + " With at least probability " + prob +" the output mean will differ from the true mean by at most "+accuracy +" units." +acc_suffix;
	}
	if(statistic == "Histogram"){
		acc_explanation =  acc_prefix + " Each output count will differ from its true count by at most "+accuracy+" records with probability "+prob+".";
	}
	if(statistic == "Quantile"){
		acc_explanation =  acc_prefix + " For each t, the output count of the number of datapoints less than t will differ from the true count by at most "+accuracy+" records with probability "+prob+".";
	}
	if(statistic == "ATT with Matching"){
		acc_explanation = acc_prefix + " With at least probability "+prob+" the number of matched treated units used in the ATT analysis will differ from the true number of matched treated units by at most "+accuracy+" records. Note that this does not account for the additional error in the reported confidence interval."
	}
	if(statistic == "Logistic Regression" || statistic == "Probit Regression" || statistic == "OLS Regression"){
		acc_explanation = acc_prefix + " With at least probability "+prob+" the objective function for the regression will be perturbed by at most "+accuracy+".";
	}
	alert(acc_explanation);
 // alert("Releasing the " + statistic + " for the variable: " + variable +", which is a " + variable_type + ". The accuracy at which this is released is: " + accuracy + ", which means (INSERT SIMPLE EXPLANATION).");
}

// call talktoR when epsilon table is updated
function pass_to_r_epsilon (statistic, variable) {
    if (previous_inputted_metadata[variable][column_index[statistic] + 2] !=  inputted_metadata[variable][column_index[statistic] + 2]) {
        console.log("talk to r bc accuracy has changed; can extract var name and stat is necessary");
        talktoR("accuracyEdited", variable, statistic);
    }
};


function ValidateAccuracy (input, valid_entry, variable, statistic) {
    // Actual input validation
    var entry = input.value;

    if (Validation(valid_entry, entry) == "false") {
        inputted_metadata[variable][column_index[input.name]] = previous_inputted_metadata[variable][column_index[input.name]];
        input.value = previous_inputted_metadata[variable][column_index[input.name]];
        return false;
    }

    inputted_metadata[variable][column_index[input.name]] = entry;
    pass_to_r_epsilon(statistic, variable);
};




// Search box logic: https://www.html5andbeyond.com/live-search-a-html-list-using-jquery-no-plugin-needed/
jQuery(document).ready(function($) {
    $('.live-search-list li').each(function() {
        $(this).attr('data-search-term', $(this).text().toLowerCase());
    });

    $('.live-search-box').on('keyup', function() {
        var searchTerm = $(this).val().toLowerCase();

        $('.live-search-list li').each(function() {
            if ($(this).filter('[data-search-term *= ' + searchTerm + ']').length > 0 || searchTerm.length < 1) {
                $(this).show();
            }
            else {
                $(this).hide();
            }
        });
    });
});



// Get length of js dictionary length: http://jsfiddle.net/simevidas/nN84h/
// Generates a HTML datapage with all the info collected
function report () {
    info =
    "<style>" +
    "#epsilon_table table, #epsilon_table th, #epsilon_table td {" +
        "border: 1px solid black;" +
        "border-collapse: collapse;" +
    "}" +
    "#epsilon_table th, #epsilon_table td {" +
        "padding: 5px;" +
        "text-align: center;" +
    "}" +
    "</style>" +
    "<table id='epsilon_table' style='width: 100%;'>" +
        "<tr>" +
            "<td style='font-weight: bold;'>" +
                "Variable Name" +
            "</td>";

    for (var n = 0; n < column_index_length; n++) {
        info +=
        "<td style='font-weight: bold;'>" +
            index_column[n] +
        "</td>";
    };

    info += "</tr>";

    for (var m = 0;  m < varlist_active.length; m++) {
        info +=
        "<tr>" +
            "<td>" +
                varlist_active[m] +
            "</td>";

        for (var l = 0; l < column_index_length; l++) {
            info +=
            "<td>" +
                JSON.stringify(inputted_metadata[varlist_active[m].replace(/\s/g, '_')][l]) +
            "</td>";
        };

        info += "</tr>";
    };

    var report_info = window.open("");
    report_info.document.write(info + "</table>");
};


var window_global_epsilon = global_epsilon;
var window_global_delta = global_delta;
var window_global_fe = global_fe;
var window_global_fd = global_fd;
var window_SS_value_past = SS_value_past;
var window_reserved_epsilon = reserved_epsilon;

var window_global_delta_base = (parseFloat(window_global_delta).toExponential()).split('e')[0];
var window_global_delta_power = (parseFloat(window_global_delta).toExponential()).split('e')[1].substr(1);

var base_toFixed_amt = 0;
var scientific_notion_for_delta_toggle = true;
var window_reserved_epsilon_toggle = false;
var submitted_reserved_epsilon_toggle = false;

function global_parameters_beta (beta) {
    if (Validation("pos_number", beta.value) == "false") {
        beta.value = global_beta;
        return false;
    }
    else {
        if (global_beta != beta.value) {
            global_beta = beta.value;

            var is_active_stat = 0;
            for (var n = 0; n < varlist_active.length; n++) {
                for (var m = 0; m < statistic_list.length; m++) {
                    var stat_index = 4 * m + 1;
                    if (inputted_metadata[varlist_active[n]][stat_index] == 2) {
                        is_active_stat++;
                    }
                    if (is_active_stat > 0) {
                        break;
                    }
                }
                if (is_active_stat > 0) {
                    break;
                }
            }

            if (is_active_stat >  0) {
                console.log("talk to r bc beta changed but talks even when no stat presents has been fixed");
                talktoR("betaChange", "", "");
            }
        }
    }
}

function global_parameters_delta (delta) {
    if (Validation("pos_number", delta.value) == "false") {
        delta.value = global_delta;
        return false;
    }
    else {
        if (global_delta != delta.value) {
            global_delta = delta.value;

            var is_active_stat = 0;
            for (var n = 0; n < varlist_active.length; n++) {
                for (var m = 0; m < statistic_list.length; m++) {
                    var stat_index = 4 * m + 1;
                    if (inputted_metadata[varlist_active[n]][stat_index] == 2) {
                        is_active_stat++;
                    }
                    if (is_active_stat > 0) {
                        break;
                    }
                }
                if (is_active_stat > 0) {
                    break;
                }
            }

            if (is_active_stat >  0) {
                console.log("talk to r bc delta changed but talks even when no stat presents has been fixed");
                talktoR();
            }

            if (SS_value_past != "") {
              calculate_fd();

                for (var i = 0; i < varlist_active.length; i++) {
                  for (var j = 0; j < statistic_list.length; j++) {
                      if (inputted_metadata[varlist_active[i]][4 * j + 1] == 2) {
                        talktoR();
                        return "false";
                      }
                  }
                }
            }
        }
    }
}

function global_parameters_epsilon (epsilon) {
    if (Validation("pos_number", epsilon.value) == "false") {
        epsilon.value = global_epsilon;
        return false;
    }
    else {
        if (global_epsilon != epsilon.value) {
            global_epsilon = epsilon.value;

            var is_active_stat = 0;
            for (var n = 0; n < varlist_active.length; n++) {
                for (var m = 0; m < statistic_list.length; m++) {
                    var stat_index = 4 * m + 1;
                    if (inputted_metadata[varlist_active[n]][stat_index] == 2) {
                        is_active_stat++;
                    }
                    if (is_active_stat > 0) {
                        break;
                    }
                }
                if (is_active_stat > 0) {
                    break;
                }
            }

            if (is_active_stat >  0) {
                console.log("talk to r bc epsilon changed but talks even when no stat presents has been fixed");
                talktoR();
            }

            if (SS_value_past != "") {
              calculate_fe();

              for (var i = 0; i < varlist_active.length; i++) {
                for (var j = 0; j < statistic_list.length; j++) {
                  if (inputted_metadata[varlist_active[i]][4 * j + 1] == 2) {
                    talktoR();
                    return "false";
                  }
                }
              }
            }
        }
    }
}



function delta_check (delta) {
    var format_bool = (Validation("pos_number", delta.value) == "false");
    if (format_bool || delta.value >= 1) {
        delta.value = window_global_delta;
        if (!format_bool) {
          alert("The input should be less than 1.");
        }
        return false;
    }
    else if(delta.value > 1/global_size){
    	alert("Delta values larger than the inverse of the dataset size can allow algorithms to leak individual records. PSI does not allow this.");
    	delta.value = window_global_delta;
    	return false;
    }
    else {
        if (window_global_delta != delta.value) {
            window_global_delta = delta.value;
            window_global_delta_base = (parseFloat(window_global_delta).toExponential()).split('e')[0];
            window_global_delta_power = (parseFloat(window_global_delta).toExponential()).split('e')[1].substr(1);
			global_delta = delta.value;

            if (window_SS_value_past != "") {
              calculate_fd();
            }
        }
    }
}

function delta_check_exp (delta, part) {

  if (part == 'base') {
    var format_bool = (Validation("pos_number", delta.value) == "false");
    if (format_bool || delta.value < 1 || delta.value >= 10) {
        delta.value = window_global_delta_base;
        if (!format_bool) {
          alert("This input should be between 1 and 10.");
        }
        return false;
    }
    else {
      if (window_global_delta_base != delta.value) {
            window_global_delta_base = delta.value;
            window_global_delta = window_global_delta_base * Math.pow(10, -1 * window_global_delta_power);

            //if (window_SS_value_past != "") { //JM
              calculate_fd();
              talktoR(); //JM
            //}
        }
    }
  }
  else if (part == 'power') {
    if (Validation("pos_integer", delta.value) == "false") {
        delta.value = window_global_delta_power;
        return false;
    }
    else {
      if (window_global_delta_power != delta.value) {
            window_global_delta_power = delta.value;
            window_global_delta = window_global_delta_base * Math.pow(10, -1 * window_global_delta_power);

          //  if (window_SS_value_past != "") { //JM
              calculate_fd();
              talktoR(); //JM
            //}
        }
    }
  };
}

function epsilon_check (epsilon) {
    if (Validation("pos_number", epsilon.value) == "false") {
        epsilon.value = window_global_epsilon;
        return false;
    }
    else {
    if(epsilon.value > 1){
    	if(confirm("Warning: Epsilon values greater than 1 should be chosen with care! Are you sure you want to proceed?")){
    		if (window_global_epsilon != epsilon.value) {
            window_global_epsilon = epsilon.value;

			global_epsilon = epsilon.value;   //JM
           // if (window_SS_value_past != "") {
              calculate_fe();
              talktoR(); //JM
            //}
    	}
    	}
    	else{
    		 epsilon.value = window_global_epsilon;
        	 return false;
    	}
    }
    else{
        if (window_global_epsilon != epsilon.value) {
            window_global_epsilon = epsilon.value;

			global_epsilon = epsilon.value;   //JM
           // if (window_SS_value_past != "") {
              calculate_fe();
              talktoR(); //JM
            //}
        }
      }
    }
}

function update_ed() {
  global_epsilon = window_global_epsilon;
  global_delta = window_global_delta;
  global_fe = window_global_fe;
  global_fd = window_global_fd;
  SS_value_past = window_SS_value_past;
  display_params();
  // document.getElementById("epsilonDisplay").textContent = parseFloat(global_epsilon).toFixed(4);
  // document.getElementById("deltaDisplay").textContent = parseFloat(global_delta).toExponential(4);
}

function reserved_epsilon_check (reserved_epsilon) {
  if (Validation("pos_number", reserved_epsilon.value) == "false") {
        reserved_epsilon.value = window_reserved_epsilon;
        return false;
  }
  else {
    if (window_reserved_epsilon != reserved_epsilon.value) {
        window_reserved_epsilon = reserved_epsilon.value;


        //if (window_SS_value_past != "") {
          calculate_fe();
          talktoR();
        //}
      }
    }
}

// function calculate_fe () {
// 	//var fe = 0;
//     var fe = Math.log(1+(Math.exp(window_global_epsilon)-1)*(window_SS_value_past / global_size));
//
//     window_global_fe = fe;
//     $('#FE').show();
//     document.getElementById('FE_value').innerHTML = fe.toFixed(4);
//     // alert(fe);
// }
//
// function calculate_fd () {
//     var fd = (window_SS_value_past / global_size) * window_global_delta;
//     window_global_fd = fd;
//     $('#FD').show();
//     if (scientific_notion_for_delta_toggle) {
//       document.getElementById('FD_value').innerHTML = convert_to_scientific_notion(window_global_fd.toFixed(10));
//     }
//     else {
//       document.getElementById('FD_value').innerHTML = fd.toFixed(10);
//     }
//     // alert(fd);
// }
//JM rewrite function parameter functions:
function calculate_fe () {
	var fe = global_epsilon;
	var display = false;
	if (window_SS_value_past != "") {
    	fe = Math.log(1+(Math.exp(window_global_epsilon)-1)*(window_SS_value_past / global_size));
    	display = true;
    }
    if(reserved_epsilon_toggle){
    	fe = fe*(1-(global_sliderValue/100));
    	display = true;
    }
    global_fe = fe;
    window_global_fe = fe;
    //console.log(document.getElementById('FE_value'));
    //document.getElementById('FE_value').innerHTML = fe.toFixed(4);

    if(display){
  	  $('#FE').show();
    }
    else{
      $('#FE').hide();
    }
    // alert(fe);
}

function calculate_fd () {
	var fd = global_delta;
	var display = false;
	if (window_SS_value_past != "") {
    	 fd = (window_SS_value_past / global_size) * window_global_delta;
    	 display = true;
    }
     if(reserved_epsilon_toggle){
    	fd = fd*(1-(global_sliderValue/100));
    	display = true;
    }
    global_fd = fd;
    window_global_fd = fd;
    if(display){
     $('#FD').show();
   	 if (scientific_notion_for_delta_toggle) {
  //  	  document.getElementById('FD_value').innerHTML = convert_to_scientific_notion(window_global_fd.toFixed(10));
   	 }
   	 else {
  // 	   document.getElementById('FD_value').innerHTML = fd.toFixed(10);
   	 }
   	}
   	else{
   	 $('#FD').hide();
   	}
    // alert(fd);
}
/////////////////////
function global_parameters_SS (SS) {

    console.log(SS.value);
    if(SS.value == "" || SS.value == " "){
		clear_SS();
	}
    // remove commas
    SS.value = parseFloat(SS.value.replace(/,/g, ''));

    if (SS.value != window_SS_value_past && SS.value > global_size && (Validation("pos_number", SS.value) != "false")) {
   		 if((SS.value / global_size) * window_global_delta >= 1){
        		alert("PSI does not allow population sizes that lead to a delta value larger than 1.");
        		SS.value = window_SS_value_past;
        	}
     	 else{
			window_SS_value_past = SS.value;
			calculate_fe();
			calculate_fd();
			talktoR();
		}
    }
    else {
        SS.value = window_SS_value_past;
        //alert("Please enter in a whole number greater than your sample size!");
    }
};

function clear_SS () {
    var SS_value_before_clear = window_SS_value_past;
    window_SS_value_past = "";
    document.getElementById('SS').value = "";
    calculate_fe();
    calculate_fd();
    display_params();
    talktoR();
    //JM blocked below for new reserve epsilon functionality
// 	window_global_fe = "";
// 	window_global_fd = "";
// 	document.getElementById('SS').value = "";
// 	$('#FE').hide();
// 	$('#FD').hide();




    // if (SS_value_before_clear != "") {
    //   for (i = 0; i < varlist_active.length; i++) {
    //     for (j = 0; j < statistic_list.length; j++) {
    //       if (inputted_metadata[varlist_active[i]][4 * j + 1] == 2) {
    //         talktoR();
    //         return "false";
    //       }
    //     }
    //   }
    // }

    // alert(varlist_active.length);
    // alert(statistic_list.length);
    // talktoR();
    // talk to R bc e, d, etc. changed
}

function jump_to_custom() {
  document.getElementById("custom_privacy").checked = true;
}

function preset (epsilon, deltab, deltap) {
  // // disable inputs
  // $('input[name=epsilon]').attr('disabled', true);
  // if (scientific_notion_for_delta_toggle) {
  //   $('input[name=delta_base]').attr('disabled', true);
  //   $('input[name=delta_power]').attr('disabled', true);
  // } else {
  //   $('input[name=delta]').attr('disabled', true);
  // }
  // $('input[name=notation_switch]').attr('disabled', true);

  // input preset values and update values
  document.getElementById("epsilon_input").value = epsilon;
  epsilon_check(document.getElementById("epsilon_input"));
  // $('input[name=epsilon]').attr('value', epsilon);
  // epsilon_check($('input[name=epsilon]')[0]);
  if (scientific_notion_for_delta_toggle) {
    document.getElementById("delta_value_base_modal").value = deltab;
    document.getElementById("delta_value_power").value = deltap;
    delta_check_exp(document.getElementById("delta_value_base_modal"), 'base');
    delta_check_exp(document.getElementById("delta_value_power"), 'power');
    // $('input[name=delta_base]').attr('value', deltab);
    // $('input[name=delta_power]').attr('value', deltap);
    // delta_check_exp($('input[name=delta_base]')[0], 'base');
    // delta_check_exp($('input[name=delta_power]')[0], 'power');
  } else {
    document.getElementById("delta_value_modal").value = parseFloat(deltab * Math.pow(10, -1 * deltap));
    delta_check(document.getElementById("delta_value_modal"));
    // $('input[name=delta]').attr('value', parseFloat(deltab * Math.pow(10, -1 * deltap)));
    // delta_check($('input[name=delta]')[0]);
  }

}

function preset_none () {
  // enable inputs
  // $('input[name=epsilon]').attr('disabled', false);
  // if (scientific_notion_for_delta_toggle) {
  //   $('input[name=delta_base]').attr('disabled', false);
  //   $('input[name=delta_power]').attr('disabled', false);
  // } else {
  //   $('input[name=delta]').attr('disabled', false);
  // }
  // $('input[name=notation_switch]').attr('disabled', false);
}

function privacy_proceed () {
  if (document.getElementById("epsilon_input").value == "") {
    alert("An epsilon value and a delta value must be specified before proceeding.");
  } else {
    update_ed();
    update_modal_progress(3);
    $('#myModal3').modal('hide');
    $('#myModal4').modal('show');
  }
}

function privacy_close () {
    if (document.getElementById("epsilon_input").value == "") {
      alert("An epsilon value and a delta value must be specified before proceeding.");
    } else {
      $('#myModal3').modal('hide');
      edit_window_closed();
      hide_modal_progress();
    }
}

function edit_parameters_window () {
    window_global_epsilon = global_epsilon;
    window_global_delta = global_delta;
    window_global_fe = global_fe;
    window_global_fd = global_fd;
    window_SS_value_past = SS_value_past;

    window_global_delta_base = (parseFloat(window_global_delta).toExponential()).split('e')[0];
    window_global_delta_power = (parseFloat(window_global_delta).toExponential()).split('e')[1].substr(1);

    var html = "";
    html += '<div id="privacy-loss-params-info-edit"></div>'; //style="margin-top: 40px
    html += '<div style="text-align:center;"><div>';//JM removed second submit button//<button type="button" class="btn btn-default" data-dismiss="modal" onclick="edit_window_closed()">Submit</button><div>';// padding-top: 40px;

    preset_html = '<p></p><ul style="list-style-type:none; padding-left: 30px"><li><input type="radio" name="privacy_presets" value="1" disabled=true>&nbsp;&nbsp; 1. Public information: It is not necessary to use differential privacy for public information.</li><li><input type="radio" name="privacy_presets" value="2" onclick="preset(1, 1, 5)">&nbsp;&nbsp; 2. Information the disclosure of which would not cause material harm, but which the University has chosen to keep confidential: (&epsilon;=1,&delta;=10<sup>-5</sup>=0.00001)</li><li><input type="radio" name="privacy_presets" value="3" onclick="preset(0.25, 1, 6)">&nbsp;&nbsp; 3. Information that could cause risk of material harm to individuals or the University if disclosed: (&epsilon;=.25, &delta;=10<sup>-6</sup>=0.000001)</li><li><input type="radio" name="privacy_presets" value="4" onclick="preset(0.05, 1, 7)">&nbsp;&nbsp; 4. Information that would likely cause serious harm to individuals or the University if disclosed: (&epsilon;=.05, &delta;=10<sup>-7</sup>=0.0000001)</li><li><input type="radio" name="privacy_presets" value="5" disabled=true>&nbsp;&nbsp; 5. Information that would cause severe harm to individuals or the University if disclosed: It is not recommended that the PSI tool be used with such severely sensitive data.</li><li><input type="radio" name="privacy_presets" value="6" onclick="preset_none()" checked>&nbsp;&nbsp; Alternatively, set custom privacy loss parameters for your dataset below and if secrecy of the sample applies to your data, estimate the size of the population from which it was drawn:</li></ul>';

    if(!interactive){
      preset_html += '<table id="parameter_editing_table" align="center"><tr><td style="text-align:right; padding-right: 15px;"><span title="Epsilon from definition of differential privacy. Smaller values correspond to more privacy.">Epsilon (&epsilon;):</span></td><td style="padding-left: 15px;"><input id="epsilon_value" name="epsilon" onfocusout="epsilon_check(this)" title="Epsilon from definition of differential privacy. Smaller values correspond to more privacy." value="' + global_epsilon + '" style="color: black;" type="text" placeholder="Epsilon"> <!-- JM restricting reserve epsilon to slider <input title="Reserving epsilon will decrease your privacy budget, but will enable future researchers to make queries on your dataset." type="button" style="color:gray; width:200px;" onclick="add_reserved_epsilon_field()" value="Reserve Epsilon"></td></tr>-->';
    }
    else{
      preset_html += '<div>Remaining budget: Epsilon (&epsilon):</div>'
      preset_html += '<table id="parameter_editing_table" align="center"><tr><td style="text-align:right; padding-right: 15px;"><span title="Your allotted epsilon value from the definition of differential privacy. Smaller values correspond to more privacy and less accurate statistics.">Remaining Epsilon (&epsilon;):</span></td><td style="padding-left: 15px;"><input id="epsilon_value" name="epsilon" onfocusout="epsilon_check(this)" title="Epsilon from definition of differential privacy. Smaller values correspond to more privacy." value="' + global_epsilon + '" style="color: black;" type="text" placeholder="Epsilon"> <!-- JM restricting reserve epsilon to slider <input title="Reserving epsilon will decrease your privacy budget, but will enable future researchers to make queries on your dataset." type="button" style="color:gray; width:200px;" onclick="add_reserved_epsilon_field()" value="Reserve Epsilon"></td></tr>-->';
    }
    preset_html += '<tr id="reserved_epsilon_row" style="display:none;"><td style="text-align:right; padding-right: 15px;"><span title="Epsilon from definition of differential privacy. Smaller values correspond to more privacy.">Reserved Budget:</span></td><td style="padding-left: 15px;"><input id="reserved_epsilon_value" name="reserved_epsilon" onfocusout="reserved_epsilon_check(this)" title="Reserving epsilon will decrease your privacy budget, but will enable future researchers to make queries on your dataset." value="' + reserved_epsilon + '" style="color: black;" type="text" placeholder="Reserved Budget"> <input title="" type="button" style="color:gray; width:200px;" onclick="remove_reserved_epsilon_field()" value="Remove Reserve Epsilon"></td></tr>';

    preset_html += '<tr><td style="text-align:right; padding-right: 15px;"><span title = "Delta from definition of differential privacy. Smaller values correspond to more privacy.">Delta (&delta;):</span></td><td style="padding-left: 15px;" id="delta_row"><input id="delta_value" name="delta" onfocusout="delta_check(this)" title = "Delta from definition of differential privacy. Smaller values correspond to more privacy." value="' + global_delta + '" style="color: black;" type="text" placeholder="Delta">  <input title="Use exponential notation to enter in delta as delta is normally very small and using exponential notation to convey it is more convenient." type="button" style="color:gray; width: 100px" onclick="change_to_exponential_form(\'D\')" value="Exponential"></td></tr>';
    // html += '<tr><td style="text-align:right; padding-right: 15px;"><span title = "Delta from definition of differential privacy. Smaller values correspond to more privacy.">Delta (&delta;):</span></td><td style="padding-left: 15px;" id="delta_row"><input id="delta_value_base" name="delta_base" onfocusout="delta_check_exp(this, \'base\')" title = "Delta from definition of differential privacy. Smaller values correspond to more privacy." value="' + parseFloat(window_global_delta_base) + '" style="color: black;width:107.5px" type="text" placeholder="Delta">&times;10<sup>-<input id="delta_value_power" name="delta_power" onfocusout="delta_check_exp(this, \'power\')" title = "Delta from definition of differential privacy. Smaller values correspond to more privacy." value="" style="color: black;width:25px;" type="text" placeholder="Delta Power"></sup> <input title="Use exponential notation to enter in delta as delta is normally very small and using exponential notation to convey it is more convenient." type="button" style="color:gray; width: 100px" onclick="change_to_exponential_form(\'E\',\'\')" value="Decimal">';

    if(!interactive){
    if (SS_value_past == '') {
      preset_html += '<tr><td style="text-align:right; padding-right: 15px;"><span title="Is the data a random and secret sample from a larger population of known size? Here, secret means that the choice of the people in the sample has not been revealed. If this is the case, you can improve the accuracy of your statistics without changing the privacy guarantee. Estimate the size of the larger population. It is important to be conservative in your estimate. In other words, it is okay underestimate but could violate privacy if you overestimate.">Population size (optional):</span></td><td style="padding-left: 15px;"><input id="SS" name="SS" onfocusout="global_parameters_SS(this)" title="Is the data a random and secret sample from a larger population of known size? Here, secret means that the choice of the people in the sample has not been revealed. If this is the case, you can improve the accuracy of your statistics without changing the privacy guarantee. Estimate the size of the larger population. It is important to be conservative in your estimate. In other words, it is okay underestimate but could violate privacy if you overestimate." value="" style="color: black;" type="text" placeholder=""> <input title="Remove any entered value for the secrecy of the sample, and revert privacy parameters to the values without adjustment." type="button" style="color:gray; width:100px;" onclick="clear_SS()" value="Clear"></td></tr><tr id="FE" style="display:none;"><td style="text-align:right; padding-right: 15px; padding-top:15px;"><span title="When using secrecy of the sample, you get a boost in epsilon, which is represented here. This value can only be edited by changing the epsilon or secrecy of the sample fields.">Functioning Epsilon:</span></td><td style="padding-left: 15px; padding-top:15px;"><div id="FE_value" name="FE" title="When using secrecy of the sample, you get a boost in epsilon, which is represented here. This value can only be edited by changing the epsilon or secrecy of the sample fields." style="color: black;"></div></td></tr><tr id="FD" style="display:none;"><td style="text-align:right; padding-right: 15px;"><span title="When using secrecy of the sample, you get a boost in delta, which is represented here. This value can only be edited by changing the delta or secrecy of the sample fields.">Functioning Delta:</span></td><td style="padding-left: 15px;"><div id="FD_value" name="FD" title="When using secrecy of the sample, you get a boost in delta, which is represented here. This value can only be edited by changing the delta or secrecy of the sample fields." style="color: black;" ></div></td></tr></table>';
    }
    else {
      preset_html += '<tr><td style="text-align:right; padding-right: 15px;"><span title="Is the data a random and secret sample from a larger population of known size? Here, secret means that the choice of the people in the sample has not been revealed. If this is the case, you can improve the accuracy of your statistics without changing the privacy guarantee. Estimate the size of the larger population. It is important to be conservative in your estimate. In other words, it is okay underestimate but could violate privacy if you overestimate.">Population size (optional):</span></td><td style="padding-left: 15px;"><input id="SS" name="SS" onfocusout="global_parameters_SS(this)" title="Is the data a random and secret sample from a larger population of known size? Here, secret means that the choice of the people in the sample has not been revealed. If this is the case, you can improve the accuracy of your statistics without changing the privacy guarantee. Estimate the size of the larger population. It is important to be conservative in your estimate. In other words, it is okay underestimate but could violate privacy if you overestimate." value="' + SS_value_past + '" style="color: black;" type="text" placeholder=""> <input title="Remove any entered value for the secrecy of the sample, and revert privacy parameters to the values without adjustment." type="button" style="color:gray; width:100px;" onclick="clear_SS()" value="Clear"></td></tr><tr id="FE" style=""><td style="text-align:right; padding-right: 15px; padding-top:15px;"><span title="When using secrecy of the sample, you get a boost in epsilon, which is represented here. This value can only be edited by changing the epsilon or secrecy of the sample fields.">Functioning Epsilon:</span></td><td style="padding-left: 15px; padding-top:15px;"><div id="FE_value" name="FE" title="When using secrecy of the sample, you get a boost in epsilon, which is represented here. This value can only be edited by changing the epsilon or secrecy of the sample fields." style="color: black;">' + global_fe.toFixed(4) + '</div></td></tr><tr id="FD" style=""><td style="text-align:right; padding-right: 15px;"><span title="When using secrecy of the sample, you get a boost in delta, which is represented here. This value can only be edited by changing the delta or secrecy of the sample fields.">Functioning Delta:</span></td><td style="padding-left: 15px;"><div id="FD_value" name="FD" title="When using secrecy of the sample, you get a boost in delta, which is represented here. This value can only be edited by changing the delta or secrecy of the sample fields." style="color: black;" >' + global_fd.toFixed(10) + '</div></td></tr></table>';
    }
    }

    document.getElementById("modal-body-edit-window").innerHTML = html;
    document.getElementById("privacy-loss-params-info-edit").innerHTML = document.getElementById("privacy-loss-params-info-1").innerHTML + preset_html + document.getElementById("privacy-loss-params-info-2").innerHTML;
	if(!interactive){
    change_to_exponential_form('D');
		// if (scientific_notion_for_delta_toggle) {
		//   change_to_exponential_form('D');
		// }

		if (submitted_reserved_epsilon_toggle) {
		  add_reserved_epsilon_field();
		}
	}
    $('#myModal2').modal('show');
    // $('#myModal2').find('.modal-body').replaceWith(html);
}
var groupedvars_list = [];
function group_vars_window () {
    var html = "";
    for (var n = 0; n < variable_list.length; n++) {
    	if(!(variable_list[n] in grouped_var_dict)){
        	html += "<input type='checkbox'  name='" + variable_list[n].replace(/\s/g, '_') + "' id='check_"+ variable_list[n].replace(/\s/g, '_') + "'> <span>"+variable_list[n].replace(/\s/g, '_') +"</span><br>";
    	}
    };
    document.getElementById("modal-body-group-vars").innerHTML = html;
    $('#groupVarsModal').modal('show');
}

var grouped_var_dict = {};

function group_vars_window_closed(){
	var check;
	var variable;
	var multivar = [];
	for (var n = 0; n < variable_list.length; n++) {
		variable = variable_list[n].replace(/\s/g, '_');
		if(!(variable in grouped_var_dict)){
			if(document.getElementById('check_'+ variable).checked){
				multivar.push(variable)
			}
		}
	 }
	 if(multivar.length > 1){
	 	 var newvar = multivar.join("_");
	 	 var stopper = false;
	 	 var copy = newvar;
	 	 var counter = 1;
	 	 while(copy in grouped_var_dict){
	 	 	counter++;
	 	 	copy = copy + "_" + counter;
	 	 }
	 	 if(counter > 1){
	 	 	newvar = newvar + "_" + counter;
	 	 }
	 	grouped_var_dict[newvar]= multivar;
		variable_list.push(newvar);
	 	add_variable_to_sidebar(newvar);
	 }
}

function change_to_exponential_form (key, suffix='') {
  if (key == 'D') {
    var entry = document.getElementById('delta_value' + suffix).value;
    var digits = entry.toString().length - window_global_delta_power;
    if (entry.includes('.') && !entry.includes('0.')) {
      digits = digits - 1;
    }
    if (entry.includes('0.')) {
      digits = digits - 2;
    }
    if (digits < 0 || digits > 20) {
      digits = base_toFixed_amt;
    }
    var delta_html = '<input id="delta_value_base' + suffix + '" name="delta_base" onfocusout="delta_check_exp(this,\'base\')" title = "Delta from definition of differential privacy. Smaller values correspond to more privacy." value="' + parseFloat(window_global_delta_base).toFixed(digits) + '" style="color: black;width:107.5px" type="text" placeholder="Delta Base" onchange="jump_to_custom()">&times;10<sup>-<input id="delta_value_power" name="delta_power" onfocusout="delta_check_exp(this, \'power\')" title = "Delta from definition of differential privacy. Smaller values correspond to more privacy." value="' + window_global_delta_power + '" style="color: black;width:25px;" type="text" placeholder="Delta Power"  onchange="jump_to_custom()"></sup> <input name="notation_switch" title="Use exponential notation to enter in delta as delta is normally very small and using exponential notation to convey it is more convenient." type="button" style="color:gray; width: 100px" onclick="change_to_exponential_form(\'E\',\'' + suffix + '\')" value="Decimal">';
    document.getElementById('delta_row' + suffix).innerHTML = delta_html;
    scientific_notion_for_delta_toggle = true;

    if (window_SS_value_past != '') {
      document.getElementById('FD_value').innerHTML = convert_to_scientific_notion(window_global_fd.toFixed(10));
    }
  }
  else if (key == 'E') {
    var entry = document.getElementById('delta_value_base' + suffix).value;
    var digits = parseInt(window_global_delta_power) + entry.toString().length - 1;
    if (entry.toString().length == 0) {
      digits += 1;
    }
    if (entry.includes('.')) {
      digits = digits - 1;
    }

    if (digits < 20) {
      var delta_html = '<input id="delta_value' + suffix + '" name="delta" onfocusout="delta_check(this)" title = "Delta from definition of differential privacy. Smaller values correspond to more privacy." value="' + parseFloat(window_global_delta).toFixed(digits) + '" style="color: black;" type="text" placeholder="Delta" onchange="jump_to_custom()"> <input name="notation_switch" title="Use exponential notation to enter in delta as delta is normally very small and using exponential notation to convey it is more convenient." type="button" style="color:gray; width: 100px" onclick="change_to_exponential_form(\'D\',\'' + suffix + '\')" value="Exponential">';
      document.getElementById('delta_row' + suffix).innerHTML = delta_html;
      scientific_notion_for_delta_toggle = false;

      if (window_SS_value_past != '') {
        document.getElementById('FD_value').innerHTML = window_global_fd.toFixed(10);
      }
    }
    else {
      alert('Since your proposed delta is so small, the convention for expressing delta will be locked in scientific notation');
    }
  }
}

function edit_window_closed () {
  global_epsilon = window_global_epsilon;
  global_delta = window_global_delta;
  global_fe = window_global_fe;
  global_fd = window_global_fd;
  SS_value_past = window_SS_value_past;
  display_params();

  submitted_reserved_epsilon_toggle = window_reserved_epsilon_toggle;


  if (document.getElementById('delta_value_base') != null) {
    var entry = document.getElementById('delta_value_base').value;
    var digits = parseInt(window_global_delta_power) + entry.toString().length - 1;
    if (entry.includes('.')) {
      digits = digits - 1;
    }

    if (digits > 20) {
      base_toFixed_amt = entry.toString().length - 1;
      if (entry.toString().includes('.')) {
        base_toFixed_amt = base_toFixed_amt - 1;
      }
    }
  }

  for (var i = 0; i < varlist_active.length; i++) {
    for (var j = 0; j < statistic_list.length; j++) {
      if (inputted_metadata[varlist_active[i]][4 * j + 1] == 2) {
        talktoR();
        return "false";
      }
    }
  }

  var delta_split = parseFloat(global_delta);
  if (delta_split.toString().length > 10) {
    delta_split = delta_split.toFixed(10);
  }
  delta_split = parseFloat(delta_split).toExponential();
  delta_split = delta_split.split('e');

  var delta_split2 = parseFloat(global_fd);
  if (delta_split2.toString().length > 10) {
    delta_split2 = delta_split2.toFixed(10);
  }
  delta_split2 = parseFloat(delta_split2).toExponential();
  delta_split2 = delta_split2.split('e');


  if (SS_value_past == '') {
    var html = '<table align="center"><tr><td style="text-align:right; padding-right: 15px;">Epsilon (&epsilon;):</td><td style="text-align:left;">' + parseFloat(global_epsilon).toFixed(4) + '</td></tr><tr><td style="text-align:right; padding-right: 15px;">Delta (&delta;):</td><td style="text-align:left;">' + delta_split[0] + '&times;10<sup>' + delta_split[1] + '</sup></td></tr><tr><td style="text-align:right; padding-right: 15px;"> </td><td style="text-align:left; padding-left: 15px;"> </td></tr></table>';
    document.getElementById('display_parameters').innerHTML = html;
  }
  else {
  	var active_param_name;
  	if(interactive){
  		active_param_name = " Batch";
  	}
  	else{
  		active_param_name = " Functioning";
  	}
    var html = '<table align="center"><tr><td style="text-align:right; padding-right: 15px;">Epsilon (&epsilon;):</td><td style="text-align:left;">' + parseFloat(global_epsilon).toFixed(4) + '</td><td style="text-align:left; padding-left:15px;">( ' + parseFloat(global_fe).toFixed(4) + '</td><td style="text-align:left; padding-left:5px;">'+ active_param_name +' Epsilon )</td></tr><tr><td style="text-align:right; padding-right: 15px; padding-left: 60px;">Delta (&delta;):</td><td style="text-align:left;">' + delta_split[0] + '&times;10<sup>' + delta_split[1] + '</sup></td><td style="text-align:left; padding-left:15px;">( ' + delta_split2[0] + '&times;10<sup>' + delta_split2[1] + '</sup></td><td style="text-align:left; padding-left:5px;">'+ active_param_name +' Delta )</td></tr><tr><td style="text-align:center" colspan="4">Population size (optional): <span style="text-align:left; padding-left:15px;">' + SS_value_past + '</span></td></tr></table>';

    document.getElementById('display_parameters').innerHTML = html;
  }
  if(tutorial_mode && first_edit_window_closed){
  	hopscotch.startTour(var_panel_tour);
  }
}


function add_reserved_epsilon_field () {
  $('#reserved_epsilon_row').show();
  window_reserved_epsilon_toggle = true;
}

function remove_reserved_epsilon_field () {
  $('#reserved_epsilon_row').hide();
  window_reserved_epsilon_toggle = false;
}

// what happens if power is exceptionally small ???/

function convert_to_scientific_notion (number) {
  number = parseFloat(number).toExponential().split('e');
  return number[0] + '&times;10<sup>' + number[1] + '</sup>';
}
// function clear_SS () {
//   //var table = document.getElementById('parameter_editing_table');
//   $('#FE').show()
// }

// Cases when SS is activate:
// Epsilon availible and then SS added
// epsolon not available and SS is added
// cleared SS when nothing is affected
// SS cleared when table has something

// Take a bin names, as a string separate comma, for categorical


//////////////////////////////////////////////
// functions for changing exemplar datasets

function UrlExists(url, cb){
    jQuery.ajax({
        url:      url,
        dataType: 'text',
        type:     'GET',
        complete:  function(xhr){
            if(typeof cb === 'function')
               cb.apply(this, [xhr.status]);
        }
    });
}

function changedataset(newfileid) {
  	var newurl = window.location.href.split('?')[0] + "?fileid=" + newfileid +"&UI=1";
  	console.log(newurl);
  	window.location.href = newurl;
}

function overridedataset(newfileid) {
	var checkmetadataurl="https://beta.dataverse.org/api/meta/datafile/"+newfileid;
  	// Need to check if fileid is valid
  	// Need to

  	UrlExists(checkmetadataurl, function(status){
    if(status === 200){  // file was found
  		var newurl = window.location.href.split('?')[0] + "?fileid=" + newfileid +"&";
  		console.log(newurl);
  		window.location.href = newurl;
    }
    else if(status === 404){  // 404 not found
    	window.alert("No Dataset with fileid of " + newfileid + " found on beta.dataverse.org");
    }
});
}

////////////////
// Define tutorial mode tours.
var var_panel_tour = {
  "id": "var_panel",
 "i18n": {
  	"doneBtn":'Ok'
  },
  "steps": [
    {
      "target": "variable_sidebar",
      "placement": "right",
      "title": "Welcome to the PSI Budgeter!",
      "content": "To begin, select a variable from your dataset.",
      "showCTAButton":true,
      "ctaLabel": "Disable these messages",
      "onCTA": function() {
        hopscotch.endTour(true);
        tutorial_mode = false;
      },
    }
  ],

  "showCloseButton":false,
  "scrollDuration": 300,
  "onEnd":  function() {
       first_edit_window_closed = false;
      },
};






// reserved epsilon -> slider bar -> percentage as oppose to a number
// need to display reserved epsilon outside edit window
// use (1-reserved epsilon) * epsilon to send out to the R-server

// additional feedback:
// automated helper that can be turned off/tutorial mode (like making a new gmail/gmail user)/use cookies.


// toggle for slider reserved epsilon on right hand table button
// start at zero then -> go there.






// to do:

// put alpha (edittable on third column) and put button and aplha (beta) under the table as fixed item [DONE]
// Modal window /edit button
// dynamic fixed heights
// bring back ss (should be shown)
// if ss is on, then show FE and FD (show e and d) (can't edit FE/FD)
// edit button -> Modal Windows -> should tell if edit
// accuracy inituative??
// tooltip faster -> red question next to accuracies -> breakdowns what the accuracy means (bootstrap library)
// change buttons designs add button to accuracy[DONE]
// delta scientific notions
// change tooltip info (Jack)
// CHange the width of the accuracy box (since it is only four numbers) [done]
// Button aesthestics [done]
// Fix an issue where "1" for secrecy of sample is not working/responding
