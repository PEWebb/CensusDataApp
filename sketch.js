var apiKey = "e90ca866a6b80b3011afdd281c015b9cb8760601"; // TODO: add api key here

var mouseRectangles = {};
var titlesMouseRectangles = {};
var selectedRectangle = null;
var sortingKey = ""

var request = {
  "level": "state",
  "lat": "38.9047",
  "lng": "-77.0164",
  "container": "us",
  "sublevel": true,

  "variables": [
    "correctional_facilities_2010",
    "juvenile_detention_facilities_2010",
    "mental_health_facilities_2010",
    "nursing_homes_2010",
    "population_2010"
  ],
  "api": "sf1",
  "year": "2010"
}

var c;
var titleString;
var loaded = false;

// Use this variable to keep track of which
// color you want to use to represent each variable
var colorMap = {
  "correctional_facilities_2010": 220,
  "juvenile_detention_facilities_2010": 220,
  "mental_health_facilities_2010": 220,
  "nursing_homes_2010": 220,

}

var stateName = {
  "Alaska": "AK",
  "Alabama": "AL",
  "Arizona": "AZ",
  "Arkansas": "AR",
  "California": "CA",
  "Colorado": "CO",
  "Connecticut": "CT",
  "Delaware": "DE",
  "District of Columbia": "DoC",
  "Florida": "FL",
  "Georgia": "GA",
  "Hawaii": "HI",
  "Idaho": "ID",
  "Illinois": "IL",
  "Indiana": "IN",
  "Iowa": "IA",
  "Kansas": "KS",
  "Kentucky": "KY",
  "Louisiana": "LA",
  "Maine": "ME",
  "Maryland": "MD",
  "Massachusetts": "MA",
  "Michigan": "MI",
  "Minnesota": "MN",
  "Mississippi": "MS",
  "Missouri": "MO",
  "Montana": "MT",
  "Nebraska": "NE",
  "Nevada": "NV",
  "New Hampshire": "NH",
  "New Jersey": "NJ",
  "New Mexico": "NM",
  "New York": "NY",
  "North Carolina": "NC",
  "North Dakota": "ND",
  "Ohio": "OH",
  "Oklahoma": "OK",
  "Oregon": "OR",
  "Pennsylvania": "PA",
  "Rhode Island": "RI",
  "South Carolina": "SC",
  "South Dakota": "SD",
  "Tennessee": "TN",
  "Texas": "TX",
  "Utah": "UT",
  "Vermont": "VT",
  "Virginia": "VA",
  "Washington": "WA",
  "West Virginia": "WV",
  "Wisconsin": "WI",
  "Wyoming": "WY",
  "Puerto Rico": "PR"
}

var facilityData = {}; //facilityData is a dictionary
var maxValues = {
  "correctional_facilities_2010": 0,
  "juvenile_detention_facilities_2010": 0,
  "mental_health_facilities_2010": 0,
  "nursing_homes_2010": 0
}
var maxRates = {
  "correctional_facilities_2010": 0,
  "juvenile_detention_facilities_2010": 0,
  "mental_health_facilities_2010": 0,
  "nursing_homes_2010": 0
}

function preload() {
  var sdk = new CitySDK(); //Create the CitySDK Instance
  census = sdk.modules.census; //Create an instance of the module
  census.enable(apiKey); //Enable the module with the api key

  census.APIRequest(request, function(response) {
    //print(response);
    rawData = response.data;
    for (var i = 0; i < rawData.length; i++) {
      var total = 0;
      state = rawData[i]["name"]
      facilityData[state] = {}
      facilityData[state]["population_2010"] = Number(rawData[i]["population_2010"]);
      for (key in rawData[i]) {
        if (key != "name" && key != "state" && key != "population_2010") {
          facilityData[state][key] = Number(rawData[i][key]);
          if (facilityData[state][key] > maxValues[key]) {
            maxValues[key] = facilityData[state][key]
          }
          var rate = facilityData[state][key] / facilityData[state]["population_2010"]
          if (rate > maxRates[key]) {
            maxRates[key] = rate
          }
        }
      }
      facilityData[state]["total"] = total;
      loaded = true
    }

    print(facilityData);
    print(maxValues);
    print(maxRates);
  })

}

function writeTitle(xPos, title) {
  //state titles
  push();
  textFont("Optima");
  textSize(10);
  textAlign(CENTER, CENTER);
  fill(255);
  text(title, xPos, 50);
  pop();

}

function setup() {
  createCanvas(windowWidth, windowHeight);
  titleString = "Population per State Living in Fringe Facilities in 2010";

}

