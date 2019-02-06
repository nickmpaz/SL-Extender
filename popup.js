//global variables
var goodURL1 = 'https://www.surfline.com/surf-report/';
var goodURL2 = 'http://www.surfline.com/surf-report/';
var btn = document.getElementById('btn');
var tField = document.getElementById('tField');
var info = document.getElementById('info');

//get sURL and make the display upon browser action
chrome.storage.sync.get('sURL', function(data){

  makeDisplay(data.sURL);

});

//handles URL submissions
btn.onclick = function(){

  //get field input
  let submission = tField.value;

  //if verify URL is valid add to sURL
  if(verifyURL(submission)) addInfo(submission);

  //clear tField 
  tField.value = '';
  
}

//verify new URLs 
function verifyURL(submission) {

  let valid = true;

  //if text field does not contain goodURL1 or goodURL2
  if(!submission.includes(goodURL1) && !submission.includes(goodURL2)) valid = false;

  return valid;

}

//add a URL to sURL
function addInfo(newBreak) {

  //get sURL from storage
  chrome.storage.sync.get('sURL', function(data){

    //push new surfline URL to sURL
    let sArray = data.sURL;
    sArray.push(newBreak);

    //
    
    //store new array 
    chrome.storage.sync.set({sURL: sArray}, function() {
    
    });

  })

}

//remove a URL from sURL (at rIndex)
function removeInfo(rIndex){

  //get sURL from stoarage
  chrome.storage.sync.get('sURL', function(data){

    //remove desired index
    let sArray = data.sURL;
    sArray.splice(rIndex, 1)
    
    //store new array 
    chrome.storage.sync.set({sURL: sArray}, function() {
    
    });

  })

}

//make the popup display based on array of URLs sURL
async function makeDisplay(sURL) {

  clearDisplay();

  //create temporary message
  temp = document.createElement('h1');
  temp.innerHTML = 'Fetching Surf Conditions...'
  info.appendChild(temp);

  //await a promise for an array of DOMS
  let DOMArray = await getDOMS(sURL);

  clearDisplay();

  //for each DOM: get conditions, make a node, and append it to info
  for(let i = 0; i < DOMArray.length; i++) {

    info.appendChild(makeNode(getConditions(DOMArray[i], i, sURL[i])));

  }

}

//returns a promise for an array of surfline DOMs based on the array 
//of URLs sURL. If a URL in sURL is results in 404 or error, a null DOM is returned
function getDOMS(sURL) {

  //async to await individual XMLHttpRequest.response promises
  return new Promise(async function(resolve, reject) {

    //declare an array 
    let promiseArray = [];

    //for each element in sURL
    for(let i = 0; i < sURL.length; i++) {

      try {

        //await a promise for the DOM
        let newPromise = await makePromise(sURL[i]);
        promiseArray.push(newPromise);

      }
      catch {

        //if makePromise throws a reject, push a null DOM 
        promiseArray.push(null);

      }


    }

    resolve(promiseArray);

  });

}

//returns a promise for an XMLHttpRequest.response 
function makePromise(stringURL) {

  return new Promise(function(resolve, reject) {
    
    let xhr = new XMLHttpRequest();
  
    xhr.responseType = "document";
  
    xhr.open("GET", stringURL, true);

    xhr.onreadystatechange = function() {
  
      //if all works, resolve with the response
      if (xhr.readyState == 4 && xhr.status === 200) {

        resolve(xhr.response);

      }
      //if page not found throw a reject
      else if (xhr.readyState == 4 && xhr.status === 404) {

        reject();

      }

    }

    //throw a reject upon network errors
    xhr.onerror = function() {reject()};

    xhr.send();

  });

}

//remove all child nodes from info
function clearDisplay() {

  var info = document.getElementById('info');

  while(info.firstChild){

    info.removeChild(info.firstChild);

  }

}

