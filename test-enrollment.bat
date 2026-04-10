@echo off
REM Test enrollment endpoint
curl -X POST "http://localhost:3000/api/courses/1/enroll?userId=c69864ae-e980-465f-98ea-6cafbba95675" -H "Content-Type: application/json"
pause
