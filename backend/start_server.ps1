# Start a new PowerShell process, bypassing the current profile and execution policy
# Activate the virtual environment and start the uvicorn server
Start-Process powershell -ArgumentList "-NoProfile -ExecutionPolicy Bypass -Command `". .\venv\Scripts\activate.ps1; uvicorn main:app --reload`""