#!/usr/bin/env python3
"""
Debug script to test server startup and transcription
"""
import asyncio
import sys
import traceback
from fastapi.testclient import TestClient

def test_server_import():
    """Test if the server can be imported without errors"""
    try:
        print("🔍 Testing server import...")
        from main import app
        print("✅ Server imported successfully")
        return app
    except Exception as e:
        print(f"❌ Server import failed: {e}")
        traceback.print_exc()
        return None

def test_server_endpoints(app):
    """Test server endpoints"""
    if not app:
        return False
    
    try:
        print("🔍 Testing server endpoints...")
        client = TestClient(app)
        
        # Test root endpoint
        response = client.get("/")
        print(f"✅ Root endpoint: {response.status_code} - {response.json()}")
        
        # Test health endpoint
        response = client.get("/health")
        print(f"✅ Health endpoint: {response.status_code} - {response.json()}")
        
        return True
    except Exception as e:
        print(f"❌ Endpoint test failed: {e}")
        traceback.print_exc()
        return False

def test_transcription_endpoint(app):
    """Test transcription endpoint"""
    if not app:
        return False
    
    try:
        print("🔍 Testing transcription endpoint...")
        client = TestClient(app)
        
        # Create a test file
        test_content = b"test audio content"
        files = {"file": ("test.webm", test_content, "audio/webm")}
        headers = {"X-API-Key": "fast_API_KEY"}
        
        response = client.post("/transcribe", files=files, headers=headers)
        print(f"✅ Transcription endpoint: {response.status_code}")
        if response.status_code != 200:
            print(f"   Response: {response.text}")
        
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Transcription test failed: {e}")
        traceback.print_exc()
        return False

def main():
    """Main debug function"""
    print("🚀 Server Debug Test")
    print("=" * 50)
    
    # Test import
    app = test_server_import()
    if not app:
        print("❌ Cannot proceed - server import failed")
        return
    
    # Test endpoints
    endpoints_ok = test_server_endpoints(app)
    if not endpoints_ok:
        print("❌ Cannot proceed - endpoint tests failed")
        return
    
    # Test transcription
    transcription_ok = test_transcription_endpoint(app)
    
    print("\n" + "=" * 50)
    if transcription_ok:
        print("🎉 All tests passed! Server is working correctly.")
    else:
        print("❌ Some tests failed. Check the errors above.")

if __name__ == "__main__":
    main()
