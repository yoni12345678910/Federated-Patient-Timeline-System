from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware

from routes.timeline_route import router

app = FastAPI(title="Medical Timeline API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:5173",
    ],
    allow_methods=["GET"],
    allow_headers=["X-User-Role"],
)

app.include_router(router)
