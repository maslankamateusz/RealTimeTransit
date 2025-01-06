import asyncio
from fastapi import FastAPI
from .api.routes import configure_routes
from datetime import datetime
from .services.realtime.realtime_service import prepare_realtime_data_for_database

app = FastAPI()

configure_routes(app)

async def check_for_new_realtime_data():
    while True:
        prepare_realtime_data_for_database()
        
        await asyncio.sleep(30)  

async def start_realtime_check():
    asyncio.create_task(check_for_new_realtime_data())

@app.on_event("startup")
async def startup_event():
    await start_realtime_check()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
