// Copyright (c) 2011 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// Called when the user clicks on the browser action.
/*chrome.browserAction.onClicked.addListener(function(tab) {
  // No tabs or host permissions needed!
  console.log('Turning ' + tab.url + ' red!');
  chrome.tabs.executeScript({
    code: 'document.body.style.backgroundColor="red"; console.log("test")'
  });
});*/

/*chrome.tabs.onCreated.addListener(function(tab){
    chrome.tabs.executeScript(tab.id, {file: 'send_links.js', allFrames: true});
});*/

'use strict';

var getLastStatusInterval = null;

var statusList = {
    /*buildID:{
        //last status
        comment:"",
        created:"",
        id:0,
        priority:"info",
        status:"Status",
        user:"user",
        tabID:[]
    }*/
};

var observedTabs = {
    //tabID:buildID
};

function addBuild(buildID, tabID){

    chrome.pageAction.show(tabID);

    if(!statusList.hasOwnProperty(buildID)){
        console.log("Add build "+buildID+" to list");
        statusList[buildID] = {
            id:-1,
            comment:"",
            created:"",
            priority:"[unknown]",
            status:"[unknown]",
            user:"[unknown]",
            tabID:[tabID]
        };
        observedTabs[tabID] = buildID;
    } else {//уже есть такой билд, но, возможно, для другой вкладки, проверим, и если да, то добаввим вкладку в observedTabs
        if( !( statusList[buildID].tabID.indexOf(tabID)>-1 ) ){
            statusList[buildID].tabID.push(tabID);
            observedTabs[tabID] = buildID;
        }
    }
}

function processBuildList(){
    for(var b in statusList){
        if(statusList.hasOwnProperty(b) && statusList[b].hasOwnProperty("status")){
            sendRequest(b);
        }
    }
}

function sendRequest(buildID){
    $.getJSON("http://dev.exchange.academmedia.com/api/builds/"+buildID+"/statuses/last/", function(data){
        if(data.hasOwnProperty("id") && statusList[buildID].id != data.id){
            changeBuildStatus(buildID, data);
        }
    })
}

function changeBuildStatus(buildID, status){
    console.log("Build "+buildID+" change status from "+statusList[buildID].id +"("+statusList[buildID].status+")"+" to "+status.id+" ("+status.status+")");
    if(statusList[buildID].id !== -1) {//no status
        notification(buildID, status);
    }
    status.tabID = statusList[buildID].tabID;
    statusList[buildID] = status;

}

function removeBuild(buildID, tabID){
    console.log("Remove build "+buildID+" from tab "+tabID);
    chrome.pageAction.hide(tabID);
    if(statusList.hasOwnProperty(buildID)){
        delete observedTabs[tabID];

        if(statusList[buildID].tabID.length == 1){
            delete statusList[buildID];
        } else {
            for(var i = 0; i < statusList[buildID].tabID.length; i++){
                if(statusList[buildID].tabID[i] == tabID){
                    statusList[buildID].tabID.splice(i, 1);
                }
            }
        }

    }
}

function notification(buildID, status){
    var opt = {
        type: "list",
        title: "Build "+buildID+" status changed",
        message: "", //"Status changed to "+status.status+"\nUser: "+status.user,
        items:[
            {
                title:"Status:", message:status.status
            },
            {
                title:"User:", message:status.user
            }
        ],
        iconUrl: "icon.png"
    };

    chrome.notifications.create('statusChanged'+buildID+'-'+status, opt);

    return;
    chrome.notifications.getAll(function(n){
        if('statusChanged' in n){
            chrome.notifications.update('statusChanged', opt, function(z){console.log(z)});
        } else {
            chrome.notifications.create('statusChanged', opt);
        }
    });
}

function stop(){
    console.log("Stop: clear interval");
    clearInterval(getLastStatusInterval);
}

function start(){
    getLastStatusInterval = setInterval(processBuildList, 3000);
}

start();

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab){

    if(observedTabs.hasOwnProperty(tabId) && tab.url){
        if(!tab.url.match(/https?:\/\/dev.exchange.academmedia.com\/builds\/[0-9]+/i)){
            var buildID = observedTabs[tabId];
            removeBuild(buildID, tabId);
        }
    }

    if(tab.url && tab.url.match(/https?:\/\/dev.exchange.academmedia.com\/builds\/[0-9]+/i)){
        //console.log(tab);
        //chrome.tabs.executeScript(tab.id, {file: 'send_links.js', allFrames: false});
        var buildID = tab.url.match(/[0-9]+/i);
        buildID = parseInt(buildID[0]);
        if(buildID>0){
            addBuild(buildID, tabId);
        }
    }


});

chrome.tabs.onRemoved.addListener(function(tabID){

    /*for(var build in statusList){
        if(statusList.hasOwnProperty(build) && statusList[build].hasOwnProperty('tabID')){
            if(statusList[build].tabID == tabID){
                removeBuild(build);
            }
        }
    }*/

    if(tabID in observedTabs){
        removeBuild(observedTabs[tabID], tabID);
    }
});