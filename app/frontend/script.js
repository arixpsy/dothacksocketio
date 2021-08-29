let displayName = "";
let users = {};

const DisplayNameInput = document.getElementById("displayNameInput");
const LoginContainer = document.getElementById("loginContainer");
const AppContainer = document.getElementById("appContainer");
const UsersContainer = document.getElementById("userContainer");
const MessageContainer = document.getElementById("messageContainer");
const MessageInput = document.getElementById("messageInput");

const allUsersHTML = (users) => {
  htmlOutput = "";
  for (const user of Object.values(users)) {
    htmlOutput += `<span class="badge rounded-pill bg-primary">${user.displayName}</span>`;
  }
  return htmlOutput;
};

const enterDisplayName = () => {
  if (DisplayNameInput.value.length > 5) {
    displayName = DisplayNameInput.value;
    LoginContainer.classList.toggle("d-none");
    AppContainer.classList.toggle("d-none");

    socket.auth = {
      displayName: displayName,
    };
    socket.connect();
  } else {
    alert("Enter a Name longer than 5 characters");
  }
};

const renderNewMessage = (messageObj) => {
  MessageContainer.innerHTML += `<p>${messageObj.displayName}: ${messageObj.message}</p>`
  MessageContainer.scrollTop = MessageContainer.scrollHeight
}

const sendMessage = (event) => {
  if (MessageInput.value.length > 1) {
    const messageObj = {
      displayName,
      message: MessageInput.value
    }
    socket.emit('USER_NEW_MESSAGE', messageObj)
    renderNewMessage(messageObj)
    MessageInput.value = ""
  }
  return false
};

const socket = io("", {
  autoConnect: false,
  transports: ["websocket"],
});

socket.on("connect", () => {
  console.log("Connected!");
});

socket.on("ALL_USERS", (allUsers) => {
  users = allUsers;
  UsersContainer.innerHTML = allUsersHTML(users);
});

socket.on("NEW_USER_CONNECTED", (newUser) => {
  users[newUser.socketId] = newUser;
  UsersContainer.innerHTML = allUsersHTML(users);
});

socket.on("USER_DISCONNECTED", (id) => {
  delete users[id];
  UsersContainer.innerHTML = allUsersHTML(users);
});

socket.on("USER_NEW_MESSAGE_FROM_SERVER", renderNewMessage);