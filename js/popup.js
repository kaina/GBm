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

            var n1 = document.createElement('li');
            n1.textContent =  a;
            n1.classList.add('directory');
            var n2 = document.createElement('ol');
            n2.appendChild(n3);
            var n4 = document.createElement('div');
            n4.classList.add('directory-sub');
            n4.appendChild(n2);
            n1.appendChild(n4);
            df.appendChild(n1);
        });
        document.querySelector('#bookmarks > ol').appendChild(df);
    });
})();
