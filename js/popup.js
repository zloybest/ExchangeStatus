/**
 * Created by Vladimir Kudryavtsev on 26.09.2015.
 * (c) V.K. ozver@live.ru
 */

'use strict';

var bgWindow = chrome.extension.getBackgroundPage();
if(bgWindow){


    var statusList = bgWindow.statusList;

}

function renderStatusList(){
    var icon = '';
    var noItems = true;
    for(var s in statusList){
        if(statusList.hasOwnProperty(s)){
            noItems = false;
            switch(statusList[s].priority){
                case 'danger':
                    icon = ' <span class="glyphicon glyphicon-exclamation-sign icon-danger" aria-hidden="true"></span> ';
                    break;
                case 'success':
                    icon = ' <span class="glyphicon glyphicon-ok-sign icon-success" aria-hidden="true"></span> ';
                    break;
                case 'info':
                    icon = ' <span class="glyphicon glyphicon-hourglass icon-info" aria-hidden="true"></span> ';
                    break;
                case 'warning':
                    icon = ' <span class="glyphicon glyphicon-exclamation-sign icon-warning" aria-hidden="true"></span> ';
                    break;
            }
            $('#statusList').append('<tr'+(statusList[s].priority=='danger'?' class="danger"':'')+'> <td>'+icon+'</td> <td><a href="http://dev.exchange.academmedia.com/builds/'+s+'/" target="_blank" id="item'+s+'" title="'+s+'">'+statusList[s].title+'</a></td><td>'+statusList[s].status+'</td><td>'+statusList[s].user+'</td> </tr>');
            $('#item'+s).click(function(e){
                e.preventDefault();
                return goToTab(statusList[s].tabID);
            });
        }
    }

    if(noItems){$('.main').append("<div class='no-items'>No active builds. Open any Exchange page with build.</div>");}
}

function goToTab(tabId){
    chrome.tabs.update(tabId[0], {selected: true});
    return false;
}


document.addEventListener('DOMContentLoaded', function(){
    renderStatusList();
});

