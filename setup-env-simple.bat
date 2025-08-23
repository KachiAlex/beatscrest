@echo off
echo Setting up BeatCrest environment variables...

echo.
echo 1. Setting up backend environment...
cd backend
if not exist .env (
    copy env.example .env
    echo Backend .env file created!
) else (
    echo Backend .env file already exists.
)

echo.
echo 2. Setting up frontend environment...
cd ..\frontend
if not exist .env (
    echo VITE_API_URL=http://localhost:5000/api > .env
    echo VITE_WS_URL=ws://localhost:5000 >> .env
    echo VITE_STRIPE_PUBLISHABLE_KEY=pk_test_placeholder >> .env
    echo VITE_APP_NAME=BeatCrest >> .env
    echo VITE_APP_VERSION=1.0.0 >> .env
    echo Frontend .env file created!
) else (
    echo Frontend .env file already exists.
)

echo.
echo Environment setup complete!
echo.
echo Next steps:
echo 1. Edit backend\.env with your database details
echo 2. Edit frontend\.env if needed
echo 3. Set up Netlify environment variables in dashboard
echo.
pause 