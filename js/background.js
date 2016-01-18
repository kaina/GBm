(function() {
    var alermName = 'GBkSsubscription';

    function collectBookmarks() {
        function parseItem(node) {
            var r = {
                // 1文字も入れてないと空でなく title自体がなくなる?
                title: (node.querySelector('title') || { textContent: '' }).textContent,
                url: node.querySelector('url').textContent,
                timestamp: node.querySelector('timestamp').textContent,
                id: node.querySelector('id').textContent,
                labels: new Array()
            };
            var labels = node.querySelectorAll('labels > label');
            if (labels) {
                for (var i = 0; i < labels.length; ++i) {
                    r.labels.push(labels[i].textContent);
                }
            }
            return r;
        }

        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function () {
            if ((xhr.readyState !== 4) || !xhr.responseXML) {
                // responseXMLがないのはログインしてない時
                return;
            }
            var nodes = xhr.responseXML.querySelectorAll('bookmark');
            if (nodes) {
                console.log(`bcount = ${nodes.length}`);
                var list = new Array();
                for (var i = 0; i < nodes.length; ++i) {
                    var r = parseItem(nodes[i]);
                    list.push(r);
                }
                chrome.storage.local.set({ bookmarks: list }, function () {
                    console.log(`lcount = ${list.length}`);
                });
            }
            xhr = null;
        };
        xhr.open('GET', 'http://www.google.com/bookmarks/?output=xml', true);
        xhr.send(null);
    }

    chrome.runtime.onInstalled.addListener(function () {
        chrome.alarms.clear(alermName, function (wasCleared) {
            collectBookmarks();
            chrome.alarms.create(alermName, { periodInMinutes: 10 });
        });
    });

    chrome.alarms.onAlarm.addListener(function (alerm) {
        if (alerm.name == alermName) {
            collectBookmarks();
        }
    });

})();
