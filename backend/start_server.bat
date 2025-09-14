@echo off
echo Starting Voice AI Backend Server...
echo.

REM Activate virtual environment
call .venv\Scripts\activate.bat

REM Start the server
python -m uvicorn main:app --reload --port 8000

pause
