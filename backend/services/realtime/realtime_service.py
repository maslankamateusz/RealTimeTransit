from .realtime_fetcher import download_gtfs_realtime_file
from .realtime_parser import parse_vehicle_positions
from fastapi import HTTPException
from typing import List, Dict

def get_vehicle_with_route_name() -> List[Dict]:
    try:
        download_gtfs_realtime_file()
        
        vehicle_positions_a = parse_vehicle_positions('vehicle_positions_a.pb')
        vehicle_positions_t = parse_vehicle_positions('vehicle_positions_t.pb')
        
        vehicle_positions = vehicle_positions_a + vehicle_positions_t
        
        vehicles_with_route_name = add_route_names_to_vehicles(vehicle_positions)
        
        return vehicles_with_route_name
    except Exception as e:
        print(f"Error in get_vehicle_with_route_name: {e}")
        raise

def add_route_names_to_vehicles(vehicle_positions):
    for vehicle in vehicle_positions:
        vehicle['route_name'] = 'Dummy Route Name'
    return vehicle_positions
