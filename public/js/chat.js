const socket = io.connect();

const body = document.body;
let popupSubmit = body.querySelector('.btn-outline-success');



let usercolor = (function (usercolor) {
    let a = String(Math.random() * 255);
    let b = String(Math.random() * 255);
    let c = String(Math.random() * 255);
    let rgb = 'rgb(' + a + ', ' + b + ', ' + c + ')';
    return rgb;
}());
let userData = {
    username: '',
    usercolor: usercolor
};


popupSubmit.addEventListener('click', function () {
    userData.username = document.body.querySelector('.username').value;
    let form = body.querySelector('.popup');
    let opacity = 'opacityToZero';

    if (userData.username) {
        form.classList.add(opacity);
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

    onlineList.appendChild(user);
});


let inputMessage = body.querySelector('.btn-submit-message');

inputMessage.addEventListener('click', function () {
    let inputField = body.querySelector('.input-message').value;

    let data = userData;
    data.message = inputField;

    if (data.message) {
        socket.emit('message', data);
        body.querySelector('.input-message').value = '';
    }
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


socket.on('connect', function () {
    socket.emit('online', {});
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

window.onunload = function () {
    socket.emit('deleteUsername', userData);
    socket.emit('writeLogout', userData);
};

let textArea = body.querySelector('#textFocus');
textArea.onfocus = function () {
    this.addEventListener('keyup', function (e) {
        e = e || window.event;
        if (e.keyCode === 13) {
            inputMessage.click();
            this.focus();
        }
    });
};