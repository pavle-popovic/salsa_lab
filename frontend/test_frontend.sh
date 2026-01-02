#!/bin/bash

echo "=========================================="
echo "FRONTEND TEST SUITE"
echo "=========================================="
echo ""

# Check if Next.js dev server is running
echo "Checking if Next.js server is running..."
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "[OK] Next.js server is running on http://localhost:3000"
else
    echo "[ERROR] Next.js server is not running!"
    echo "Please start it with: npm run dev"
    exit 1
fi

# Check if backend API is running
echo ""
echo "Checking if backend API is running..."
if curl -s http://localhost:8000/health > /dev/null 2>&1; then
    echo "[OK] Backend API is running on http://localhost:8000"
else
    echo "[WARNING] Backend API is not running!"
    echo "Please start it with: cd backend && uvicorn main:app --reload"
fi

echo ""
echo "=========================================="
echo "Manual Testing Required"
echo "=========================================="
echo ""
echo "Please test the following pages manually:"
echo "1. http://localhost:3000 - Home page"
echo "2. http://localhost:3000/register - Registration"
echo "3. http://localhost:3000/login - Login"
echo "4. http://localhost:3000/courses - Courses list"
echo "5. http://localhost:3000/profile - User profile"
echo "6. http://localhost:3000/pricing - Pricing page"
echo ""
echo "For admin pages, you need an admin account:"
echo "7. http://localhost:3000/admin - Admin dashboard"
echo "8. http://localhost:3000/admin/grading - Grading queue"
echo "9. http://localhost:3000/admin/builder - Course builder"
echo ""

