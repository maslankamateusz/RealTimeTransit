from services.realtime.realtime_fetcher import download_gtfs_realtime_file
from services.realtime.realtime_parser import parse_vehicle_positions
from typing import List, Dict
from database.session import SessionLocal
from database.crud import update_vehicles_status, log_new_vehicle_to_daily_logs
from fastapi import Depends
from fastapi import Request
from services.static.gtfs_data_loader import gtfs_data_instance
from services.static.gtfs_processing import get_routes_list_from_block_id, get_schedule_number_from_block_id, get_stop_details, get_schedule_number_from_trip_id, get_stop_delay
from datetime import datetime

def get_gtfs_data(request: Request = None):
    gtfs_data = gtfs_data_instance.get_data()
    return gtfs_data

def get_vehicle_realtime_raw_data() -> List[Dict]:
    try:
        download_gtfs_realtime_file()
        
        vehicle_positions_a = parse_vehicle_positions('services/realtime/realtime_data/vehicle_positions_a.pb')
        vehicle_positions_t = parse_vehicle_positions('services/realtime/realtime_data/vehicle_positions_t.pb')
        
        return vehicle_positions_a, vehicle_positions_t
    except Exception as e:
        print(f"Error in get_vehicle_with_route_name: {e}")
        raise


def get_vehicle_with_route_name(gtfs_data):
    vehicles_a, vehicles_t = get_vehicle_realtime_raw_data()

    if 'trip_id' not in gtfs_data['trips_a'].index.names:
        gtfs_data['trips_a'].set_index('trip_id', inplace=True)
    if 'route_id' not in gtfs_data['routes_a'].index.names:
        gtfs_data['routes_a'].set_index('route_id', inplace=True)
    if 'trip_id' not in gtfs_data['trips_t'].index.names:
        gtfs_data['trips_t'].set_index('trip_id', inplace=True)
    if 'route_id' not in gtfs_data['routes_t'].index.names:
        gtfs_data['routes_t'].set_index('route_id', inplace=True)

    vehicle_list = []
    for vehicle in vehicles_a:
        trip_id_a = vehicle['trip']['trip_id']

        if trip_id_a in gtfs_data['trips_a'].index:
            route_id_a = gtfs_data['trips_a'].loc[trip_id_a]['route_id']
            route_short_name_a = gtfs_data['routes_a'].loc[route_id_a]['route_short_name']
            trip_headsign_a = gtfs_data['trips_a'].loc[str(trip_id_a)]['trip_headsign']
            shape_id_a = gtfs_data['trips_a'].loc[str(trip_id_a)]['shape_id']
            block_id_a = gtfs_data['trips_a'].loc[str(trip_id_a)]['block_id']
            service_id_a = gtfs_data['trips_a'].loc[str(trip_id_a)]['service_id']
            schedule_number = get_schedule_number_from_block_id(gtfs_data, block_id_a, service_id_a, "bus")

            
            vehicle_a = {
                'vehicle_id': vehicle['vehicle']['license_plate'],
                'schedule_number': schedule_number,
                'route_short_name': route_short_name_a,
                'block_id' : block_id_a,
                'latitude': vehicle['position']['latitude'],
                'longitude': vehicle['position']['longitude'],
                'timestamp': vehicle['timestamp'],
                'stop_id': vehicle['stop_id'],
                'trip_id': trip_id_a,
                'route_id': route_id_a,
                'trip_headsign': trip_headsign_a,
                'shape_id': shape_id_a,
                'bearing': vehicle['position']['bearing'],
                'type': 'bus'
            }
            vehicle_list.append(vehicle_a)

    for vehicle in vehicles_t:
        trip_id_t = vehicle['trip']['trip_id']

        if trip_id_t in gtfs_data['trips_t'].index:
            route_id_t = gtfs_data['trips_t'].loc[trip_id_t]['route_id']
            route_short_name_t = gtfs_data['routes_t'].loc[route_id_t]['route_short_name']
            trip_headsign_t = gtfs_data['trips_t'].loc[str(trip_id_t)]['trip_headsign']
            shape_id_t = gtfs_data['trips_t'].loc[str(trip_id_t)]['shape_id']
            block_id_t = gtfs_data['trips_t'].loc[str(trip_id_t)]['block_id']
            service_id_t = gtfs_data['trips_t'].loc[str(trip_id_t)]['service_id']
            schedule_number = get_schedule_number_from_block_id(gtfs_data, block_id_t, service_id_t, "tram")
            vehicle_t = {
                'vehicle_id': vehicle['vehicle']['license_plate'],
                'schedule_number': schedule_number,
                'route_short_name': route_short_name_t,
                'block_id' : block_id_t,
                'latitude': vehicle['position']['latitude'],
                'longitude': vehicle['position']['longitude'],
                'timestamp': vehicle['timestamp'],
                'stop_id': vehicle['stop_id'],
                'trip_id': trip_id_t,
                'route_id': route_id_t,
                'trip_headsign': trip_headsign_t,
                'shape_id': shape_id_t,
                'bearing': vehicle['position']['bearing'],
                'type': 'tram'
            }
            vehicle_list.append(vehicle_t)
    
    return vehicle_list
 

