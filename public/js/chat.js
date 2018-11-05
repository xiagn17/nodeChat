const socket = io.connect();

const body = document.body;
let popupSubmit = body.querySelector('.btn-outline-success');



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


popupSubmit.addEventListener('click', function () {
    /* юзер неййма */

    let form = body.querySelector('.popup');
    let opacity = 'opacityToZero';

    let valueName = body.querySelector('.username').value;
    if (valueName) {
        this.disabled = true;
        form.classList.add(opacity);
        let online = [], onlineSimilar = [];
        
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
                let main = undefined;
                onlineSimilar = online.filter(function (user) {
                    let reg = new RegExp('^' + valueName + '\\(' + '\\d+' + '\\)$' );
                    if (user.username.search(reg) !== -1)
                        return user;
                    else if (user.username === valueName)
                        main = valueName;
                });
                if (main !== undefined)
                    onlineSimilar.main = main;


                if (onlineSimilar.length === 0){
                    if (onlineSimilar.main)
                        userData.username = onlineSimilar.main + '(' + '1' + ')';
                    else
                        userData.username = valueName;
                }
                if (!onlineSimilar.main)
                    userData.username = valueName;
                else {
                    let nextNum = 0;
                    let lengthMain = Number(valueName.length);

                    for (let i = 0; i < onlineSimilar.length; i++) {
                        let el = onlineSimilar[i].username;
                        let num = Number(el.slice(lengthMain + 1, lengthMain + 2));

                        nextNum++;
                        if (num - nextNum === 0 && i === onlineSimilar.length - 1) {
                            nextNum++;
                            userData.username = onlineSimilar.main + '(' + String(nextNum) + ')';
                        }
                        else {
                            userData.username = onlineSimilar.main + '(' + String(nextNum) + ')';
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

socket.on('userPlus', function (userData) {
    let onlineList = body.querySelector('.app-window-online-list');

    let user = document.createElement('div');
    user.className = 'user';
    user.innerText = userData.username;
    user.style.color = userData.usercolor;


    let logOutDiv = document.createElement('div');
    let chat = body.querySelector('.app-window-chat');
    let wrapper = document.createElement('div');
    wrapper.className = 'wrapper';

    logOutDiv.className = 'logOut';
    logOutDiv.innerHTML = '<span>' + userData.username + '</span> has joined!';

    wrapper.appendChild(logOutDiv);
    chat.appendChild(wrapper);

    onlineList.appendChild(user);
});


let inputMessage = body.querySelector('.btn-submit-message');
let textArea = body.querySelector('#textFocus');

textArea.onfocus = function () {
    this.addEventListener('keyup', function (e) {
        e = e || window.event;
        if (e.keyCode === 13) {
            inputMessage.click();
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



socket.on('message', function (data) {
    let message = document.createElement('div');
    let name = document.createElement('div');
    let text = document.createElement('div');

    message.className = 'message rounded';
    name.className = 'name';
    text.className = 'text';

    text.innerText = data.message;
    name.innerText = data.username;
    name.style.color = data.usercolor;
    message.appendChild(name);
    message.appendChild(text);

    let chat = body.querySelector('.app-window-chat');
    chat.appendChild(message);

    chat.scrollTop = chat.scrollHeight;
});





socket.on('online', function (usernames) {
    let onlineList = body.querySelector('.app-window-online-list');
    onlineList.innerHTML = '';

    let users = usernames.map(function (data) {
        let user = document.createElement('div');
        user.className = 'user';
        user.innerText = data.username;
        user.style.color = data.usercolor;
        return user;
    });
    users.forEach(function (user) {
        onlineList.appendChild(user);
    });
});

socket.on('writeLogout', function (username) {
    let logOutDiv = document.createElement('div');
    let chat = body.querySelector('.app-window-chat');
    let wrapper = document.createElement('div');
    wrapper.className = 'wrapper';
    logOutDiv.className = 'logOut';
    logOutDiv.innerHTML = '<span>' + username + '</span> has disconnected :(';
    wrapper.appendChild(logOutDiv);
    chat.appendChild(wrapper);

    socket.emit('online');
});

window.onunload = function () {
    socket.emit('deleteUsername', userData);
};


