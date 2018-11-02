



const socket = io.connect();

const body = document.body;
let popupSubmit = body.querySelector('.btn-outline-success');

let username;

popupSubmit.addEventListener('click', function () {
    username = document.body.querySelector('.username').value;
    let form = body.querySelector('.popup');
    let opacity = 'opacityToZero';

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
                socket.emit('userPlus', username);
            }
        );

    // передача через socket на сервер username
});

socket.on('userPlus', function (username) {
    let onlineList = body.querySelector('.app-window-online-list');

    let user = document.createElement('div');
    user.className = 'user';
    user.innerText = username;
    onlineList.appendChild(user);
});


let inputMessage = body.querySelector('.btn-submit-message');

inputMessage.addEventListener('click', function () {
    let inputField = body.querySelector('.input-message').value;
    let data = {
        message: inputField,
        username: username
    };
    socket.emit('message', data);

    body.querySelector('.input-message').value = '';
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
    message.appendChild(name);
    message.appendChild(text);

    let chat = body.querySelector('.app-window-chat');
    chat.appendChild(message);
});


socket.on('connect', function () {
    socket.emit('online', {});
});


socket.on('online', function (usernames) {
    let onlineList = body.querySelector('.app-window-online-list');
    onlineList.innerHTML = '';
    let users = usernames.map(function (username) {
        let user = document.createElement('div');
        user.className = 'user';
        user.innerText = username;
        return user;
    });
    users.forEach(function (user) {
        onlineList.appendChild(user);
    });
});

window.onunload = function () {
    socket.emit('deleteUsername', username);
};