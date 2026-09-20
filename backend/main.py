import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import health, cities, air_quality, stations, trends, chat

# Configure clean logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)

app = FastAPI(
    title="CleanAir AI API",
    description="Real-Time Air Quality Intelligence Backend powered by OpenAQ and Groq",
    version="1.0.0"
)

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers under /api prefix
app.include_router(health.router, prefix="/api")
app.include_router(cities.router, prefix="/api")
app.include_router(air_quality.router, prefix="/api")
app.include_router(stations.router, prefix="/api")
app.include_router(trends.router, prefix="/api")
app.include_router(chat.router, prefix="/api")

@app.get("/")
async def root():
    return {
        "app": "CleanAir AI",
        "tagline": "Real-Time Air Quality Intelligence",
        "docs": "/docs",
        "status": "online"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
