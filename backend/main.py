from fastapi import FastAPI
from .api.routes import configure_routes
from .services.gtfs_data_loader import load_gtfs_data

app = FastAPI()

configure_routes(app)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
