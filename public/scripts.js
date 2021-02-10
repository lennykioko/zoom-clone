const socket = io('/');

videoGrid = document.querySelector('#video-grid');
msgInput = document.querySelector('#chat-message');
messages = document.querySelector('.messages');

const myPeer = new Peer(undefined, {
    path: '/peerjs',
    host: '/',
    port: '443'
});

myVideo = document.createElement('video');
myVideo.muted = true;

let myVideoStream;
navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    myVideoStream = stream;
    addVideoStream(myVideo, stream);

    myPeer.on('call', call => {
        call.answer(stream);
        const video = document.createElement('video');
        call.on('stream', userVideoStream => {
            addVideoStream(video, userVideoStream);
        });
    });

    socket.on('user-connected', (userId) => {
        connectToNewUser(userId, stream);
    });

    msgInput.addEventListener('keyup', (e) => {
        if (e.key === "Enter") {
            let msg = e.target.value;
            console.log(msg);
            if (msg.length > 0) {
                socket.emit('message', msg);
                e.target.value = "";
            }
        }
    });

    socket.on('createMessage', message => {
        messages.insertAdjacentHTML('beforeend', `<li class="message"><b>user</b><br/>${message}</li>`);
        scrollToBottom();
    });
})

myPeer.on('open', id =>  {
    // console.log(id);
    socket.emit('join-room', ROOM_ID, id);
});

const connectToNewUser = (userId, stream) => {
    // console.log(`new user ${userId}`);
    const call = myPeer.call(userId, stream);
    const video = document.createElement('video');
    call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream);
    });
};

const addVideoStream = (video, stream) => {
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', () => {
        video.play();
    });
    videoGrid.append(video);
}

const scrollToBottom = () => {
    mainChatWindow = document.querySelector('.main__chat_window');
    mainChatWindow.scrollTop = mainChatWindow.scrollHeight;
};

const toggleMute = () => {
    const enabled = myVideoStream.getAudioTracks()[0].enabled;

    if (enabled) {
        myVideoStream.getAudioTracks()[0].enabled = false;
        setUnmuteButton();
    } else {
        setMuteButton();
        myVideoStream.getAudioTracks()[0].enabled = true;
    }
};

const toggleVideo = () => {
    const enabled = myVideoStream.getVideoTracks()[0].enabled;

    if (enabled) {
        myVideoStream.getVideoTracks()[0].enabled = false;
        setPlayButton();
    } else {
        setStopButton();
        myVideoStream.getVideoTracks()[0].enabled = true;
    }
};

const setUnmuteButton = () => {
    const html = `<i class="unmute fas fa-microphone-slash"></i><span>Mute</span>`;
    document.querySelector('.main__mute_button').innerHTML = html;
};
const setMuteButton = () => {
    const html = `<i class="fas fa-microphone"></i><span>Mute</span>`;
    document.querySelector('.main__mute_button').innerHTML = html;
};

const setPlayButton = () => {
    const html = `<i class="stop fas fa-video-slash"></i><span>Play Video</span>`;
    document.querySelector('.main__video_button').innerHTML = html;
};
const setStopButton = () => {
    const html = `<i class="fas fa-video"></i><span>Stop Video</span>`;
    document.querySelector('.main__video_button').innerHTML = html;
};