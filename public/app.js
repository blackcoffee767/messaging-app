let socket;

function connect() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    socket = new WebSocket(`${protocol}//${window.location.host}`);
    
    socket.onopen = function(e) {
        console.log("Connection established");
        document.getElementById('messageInput').disabled = false;
        document.getElementById('sendButton').disabled = false;
    };
    
    socket.onmessage = function(event) {
        console.log("Message received:", event.data);
        try {
            const data = JSON.parse(event.data);
            const messagesDiv = document.getElementById('messages');
            
            if (data.type === 'history') {
                data.data.forEach(msg => displayMessage(msg));
            } else if (data.type === 'message') {
                displayMessage(data.data);
            }
            
            messagesDiv.scrollTop = messagesDiv.scrollHeight;
        } catch (err) {
            console.error("Error processing message:", err);
        }
    };
    
    socket.onclose = function(event) {
        console.log("Connection closed");
        document.getElementById('messageInput').disabled = true;
        document.getElementById('sendButton').disabled = true;
        setTimeout(connect, 1000); // Reconnect after 1 second
    };
    
    socket.onerror = function(error) {
        console.error("WebSocket error:", error);
    };
}

function displayMessage(msg) {
    const messagesDiv = document.getElementById('messages');
    const messageElement = document.createElement('div');
    messageElement.className = 'message';
    messageElement.innerHTML = `
        <div class="content">${escapeHtml(msg.content)}</div>
        <div class="time">${new Date(msg.timestamp).toLocaleTimeString()}</div>
    `;
    messagesDiv.appendChild(messageElement);
}

function escapeHtml(text) {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Initial connection
connect();

// Message sending
document.getElementById('sendButton').addEventListener('click', sendMessage);
document.getElementById('messageInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

function sendMessage() {
    const input = document.getElementById('messageInput');
    const message = input.value.trim();
    
    if (message && socket.readyState === WebSocket.OPEN) {
        socket.send(message);
        input.value = '';
    }
}