def get_routes_list(gtfs_data, trip_id, vehicle_type):
    parts = trip_id.split("_")
    block_id = f"block_{parts[1]}".strip()
    routes_list = get_routes_list_from_block_id(gtfs_data, vehicle_type, block_id)
    return routes_list

def prepare_realtime_data_for_database():
    
    print("New realtime data processing started.")
    gtfs_data = get_gtfs_data()
    vehicles_list = get_vehicle_with_route_name(gtfs_data)
    formated_vehicles_list = []
    
    for vehicle in vehicles_list:
        if vehicle['vehicle_id'][0]:
            rotues_list = get_routes_list(gtfs_data, vehicle['trip_id'], vehicle['type'])
            schedule_number = get_schedule_number_from_trip_id(gtfs_data, vehicle['trip_id'], vehicle['type'])
            if schedule_number:
                formated_vehicle = {
                    'vehicle_id': vehicle['vehicle_id'],
                    'schedule_number': schedule_number,
                    'latitude': vehicle['latitude'],
                    'longitude': vehicle['longitude'], 
                    'timestamp': vehicle['timestamp'],
                    'routes_list': rotues_list 
                }
                formated_vehicles_list.append(formated_vehicle)
    
    with SessionLocal() as session:
        update_vehicles_status(session, formated_vehicles_list)


def get_realtime_stop_details(gtfs_data, schedule_number_list):
    vehicles_list = get_vehicle_with_route_name(gtfs_data)
    founded_vehicles = []
    
    for vehicle in vehicles_list:
        if vehicle["schedule_number"] in schedule_number_list:
            vehicle_id = vehicle["vehicle_id"]
            trip_id = vehicle["trip_id"]
            stop_id = vehicle["stop_id"]
            vehicle_type = vehicle["type"]
            timestamp = vehicle["timestamp"]
            delay = get_stop_delay(gtfs_data, vehicle_type, trip_id, stop_id, timestamp)
            
            founded_vehicles.append({
                'vehicle_id': vehicle_id,
                'delay': delay,
                'schedule_number': vehicle["schedule_number"]
            })

    return founded_vehicles

def get_vehicle_realtime_status(gtfs_data, vehicle_id):
    vehicles_list = get_vehicle_with_route_name(gtfs_data)
    for vehicle in vehicles_list:
        if vehicle['vehicle_id'] == vehicle_id:
            vehicle_id = vehicle["vehicle_id"]
            trip_id = vehicle["trip_id"]
            block_id = vehicle["block_id"]
            stop_id = vehicle["stop_id"]
            vehicle_type = vehicle["type"]
            timestamp = vehicle["timestamp"]
            latitude = vehicle["latitude"]
            longitude = vehicle["longitude"]
            schedule_number = vehicle["schedule_number"]
            delay = get_stop_delay(gtfs_data, vehicle_type, trip_id, stop_id, timestamp)
            return trip_id, stop_id, vehicle_type, timestamp, delay, latitude, longitude, schedule_number, block_id
    return None

def save_vehicle_to_daily_log(vehicle_id, schedule_number, routes):
    timestamp = int(datetime.now().timestamp())
    routes_array = routes.split() 

    vehicle = {
        "vehicle_id": vehicle_id,
        "schedule_number": schedule_number,
        "timestamp": timestamp,
        "routes_list": routes_array,
    }
    with SessionLocal() as session:
        log_new_vehicle_to_daily_logs(session, vehicle)