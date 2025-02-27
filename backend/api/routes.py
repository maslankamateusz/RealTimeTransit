from fastapi import APIRouter, Depends, Query, FastAPI, HTTPException
from fastapi.encoders import jsonable_encoder
from services.static.gtfs_data_loader import load_gtfs_data
from services.static.gtfs_processing import get_routes_list_with_labels, get_stops_list_for_route, get_schedule_data, get_schedule_from_block_id, get_timetable_data, create_csv_with_schedule_numbers, get_schedule_number_from_block_id, get_routes_list_from_block_id, get_stops_list, get_stops_list_with_location, get_shape_list_for_trip_id, get_stops_list_for_trip_with_delay, get_stop_details, get_vehicle_details, get_service_data, get_vehicle_history, get_route_history
import pandas as pd
from services.realtime.realtime_service import get_vehicle_realtime_raw_data, get_vehicle_with_route_name, get_realtime_stop_details, save_vehicle_to_daily_log
from sqlalchemy.orm import Session
from database.crud import import_vehicles_from_json  
from database.session import SessionLocal  
from fastapi import Request
from services.static.gtfs_data_loader import gtfs_data_instance

router = APIRouter()

class GTFSData:
    def __init__(self):
        self.data = load_gtfs_data()

    def get_data(self):
        return self.data

def get_gtfs_data(request: Request = None):
    gtfs_data = gtfs_data_instance.get_data()
    return gtfs_data

def convert_schedule_for_json(schedule_data):
    if isinstance(schedule_data, pd.DataFrame):
        return schedule_data.astype(object).where(pd.notnull(schedule_data), None).to_dict(orient='records')
    elif isinstance(schedule_data, pd.Series):
        return schedule_data.tolist()
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
async def get_routes():
    data = get_gtfs_data()
    routes = get_routes_list_with_labels(data)
    return jsonable_encoder(routes)

@router.get("/api/stops/list")
async def get_stops_list_edp(
):  
    data = get_gtfs_data()
    stop_list = get_stops_list(data)
    return stop_list

@router.get("/api/stops/list/location")
async def get_stops_list_location(
):  
    data = get_gtfs_data()
    stop_list = get_stops_list_with_location(data)
    return convert_schedule_for_json(stop_list)

@router.get("/api/stops")
async def get_stops(
    route_number: str = Query(...)
):
    data = get_gtfs_data()
    stops = get_stops_list_for_route(data, route_number)
    return jsonable_encoder(stops)

@router.get("/api/routes/schedule/plan")
async def get_schedule_plan(
    route_name: str = Query(...)
):
    data = get_gtfs_data()
    schedule = get_schedule_data(data, route_name)
    json_serializable_schedule = convert_schedule_for_json(schedule)
    return json_serializable_schedule

@router.get("/api/routes/schedule")
async def get_schedule(
    schedule_number: str = Query(...),
    service_id: str = Query(...),
):
    data = get_gtfs_data()
    schedule = get_schedule_from_block_id(data, schedule_number, service_id)
    json_serializable_schedule = convert_schedule_for_json(schedule)
    return json_serializable_schedule

@router.get("/api/routes/schedule/number")
async def get_schedule_number(
    block_id: str = Query(...),
    service_id: str = Query(...),
    vehicle_type: str = Query(None),
):
    data = get_gtfs_data()
    if vehicle_type is None:
        vehicle_type = "bus"  
    schedule_number = get_schedule_number_from_block_id(data, block_id, service_id, vehicle_type)    
    return schedule_number

@router.get("/api/routes/timetable")
async def get_timetable(
    route_number: str = Query(...),
    direction: int = Query(...),
    stop_id: str = Query(...),
    service_id: str = Query(),
):
    data = get_gtfs_data()
    
    schedule = get_timetable_data(data, route_number, direction, stop_id, service_id)
    json_serializable_schedule = convert_schedule_for_json(schedule)
    return json_serializable_schedule 

