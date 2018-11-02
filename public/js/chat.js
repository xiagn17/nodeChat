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
    user.innerText = String(username);

    onlineList.appendChild(user);
});

window.onbeforeunload = function() {
    return function () {
        let parent = body.querySelector('.app-window-online-list');
        let elements = parent.querySelector('.name');
        let data = {
            parent: parent,
            element: function () {
                elements.forEach(function (el) {
                    if (el === String(username)){
                        return el;
                    }
                });
            }()
        };

        return socket.emit('userMinus', data);
    }();
};

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
    text.innerText = data.message;
    name.innerText = data.username;
    message.appendChild(name);
    message.appendChild(text);

    let chat = body.querySelector('.app-window-chat');
    chat.appendChild(message);
});