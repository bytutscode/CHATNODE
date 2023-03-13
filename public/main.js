const socket = io();

let userName = '';
let userList = [];

const nickNamePage = document.querySelector('#nickNamePage');
const chatPage = document.querySelector('#chatPage');
const inputNick = document.querySelector('#inputNick');
const chatInput = document.querySelector('#chatinput');
const chatArea = document.querySelector('#chatArea');

function renderList (){
    let ul = document.querySelector('.usersArea');
    ul.innerHTML = '';

    userList.forEach(user =>{
        ul.innerHTML+='<li>'+user+'</li>';
    });
};

function addWarning (type,user,msg){
    let element = document.createElement('li');

    switch(type){
        case 'warning': 
            element.classList.add('chat-actions');
            element.innerHTML = `${user} ${msg}`;
            chatArea.append(element);
        break;

        case 'mensage':
            element.innerHTML=`<span class="${userName==user?'me':''}">${user}</span> ${msg}`;
            chatArea.append(element);
        break;
        case 'connection':
            element.classList.add('chat-actions');
            element.innerHTML = msg;
            chatArea.append(element);
        break;
    }

    chatArea.scrollTop = chatArea.scrollHeight;
}


nickNamePage.style.display = 'flex';
chatPage.style.display = 'none';

inputNick.addEventListener('keyup',(e)=>{
    if(e.keyCode === 13){
        let name = inputNick.value.trim();
        if(name != ''){
            userName = name;
            document.title = 'chat ('+userName+')';

            socket.emit('join-request',userName);
        }
    }
});

chatInput.addEventListener('keyup',(e)=>{
    if(e.keyCode === 13 && chatInput.value != ''){
        let msg = chatInput.value.trim();
        socket.emit('new-mensage',msg);
        chatInput.value = '';
    }
})

socket.on('user-ok',(list)=>{
    nickNamePage.style.display = 'none';
    chatPage.style.display = 'flex';
    chatInput.focus();
    
    addWarning('connection',null,'Você entrou na conversa. :)')
    userList = list;
    renderList();
});


socket.on('updated-list',(data)=>{
    userList = data.list;
    if(data.left){
      addWarning('warning',data.left,'Saiu da conversa!')
    } 
    if(data.joined){
       addWarning('warning',data.joined, 'entrou na conversa!')
    }
    renderList();
});

socket.on('show-mensage',(data)=>{
    addWarning('mensage',data.userName,data.mensage);
});

socket.on('disconnect',()=>{
    addWarning('connection',null,'Você está desconectado!');
    userList = [];
    renderList();
});

socket.io.on('reconnect_error',()=>{
    addWarning('connection',null,'tentando reconectar ao servidor...');
});

socket.io.on('reconnect',()=>{
    addWarning('connection', null, 'Você foi reconectado!');
    if(userName != ''){
        socket.emit('join-request', userName);
    }
})