@router.get("/api/realtime/")
async def realtime_data():
    try:
        vehicle_list_a, vehicle_list_t = get_vehicle_realtime_raw_data()
        vehicle_list = vehicle_list_a + vehicle_list_t
        if vehicle_list:
            return jsonable_encoder(vehicle_list)
        else:
            raise HTTPException(status_code=500, detail="Could not fetch or parse real-time data")
    except Exception as e:
        print(f"Error fetching vehicle positions: {e}")
        raise HTTPException(status_code=500, detail="Could not fetch or parse real-time data")

@router.get("/api/realtime/vehicles/")
async def get_vehicle_with_route():
    try:
        data = get_gtfs_data()
        vehicle_list = get_vehicle_with_route_name(data)
        if vehicle_list:
            return jsonable_encoder(vehicle_list)
        else:
            raise HTTPException(status_code=500, detail="Could not fetch or parse real-time data")
    except Exception as e:
        print(f"Error fetching vehicle positions: {e}")
        raise HTTPException(status_code=500, detail="Could not fetch or parse real-time data")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/api/import-vehicles/")
async def import_vehicles(db: Session = Depends(get_db)):
    try:
        imported_count = import_vehicles_from_json(db, 'vehicles.json')
        return {"message": f"Pojazdy zostały zaimportowane! Zaimportowano {imported_count} pojazdów."}
    except Exception as e:
        print(f"Error importing vehicles: {e}")
        raise HTTPException(status_code=500, detail="Błąd podczas importu pojazdów.")

@router.get("/api/create_csv_files/")
async def get_vehicle_with_route():
    data = get_gtfs_data()
    response = create_csv_with_schedule_numbers(data)
    return response

@router.get("/api/schedule/routes")
async def get_routes_list(
    block_id: str = Query(...),
    vehicle_type: str = Query(None),
):
    data = get_gtfs_data()
    if vehicle_type is None:
        vehicle_type = "bus" 
    
    routes_list = get_routes_list_from_block_id(data, vehicle_type, block_id, )
    return routes_list

@router.get("/api/trip/shape")
async def get_shape_list(
    trip_id: str = Query(...),
    vehicle_type: str = Query(...)
):
    data = get_gtfs_data()
    shape_list = get_shape_list_for_trip_id(data, trip_id, vehicle_type)
    return convert_schedule_for_json(shape_list)

@router.get("/api/trip/stops/delay")
async def get_stops_list_with_delay(
    trip_id: str = Query(...),
    vehicle_type: str = Query(...),
):
    data = get_gtfs_data()
    stop_list_with_delay = get_stops_list_for_trip_with_delay(data, vehicle_type, trip_id)

    return stop_list_with_delay

@router.get("/api/stop/details")
async def get_stop_details_edp(
    stop_name: str = Query(...),
):  
    data = get_gtfs_data()
    stop_details = get_stop_details(data, stop_name)

    return stop_details

@router.get("/api/stop/delay")
async def get_stop_delay_edp(
    schedule_number: str = Query(...),
):  
    data = get_gtfs_data()
    stop_details = get_realtime_stop_details(data, schedule_number)

    return stop_details

@router.get("/api/vehicle/")
async def get_vehicle_details_edp(
    vehicle_id: str = Query(...),
):  
    data = get_gtfs_data()
    vehicle_details = get_vehicle_details(data, vehicle_id)

    return vehicle_details


@router.get("/api/service")
async def get_service_data_edp(
    route_number: str = Query(...),
):
    data = get_gtfs_data()
    service_data = get_service_data(data, route_number )
    return service_data

@router.get("/api/history/vehicle")
async def get_vehicle_history_edp(
    vehicle_id: str = Query(...),
    start_date: str = Query(...),
    end_date: str = Query(...),
):
    vehicle_history = get_vehicle_history(vehicle_id, start_date, end_date )
    return vehicle_history

@router.get("/api/history/route")
async def get_vehicle_history_edp(
    route_name: str = Query(...),
    start_date: str = Query(...),
    end_date: str = Query(...),
):
    route_history = get_route_history(route_name, start_date, end_date )
    return route_history

@router.put("/api/save-vehicle")
async def save_vehicle_to_db_edp(
    vehicle_id: str = Query(...),
    schedule_number: str = Query(...),
    routes_list: str = Query(...),
):
    save_vehicle_to_daily_log(vehicle_id, schedule_number, routes_list)
    return "Data saved"

def configure_routes(app):
    app.include_router(router)