function draw() {
  bottomPadding = 20;
  rightPadding = 20;
  leftPadding = 50;
  linesTop = 60
  background(0);
  var r = min(width / 2, height / 2);



  //background lines
  push();
  strokeWeight(0.25);
  stroke(255);
  for (var x = 0; x < width - 10; x++) {
    var xPos = map(x, 0, 51, 20, width - rightPadding);
    line(xPos, linesTop, xPos, height - bottomPadding);
  }
  pop();


  //titles
  push();
  noStroke();
  textFont("Optima");
  textSize(14);
  fill(255);
  textAlign(CENTER);
  text(titleString, width / 2, 25);
  textAlign(LEFT);
  barHeight = (height - bottomPadding - linesTop) / 4
  j=0
  for (facilityTitle in maxValues) {
    currFacilityTitle = capitalizeFirstLetters(facilityTitle.replace(/_/g, " ").replace(/2010/g, ""))
    text( currFacilityTitle, leftPadding - 30, j*barHeight+80)
    if (!titlesMouseRectangles[facilityTitle]){
      titlesMouseRectangles[facilityTitle] = {x1: leftPadding - 30, x2:leftPadding - 30+textWidth(currFacilityTitle), y1:j*barHeight+80-7, y2:j*barHeight+80+7}
    }
    j++
  }
  pop();


  //each state population in correctional_facilities_2010
  push();
  strokeWeight(4);
  stroke(0);

  x = 0;
  rectMode(CORNERS)
  sortedKeys = getSortedKeys(facilityData, sortingKey)
  for (var i=0; i<sortedKeys.length; i++) {
    //print (sortedKeys[i]+" "+facilityData[sortedKeys[i]]["correctional_facilities_2010"])
  }
  for (var i=0; i<sortedKeys.length; i++) {
    state = sortedKeys[i]
    var xPos = map(x, 0, 51, 20, width - rightPadding);
    writeTitle(xPos, stateName[state])
    h = 0;
    for (key in facilityData[state]) {
      if (key != "total" && key != "population_2010") {
        var y = map(facilityData[state][key] / facilityData[state]["population_2010"], 0, maxRates[key], barHeight, 0);
        var _x1 = xPos - 6;
        var _x2 = xPos + 6;
        var _y1 = h * barHeight + linesTop + y;
        var _y2 = (h + 1) * barHeight + linesTop;
        var _key = state + ',' + key;
       //if (!mouseRectangles[_key]) {
          mouseRectangles[_key] = {
            x1: _x1,
            y1: _y1,
            x2: _x2,
            y2: _y2
          };
        //}
        if (selectedRectangle == _key) {
          stateKey = split(selectedRectangle, ",")
          if (stateKey && stateKey.length==2) {
            currStateName = stateKey[0]
            variableName = stateKey[1]
             // titleString ="Population of " + currStateName + " living in " + variableName.replace(/_/g, " ").replace(/2010/g, "") + "in 2010 was " + facilityData[currStateName][variableName] 
        titleString ="There were " + facilityData[currStateName][variableName] + " people living in " + variableName.replace(/_/g, " ").replace(/2010/g, "") + "in " +  currStateName + " in 2010"; 
          
         
          }
          cursor(HAND)
          fill(255, 80, 80);
        } else {   
          cursor(ARROW);
          fill(colorMap[key]);
        }


        rect(_x1, _y1, _x2, _y2);
        h++
      }

    }
    x++
  }
}



//text information about population in facilities in each state
// push();
// noStroke();
// fill(255, 255, 255, 200);
// rect(795, 65, 180, 100)
// textFont("Optima");
// textSize(10);
// fill(0);
// noStroke();
// var x = 100;
// for (key in facilityData["Vermont"]) {
//   text("Population of " + facilityData.name + " living in: ", 800, 80);
//   text(key + ": " + facilityData["Vermont"][key], 800, x); 
//   x+=10;
// }
// pop();



// draw the pie chart
// push();
// translate(width/2, height/2);

// var angle = 0;
// noStroke();
// for (key in facilityData["Vermont"]) {
//   if (key != "total" && key!="population_2010") {
//     rotate(angle);
//     angle = map(facilityData["Vermont"][key], 0, facilityData["Vermont"].total, 0, TWO_PI);
//     fill(colorMap[key]);
//     arc(0, 0, r, r, 0, angle);
//   }
// }
// pop();

function getSortedKeys(obj, facility) {
    var keys = []; for(var key in obj) keys.push(key);
    if (facility=="") {
      return keys
    }
    else {
      return keys.sort(function(a,b){return obj[a][facility]/ facilityData[a]["population_2010"]-obj[b][facility]/ facilityData[b]["population_2010"]});
    }
}

function capitalizeFirstLetters(string) {
    var words = split(string, " ")
    var capitalizedString=""
    for( var i=0; i<words.length; i++) {
      capitalizedString+= words[i].charAt(0).toUpperCase() + words[i].slice(1)+" ";
    }
    return capitalizedString
}


function mouseMoved() {
  for (var key in mouseRectangles) {
    var rectangle = mouseRectangles[key];
    if (mouseX >= rectangle.x1 && mouseY >= rectangle.y1 && mouseX < rectangle.x2 && mouseY < rectangle.y2) {
      selectedRectangle = key;
      //console.log('Change the color of ' + key);
      return false;
    }
  }
  selectedRectangle = null;
  return false;
}

function mouseClicked() {
  for (var key in titlesMouseRectangles) {
    var rectangle = titlesMouseRectangles[key];
    if (mouseX >= rectangle.x1 && mouseY >= rectangle.y1 && mouseX < rectangle.x2 && mouseY < rectangle.y2) {
      sortingKey = key;
      //console.log('Change the color of ' + key);
      return false;
    }
  }
  selectedRectangle = null;
  return false;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}