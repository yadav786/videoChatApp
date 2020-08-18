const socket = io('/');

const myPeer = new Peer(undefined, {
    host: '/',
    port: '3001'
});

const videoGrid = document.getElementById('videogrid');

const peers = {};

const myVideo = document.createElement('video');
myVideo.muted = true;

navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    addVideoStream(myVideo, stream);

    const video = document.createElement('video');
    myPeer.on('call', call => {
      call.answer(stream);
      call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream);
      });
    });

    socket.on('user-connected', userId => {
        connectToNewUser(userId, stream);
    });
});

myPeer.on('open', id => {
    socket.emit('join-room', ROOM_ID, id);  
});

socket.on('user-disconnected', userId => {
    if(peers[userId]){
        peers[userId].close();
    }
});


const addVideoStream = (video, stream) => {
      video.srcObject = stream;
      video.addEventListener('loadedmetadata', () => {
        video.play();
      });
      videoGrid.append(video);
}

const connectToNewUser = (userId, stream) => {
    const call = myPeer.call(userId, stream);
    const video = document.createElement('video');
    call.on('stream', userVideoStream => {
       addVideoStream(video, userVideoStream); 
    });
    call.on('close', () => {
        video.remove();
    });
    peers[userId] = call;
}
