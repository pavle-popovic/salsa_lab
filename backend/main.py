from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from output.backend.config import settings

# Import routers (assuming they will be created in their respective files)
# from output.backend.routers import auth, users, courses, progress, submissions, admin, payments

app = FastAPI(
    title="HedgeFront API",
    description="API for the HedgeFront LMS platform",
    version="0.1.0",
)

# Setup CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include all routers with appropriate prefixes
# app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
# app.include_router(users.router, prefix="/users", tags=["Users"])
# app.include_router(courses.router, prefix="/courses", tags=["Courses"])
# app.include_router(progress.router, prefix="/progress", tags=["Progress"])
# app.include_router(submissions.router, prefix="/submissions", tags=["Submissions"])
# app.include_router(admin.router, prefix="/admin", tags=["Admin"])
# app.include_router(payments.router, prefix="/payments", tags=["Payments"])

# Define global exception handler for generic errors
@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "message": "An unexpected error occurred.",
            "detail": str(exc)
        },
    )

# Root endpoint
@app.get("/", tags=["Root"])
async def read_root():
    return {"message": "Welcome to HedgeFront API"}