//use an array of conditions to return a node for the popup 
function makeNode(conditions) {

  //make containerNode
  let containerNode = document.createElement('div');
          
  //make nameContainer
  let nameContainer = document.createElement('div');
  //adding a class for the conditions allows the banner to be colored correctly
  nameContainer.setAttribute("class", "name-container " + conditions[2]);
  
  nameItem = document.createElement('h2');
  let nameNode = document.createTextNode(conditions[1] + ': ' + conditions[2])
  nameItem.setAttribute("class", "grid-item" );
  nameItem.appendChild(nameNode);

  removeItem = document.createElement('p');
  removeButton = document.createElement("BUTTON");
  removeButton.appendChild(document.createTextNode('X'));
  removeButton.style.width = '25px';
  removeButton.style.height = '25px';
  removeButton.onclick = function(){removeInfo(conditions[0])}
  removeItem.appendChild(removeButton);

  naviItem = document.createElement('p');
  naviButton = document.createElement("BUTTON");
  naviButton.appendChild(document.createTextNode('Go to Surfline'));
  naviButton.style.height = '25px';
  naviButton.onclick = function(){chrome.tabs.create({url: conditions[7]})} 
  naviItem.appendChild(naviButton);

  //append stuff to nameContainer
  nameContainer.appendChild(nameItem);
  nameContainer.appendChild(naviItem);
  nameContainer.appendChild(removeItem);

  
  //make conditionsContainer
  let conditionsContainer = document.createElement('div');
  conditionsContainer.setAttribute("class", "conditions-container" );

  heightItem = document.createElement('p');
  heightHeading = document.createElement('h3');
  heightHeading.innerHTML = 'Surf Height:';
  heightNode = document.createTextNode(conditions[3]);
  heightItem.setAttribute("class", "grid-item" );
  heightItem.appendChild(heightHeading);
  heightItem.appendChild(heightNode);

  tideItem = document.createElement('p');
  tideHeading = document.createElement('h3');
  tideHeading.innerHTML = 'Tide:';
  tideNode = document.createTextNode(conditions[4]);
  tideItem.setAttribute("class", "grid-item" );
  tideItem.appendChild(tideHeading);
  tideItem.appendChild(tideNode);

  windItem = document.createElement('p');
  windHeading = document.createElement('h3');
  windHeading.innerHTML = 'Wind:';
  windNode = document.createTextNode(conditions[5]);
  windItem.setAttribute("class", "grid-item" );
  windItem.appendChild(windHeading);
  windItem.appendChild(windNode);

  swellItem = document.createElement('p');
  swellHeading = document.createElement('h3');
  swellHeading.innerHTML = 'Swell:';
  swellNode = document.createTextNode(conditions[6]);
  swellItem.setAttribute("class", "grid-item" );
  swellItem.appendChild(swellHeading);
  swellItem.appendChild(swellNode);

  //append stuff to conditionsContainer
  conditionsContainer.appendChild(heightItem);
  conditionsContainer.appendChild(tideItem);
  conditionsContainer.appendChild(windItem);
  conditionsContainer.appendChild(swellItem);

  //append nameNode and conditionsContainer to containerNode
  containerNode.appendChild(nameContainer);
  containerNode.appendChild(conditionsContainer);

  return containerNode;

}

//returns an array of conditions for making the node
function getConditions(DOM, i, sURL) {

  try {

    //this gets an array of elements with specified class
    nameElements = DOM.getElementsByClassName("sl-forecast-header__main__title");
    nameString = nameElements[0].textContent;
    nameString = nameString.replace(' Surf Report & Forecast','');

    //=========================================================================================

    //this gets an array of elements with specified class
    qualityElements = DOM.getElementsByClassName("sl-spot-report");
    qualityString = qualityElements[0].childNodes[0].innerHTML;

    //=========================================================================================

    //this gets an array of elements with specified class
    forecastElements = DOM.getElementsByClassName("sl-spot-forecast-summary__wrapper");
    //sets the parent node which contains the info we want
    parentNode = forecastElements[0];
    //creates a nodeList of the children of parentNode
    childNodes = parentNode.childNodes;

    //=========================================================================================

    //collect surf height info
    heightNode = childNodes[0];
    heightNode1 = heightNode.childNodes[0];
    heightNode2 = heightNode1.childNodes[1];
    heightString = heightNode2.innerHTML;
    //format surf height info
    heightString = heightString.substring(0, heightString.indexOf('<')) + ' ft.';

    //=========================================================================================

    //collect tide info
    tideNode = childNodes[1];
    tideNode1 = tideNode.childNodes[0];
    tideNode2 = tideNode1.childNodes[1];
    tideNode3 = tideNode1.childNodes[2];
    tideNodeNow = tideNode2.childNodes[0];
    tideNodeFuture = tideNode3.childNodes[0];

    tideString1 = tideNodeNow.innerHTML;
    tideString2 = tideNodeFuture.innerHTML;

    tideString = tideString1 + tideString2;
    tideString = tideString.replace('<sup>','');
    tideString = tideString.replace('</sup>','');
    tideString = tideString.replace('<br>','');
    tideString = tideString.replace('FTLow tide', ' ft ->');
    tideString = tideString.replace('FTHigh tide', ' ft ->');
    tideString = tideString.replace('ftat', ' ft at');
    
    //=========================================================================================

    //collect wind info
    windNode = childNodes[2];
    windNode1 = windNode.childNodes[0];
    windNode2 = windNode1.childNodes[1];
    windDirection = windNode1.childNodes[2];
    windSpeed = windNode2.childNodes[0];

    windString1 = windSpeed.innerHTML;
    windString2 = windDirection.innerHTML;

    windString = windString1 + windString2;
    windString = windString.replace('<sup>KTS</sup>', ' kts ');

    //=========================================================================================

    //collect swells info
    swellNode = childNodes[3];
    swellNode1 = swellNode.childNodes[0];
    swellNode2 = swellNode1.childNodes[1];
    swellNode3 = swellNode2.childNodes[0];
    swellString = swellNode3.textContent;

    //=========================================================================================

    return [i, nameString, qualityString, heightString, tideString, windString, swellString, sURL];

  }
  catch(err) {

    return [i, 'Error', '', '', '', '', '', sURL]

  }

}

//storage onChanged callback function 
function storageChange(changes, area) {

  //array of names of the keys that changed
  //should either be sURL or conditions
  var changedItems = Object.keys(changes);
 
  for (var item of changedItems) {

    makeDisplay(changes[item].newValue);

  }

}

//add listener for storage changes
chrome.storage.onChanged.addListener(storageChange);





