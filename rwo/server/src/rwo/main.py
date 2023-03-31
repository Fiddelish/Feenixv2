from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.utils import get_openapi
import os
import uvicorn

from .api.routers import (
    product,
    order,
)

RWO_API_SERVER = os.getenv(
    "RWO_API_SERVER",
    "http://localhost:5000"
)
EXTRA_CORS_ORIGINS = os.getenv(
    "EXTRA_CORS_ORIGINS",
    ""
).split(",")
CORS_ALLOWED_ORIGINS = [RWO_API_SERVER] + EXTRA_CORS_ORIGINS

def build_app():
    app = FastAPI(
        description="RWO Product API",
        version="2023.3",
        title="RWO API",
    )
    app.add_middleware(
        CORSMiddleware,
        allow_origins=CORS_ALLOWED_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.include_router(product.router)
    app.include_router(order.router)
    openapi_schema = get_openapi(
       title="RWO Product API",
       version="2023.3",
       routes=app.routes,
    )
    openapi_schema["info"] = {
        "title" : "RWO API",
        "version" : "2022.10",
        "description" : "RWO Product API"
    }
    app.openapi_schema = openapi_schema
    app.openapi = lambda: openapi_schema
    return app

def run():
    uvicorn.run(build_app(), host="0.0.0.0", port=5000)
