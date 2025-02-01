import asyncio
from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware
from api.routes import configure_routes
from services.realtime.realtime_service import prepare_realtime_data_for_database
from services.static.gtfs_data_loader import load_gtfs_data

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    try:
        load_gtfs_data()  
    except Exception as e:
        print(f"Błąd ładowania GTFS: {e}")

    asyncio.create_task(start_realtime_check()) 
async def check_for_new_realtime_data():
    while True:
        try:
            prepare_realtime_data_for_database()  
        except Exception as e:
            print(f"Błąd w prepare_realtime_data_for_database: {e}")
        await asyncio.sleep(60)

async def start_realtime_check():
    asyncio.create_task(check_for_new_realtime_data())

configure_routes(app)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, workers=4) 
