document.addEventListener("DOMContentLoaded", function() {
    const socket = io.connect();
    const body = document.body;



    let usercolor = (function () {
        function random() {
            return String(Math.random() * 255);
        }
        return 'rgb(' + random() + ', ' + random() + ', ' + random() + ')';
    }());
    let userData = {
        username: '',
        usercolor: usercolor
    };



    let popupSubmit = body.querySelector('.btn-outline-success');
    popupSubmit.addEventListener('click', function () {
        let form = body.querySelector('.popup');
        let opacity = 'opacityToZero';

        let valueName = body.querySelector('.username').value;

        let regSymbols = /[[\\^$.|?*+()]+/;
        if (valueName.search(regSymbols) !== -1) {
            alert('Forbidden symbol: ' + valueName.match(regSymbols)[0]);
            return false;
        }
        if (valueName) {
            this.disabled = true;
            let online, onlineSimilar = [];

            form.classList.add(opacity);

            function getJson() {
                return new Promise(function (resolve, reject) {
                    let request = new XMLHttpRequest();
                    request.open('GET', 'server/onlineUsers.json', true);
                    request.onload = function() {
                        if (request.status >= 200 && request.status < 400){
                            online = JSON.parse(request.responseText);
                            resolve(online);
                        }
                        else {
                            let error = new Error(this.statusText);
                            error.code = this.status;
                            reject(error);
                        }
                    };
                    request.onerror = function() {
                        reject(new Error('JSON didn\'t load'));
                    };
                    request.send();
                });
            }

            getJson()
                .then(function (online) {

                    for (let key in online) {
                        let reg = new RegExp('^' + valueName + '\\(' + '\\d+' + '\\)$' );
                        let client = online[key];

                        if (client.username.search(reg) !== -1)
                            onlineSimilar.push(client);
                        else if (client.username === valueName)
                            onlineSimilar.main = valueName;
                    }

                    if (!onlineSimilar.main)
                        userData.username = valueName;
                    else if (onlineSimilar.length === 0){
                        userData.username = onlineSimilar.main + '(' + '1' + ')';
                    }
                    else {
                        let curPos = 0;
                        let lengthMain = Number(valueName.length);

                        for (let i = 0; i < onlineSimilar.length; i++) {
                            let username = onlineSimilar[i].username;
                            let num = Number(username.slice(lengthMain + 1, lengthMain + 2));

                            curPos++;
                            if (num - curPos === 0) {
                                if (i === onlineSimilar.length - 1) {
                                    curPos++;
                                    userData.username = onlineSimilar.main + '(' + String(curPos) + ')';
                                }
                            }
                            else {
                                userData.username = onlineSimilar.main + '(' + String(curPos) + ')';
                                break;
                            }
                        }
                    }
                });



            let promise = new Promise(function (resolve, reject) {
                setTimeout(function () {
                    form.classList.remove(opacity);
                    resolve('result');
                }, 1000);

            });
            promise
                .then(
                    function (result) {
                        form.style.display = 'none';
                        socket.emit('userPlus', userData);
                    }
                );

        }

    });


    let inputMessage = body.querySelector('.btn-submit-message');
    let textArea = body.querySelector('#textFocus');

    textArea.onfocus = function () {
        this.addEventListener('keyup', function (event) {
            event = event || window.event;
            if (event.keyCode === 13) {
                inputMessage.click();
            }
            else if (event.keyCode !== 8){
                socket.emit('typing', userData);
            }
        });
    };

    inputMessage.addEventListener('click', function () {
        let inputField = body.querySelector('.input-message').value;

        let data = userData;
        data.message = inputField;

        if (data.message && data.username) {
            socket.emit('message', data);

            body.querySelector('.input-message').value = '';

            let icon = body.querySelector('.fa-paper-plane');
            icon.style.transform = 'scale3d(0, 0, 0) rotate(270deg)';
            setTimeout(function () {
                icon.style.transform = '';
            }, 350);

            textArea.focus();
        }
        else if (!data.username)
            location.reload();

    });

    let chat = body.querySelector('.app-window-chat');
    chat.addEventListener('DOMNodeInserted', function (event) {
        if (body.querySelector('.typing')) {
            let typing = body.querySelector('.typing');
            typing.style.top = String(chat.scrollHeight - 25) + 'px';
        }

        let newEl = event.target;
        if (chat.scrollTop + newEl.clientHeight + 20 > chat.scrollHeight - chat.clientHeight)
            chat.scrollTop = chat.scrollHeight;

    });

    socket.on('typing', function (Data) {

        function search(str, sub) {
            function hash(str, length) {
                let hash = 0;
                const primeNum =  1046527;
                for (let i = 0; i < length; i++)
                    hash += str.charCodeAt(i) * Math.pow(2, length - i - 1);

                return hash % primeNum;
            }
            for (let i = 0; i < str.length - sub.length + 1; i++){
                let hashSub = hash(sub, sub.length);
                let newStr = str.slice(i);
                if (hash(newStr, sub.length) === hashSub) {
                    let checker = true;
                    for (let j = 0; j < sub.length; j++)
                        if (newStr[j] !== sub[j])
                            checker = false;
                    if (checker)
                        return i;
                }
            }
            return -1;
        }

        if (userData.username !== Data.username) {
            if (!body.querySelector('.typing')){
                var typing = document.createElement('div');
                var users = document.createElement('div');

                users.className = 'users';
                users.textContent = Data.username;
                typing.innerHTML = users.outerHTML + ' is typing...';
                typing.className = 'typing';

                chat.appendChild(typing);

                setTimeout(function () {
                    chat.removeChild(typing);
                }, 2000)
            }
            else {
                users = body.querySelector('.users');
                if (search(users.textContent, Data.username) === -1) {
                    var pos = users.textContent.length;
                    users.innerHTML += ', ' + Data.username;
                }
                setTimeout(function () {
                    let str = users.textContent;
                    str.slice(0, pos);
                }, 2000);
            }
        }
    });

    socket.on('userPlus', function (userData) {
        let logOutDiv = document.createElement('div');
        let wrapper = document.createElement('div');
        let user = document.createElement('div');

        user.className = 'user';
        user.textContent = userData.username;
        user.style.color = userData.usercolor;

        logOutDiv.className = 'logOut';
        logOutDiv.innerHTML = '<span>' + userData.username + '</span> has joined!';

        wrapper.className = 'wrapper';
        wrapper.appendChild(logOutDiv);

        chat.appendChild(wrapper);

        let onlineList;
        if (document.documentElement.clientWidth < 576)
            onlineList = body.querySelector('.slide-online .app-window-online-list');
        else
            onlineList = body.querySelector('.app-window-online-list');

        onlineList.appendChild(user);
    });


    socket.on('message', function (data) {
        let message = document.createElement('div');
        let name = document.createElement('div');
        let text = document.createElement('div');


        name.className = 'name';
        name.textContent = data.username;
        name.style.color = data.usercolor;

        text.className = 'text';
        text.textContent = data.message;

        message.appendChild(name);
        message.appendChild(text);
        message.className = 'message rounded';

        chat.appendChild(message);
    });


    socket.on('online', function (userDatas) {
        let onlineList;
        if (document.documentElement.clientWidth < 576)
            onlineList = body.querySelector('.slide-online .app-window-online-list');
        else
            onlineList = body.querySelector('.app-window-online-list');

        onlineList.innerHTML = '';

        if (JSON.stringify(userDatas) === '{}')
            return true;

        let users = [];
        for (let key in userDatas) {
            let user = document.createElement('div');
            user.className = 'user';
            user.textContent = userDatas[key].username;
            user.style.color = userDatas[key].usercolor;
            users.push(user);
        }

        users.forEach(function (user) {
            onlineList.appendChild(user);
        });
    });

    socket.on('writeLogout', function (username) {
        if (username === userData.username)
            location.reload();

        let wrapper = document.createElement('div');
        let logOutDiv = document.createElement('div');

        logOutDiv.className = 'logOut';
        logOutDiv.innerHTML = '<span>' + username + '</span> has disconnected :(';
        wrapper.className = 'wrapper';
        wrapper.appendChild(logOutDiv);

        chat.appendChild(wrapper);

        socket.emit('online');
    });

    let slideBtn = body.querySelector('a.slide-btn');
    slideBtn.addEventListener('click', function (event) {
        event.preventDefault();
        this.classList.toggle('slide-btn-active');

        let slider = body.querySelector('.slide');
        slider.classList.toggle('slide-active');
    });


});


