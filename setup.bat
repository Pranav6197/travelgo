@echo off
REM Setup script for Windows - Initialize environment files

echo Initializing TravelGo project...

REM Check if backend .env exists
if not exist "backend\.env" (
    echo Creating backend\.env from template...
    copy backend\.env.example backend\.env
    echo Created backend\.env - Please fill in your credentials
) else (
    echo backend\.env already exists
)

REM Check if frontend .env.local exists
if not exist "frontend\.env.local" (
    echo Creating frontend\.env.local from template...
    copy frontend\.env.example frontend\.env.local
    echo Created frontend\.env.local - Please fill in your API path
) else (
    echo frontend\.env.local already exists
)

echo.
echo Setup complete! 
echo.
echo Next steps:
echo 1. Fill in your environment variables in:
echo    - backend\.env
echo    - frontend\.env.local
echo.
echo 2. Run: npm run installer
echo 3. Run: npm start
echo.
echo For detailed setup instructions, see CONTRIBUTING.md
