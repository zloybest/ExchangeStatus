/**
 * Created by Vladimir Kudryavtsev on 22.09.2015.
 * (c) V.K. ozver@live.ru
 */

var s = document.createElement('script');
// TODO: add "script.js" to web_accessible_resources in manifest.json
s.src = chrome.extension.getURL('script.js');
s.onload = function() {
    this.parentNode.removeChild(this);
};
(document.head||document.documentElement).appendChild(s);