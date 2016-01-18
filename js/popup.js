(function() {
    chrome.storage.local.get([ 'isEnabled', 'bookmarks' ], function (items) {
        // TODO: ログインとか...
        if (!items.bookmarks || !document) {
            return;
        }

        // TODO: オプションで設定できるようにする
        var conf = {
            openInBackground: false,
            enableTooltip: true
        };

        function getHostName(uri) {
            var n = document.createElement('a');
            n.href = uri;
            return n.hostname;
        }

        var bookmarks = {};
        items.bookmarks.forEach(function (element, index, array) {
            var n1 = document.createElement('li');
            n1.style.backgroundImage = `url(https://www.google.com/s2/u/0/favicons?domain=${getHostName(element.url)})`;
            n1.textContent = element.title;
            // TODO: Tooltipで表示する項目
            if (conf.enableTooltip) {
                n1.setAttribute('title', `${element.title}\n${element.url}`);
            }
            n1.setAttribute('data-url', element.url);

            // 複数のラベルを持っている場合はそれぞれに持たせる
            if (element.labels.length == 0) {
                var _element = '.unlabeled';
                bookmarks[_element] = bookmarks[_element] || {};
                bookmarks[_element].items = bookmarks[_element].items || (new Array());
                bookmarks[_element].items.push(n1);
            } else {
                element.labels.forEach(function (_element, _index, _array) {
                    bookmarks[_element] = bookmarks[_element] || {};
                    bookmarks[_element].items = bookmarks[_element].items || (new Array());
                    bookmarks[_element].items.push(n1.cloneNode(true));
                });
            }
        });

        // ラベルを適当にソート
        var bookmarkLabels = new Array();
        for (var a in bookmarks) {
            if (bookmarks.hasOwnProperty(a)) {
                bookmarkLabels.push(a);
            }
        }
        bookmarkLabels.sort(function (a, b) {
            return a.localeCompare(b);
        });

        var df = document.createDocumentFragment();
        bookmarkLabels.forEach(function (a) {
            var n3 = document.createDocumentFragment();
            bookmarks[a].items.forEach(function (element, index, array) {
                element.addEventListener('click', function (e) {
                    if (e && e.target) {
                        chrome.tabs.create({
                            url: e.target.getAttribute('data-url'),
                            active: !conf.openInBackground
                        });
                    }
                });
                n3.appendChild(element);
            });

            // ラベルルート
            var n1 = document.createElement('li');
            n1.textContent =  a;
            n1.classList.add('directory');
            // mouseover,mouseoutより mouseenter,mouseleaveのほうが子ノード絡みで楽っぽい
            // http://www.buildinsider.net/web/jqueryref/019
            n1.addEventListener('mouseenter', function (e) {
                e.target.timeoutId = setTimeout(function (node) {
                    node.classList.add('expand');
                    node.timeoutId = null;
                }, 300, e.target);
            });
            n1.addEventListener('mouseleave', function (e) {
                clearTimeout(e.target.timeoutId);
                e.target.timeoutId = null;
                e.target.classList.remove('expand');
            });

            var n2 = document.createElement('ol');
            n2.appendChild(n3);
            n1.appendChild(n2);
            df.appendChild(n1);
        });
        document.querySelector('#bookmarks > ol').appendChild(df);
    });
})();
