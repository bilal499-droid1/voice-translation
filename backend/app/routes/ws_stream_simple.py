"""
Enhanced WebSocket endpoint that returns JSON messages (no plain string echo).
"""
import json
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from fastapi.responses import HTMLResponse
from app.config import settings

router = APIRouter()

@router.websocket("/ws/{session_id}")
async def websocket_endpoint(websocket: WebSocket, session_id: str):
    await websocket.accept()
    authed = False
    try:
        while True:
            raw = await websocket.receive_text()
            try:
                msg = json.loads(raw)
            except Exception:
                # wrap plain text into JSON structure
                await websocket.send_text(json.dumps({"type": "echo", "text": raw}))
                continue

            if msg.get("type") == "auth":
                if msg.get("api_key") == settings.API_KEY:
                    authed = True
                    await websocket.send_text(json.dumps({"type": "auth_ok", "session_id": session_id}))
                else:
                    await websocket.send_text(json.dumps({"type": "error", "message": "Invalid API key"}))
                continue

            if not authed:
                await websocket.send_text(json.dumps({"type": "error", "message": "Not authenticated"}))
                continue

            if msg.get("type") == "text":
                user_text = (msg.get("content") or "").strip()
                if not user_text:
                    await websocket.send_text(json.dumps({"type": "error", "message": "Empty message"}))
                    continue
                await websocket.send_text(json.dumps({"type": "response", "text": f"You said: {user_text}", "emotion": "neutral"}))
                continue

            await websocket.send_text(json.dumps({"type": "error", "message": "Unsupported message"}))
    except WebSocketDisconnect:
        pass

@router.get("/ws-test")
async def websocket_test_page():
    html_content = """
    <!DOCTYPE html>
    <html>
    <head>
        <title>WebSocket Test</title>
    </head>
    <body>
        <h1>WebSocket Test</h1>
        <div id="messages"></div>
        <input type="text" id="messageInput" placeholder="Type a message">
        <button onclick="sendMessage()">Send</button>
        
        <script>
            const ws = new WebSocket('ws://localhost:8000/api/v1/ws/test_session');
            ws.onopen = function(){ ws.send(JSON.stringify({type:'auth', api_key:'fast_API_KEY'})); };
            ws.onmessage = function(event) {
                const messages = document.getElementById('messages');
                const div = document.createElement('div');
                div.textContent = event.data;
                messages.appendChild(div);
            };
            function sendMessage() {
                const input = document.getElementById('messageInput');
                ws.send(JSON.stringify({type:'text', content: input.value}));
                input.value = '';
            }
        </script>
    </body>
    </html>
    """
    return HTMLResponse(content=html_content)
