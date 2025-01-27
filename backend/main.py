import asyncio
from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware
from .api.routes import configure_routes
from datetime import datetime
from .services.realtime.realtime_service import prepare_realtime_data_for_database
from .services.static.gtfs_data_loader import load_gtfs_data  

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"], 
    allow_headers=["*"],  
)

@app.on_event("startup")
async def startup_event():
    load_gtfs_data()  
    await start_realtime_check()

async def check_for_new_realtime_data():
    while True:
        prepare_realtime_data_for_database()  
        await asyncio.sleep(30)

async def start_realtime_check():
    asyncio.create_task(check_for_new_realtime_data())

configure_routes(app)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
