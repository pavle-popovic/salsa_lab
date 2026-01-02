import os
import importlib
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from output.backend.database import engine, Base, SessionLocal
from output.backend.config import settings

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.API_VERSION,
    description=settings.PROJECT_DESCRIPTION,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
)

# Set up CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    """
    Event handler that runs when the application starts up.
    Initializes the database tables.
    """
    Base.metadata.create_all(bind=engine)
    print("Database tables created or already exist.")

# Dynamically include routers
# The router files are in 'output/backend/routers/'
# The `List Directory` tool returned:
# output/backend/routers/admin.py
# output/backend/routers/auth.py
# output/backend/routers/courses.py
# output/backend/routers/payments.py
# output/backend/routers/progress.py
# output/backend/routers/submissions.py
# output/backend/routers/users.py

router_filenames = [
    "admin.py",
    "auth.py",
    "courses.py",
    "payments.py",
    "progress.py",
    "submissions.py",
    "users.py",
]

for filename in router_filenames:
    if filename.endswith(".py") and filename != "__init__.py":
        module_name = f"output.backend.routers.{filename[:-3]}" # e.g., output.backend.routers.admin
        try:
            router_module = importlib.import_module(module_name)
            if hasattr(router_module, "router"):
                app.include_router(router_module.router, prefix=settings.API_V1_STR)
                print(f"Included router: {module_name}")
            else:
                print(f"Module {module_name} does not have a 'router' attribute.")
        except ImportError as e:
            print(f"Error importing router module {module_name}: {e}")
        except Exception as e:
            print(f"An unexpected error occurred while loading router {module_name}: {e}")


@app.get("/", tags=["Health Check"])
async def root():
    """
    Root endpoint for health check.
    """
    return {"message": "Welcome to the FastAPI backend!"}