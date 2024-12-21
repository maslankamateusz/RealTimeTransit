from fastapi import APIRouter, Depends, Query
from fastapi.encoders import jsonable_encoder
from ..services.gtfs_data_loader import load_gtfs_data
from ..services.gtfs_processing import get_routes_list, get_stops_list, get_schedule_data, get_schedule_number_from_trip_id
import pandas as pd

router = APIRouter()

class GTFSData:
    def __init__(self):
        self.data = load_gtfs_data()

    def get_data(self):
        return self.data

def get_gtfs_data() -> GTFSData:
    return GTFSData()

def convert_schedule_for_json(schedule_data):
    if isinstance(schedule_data, pd.DataFrame):
        return schedule_data.astype(object).where(pd.notnull(schedule_data), None).to_dict(orient='records')
    elif isinstance(schedule_data, list):
        return [convert_schedule_for_json(data) for data in schedule_data]
    elif isinstance(schedule_data, dict):
        return {key: convert_schedule_for_json(value) for key, value in schedule_data.items()}
    elif isinstance(schedule_data, (int, float, str, bool)) or schedule_data is None:
        return schedule_data
    else:
        try:
            return jsonable_encoder(schedule_data)
        except Exception:
            return str(schedule_data) 

@router.get("/api/routes")
async def get_routes(gtfs: GTFSData = Depends(get_gtfs_data)):
    data = gtfs.get_data()
    routes = get_routes_list(data)
    return jsonable_encoder(routes.to_dict(orient="records"))

@router.get("/api/stops")
async def get_stops(
    gtfs: GTFSData = Depends(get_gtfs_data),
    route_number: str = Query(...),
    direction: int = Query(...)
):
    data = gtfs.get_data()
    stops = get_stops_list(data, route_number, direction)
    return jsonable_encoder(stops)

@router.get("/api/schedule")
async def get_schedule(
    gtfs: GTFSData = Depends(get_gtfs_data),
    route_id: str = Query(...),
    vehicle_type: str = Query(...)
):
    data = gtfs.get_data()
    schedule = get_schedule_data(data, route_id, vehicle_type)
    json_serializable_schedule = convert_schedule_for_json(schedule)
    return json_serializable_schedule

@router.get("/api/routes/schedule/number")
async def get_schedule_number(
    gtfs: GTFSData = Depends(get_gtfs_data),
    trip_id: str = Query(...),
    vehicle_type: str = Query(None)
):
    data = gtfs.get_data()
    if vehicle_type is None:
        vehicle_type = "bus"  
    schedule_number = get_schedule_number_from_trip_id(data, trip_id, vehicle_type)
    json_serializable_schedule = convert_schedule_for_json(schedule_number)
    return json_serializable_schedule


def configure_routes(app):
    app.include_router(router)
