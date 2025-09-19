@echo off
REM Batch file to automate git push to GitHub repository

REM Check if .git directory exists, if not, initialize and add remote
if not exist .git (
    echo Initializing git repository...
    git init
    git remote add origin https://github.com/Dhruv9068/Namaste-Ayurveda.git
    echo Remote origin added.
)

REM Prompt for commit message
set /p commitmsg=Enter commit message:

REM Add all changes
git add .

REM Commit with the provided message
git commit -m "%commitmsg%"

REM Push to the main branch
git push origin main

REM Pause to see the output
pause
