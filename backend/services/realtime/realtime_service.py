from .realtime_fetcher import download_gtfs_realtime_file
from .realtime_parser import parse_vehicle_positions
from typing import List, Dict
from ..static.gtfs_data_loader import load_gtfs_data
from ...database.crud import update_vehicles_status
from ...database.session import SessionLocal
from ..static.gtfs_processing import get_schedule_number_from_trip_id

def get_vehicle_realtime_raw_data() -> List[Dict]:
    try:
        download_gtfs_realtime_file()
        
        vehicle_positions_a = parse_vehicle_positions('vehicle_positions_a.pb')
        vehicle_positions_t = parse_vehicle_positions('vehicle_positions_t.pb')
        
        return vehicle_positions_a, vehicle_positions_t
    except Exception as e:
        print(f"Error in get_vehicle_with_route_name: {e}")
        raise


def get_vehicle_with_route_name(gtfs_data):
    vehicles_a, vehicles_t = get_vehicle_realtime_raw_data()

    if 'route_id' not in gtfs_data['routes_a'].index.names:
        gtfs_data['routes_a'].set_index('route_id', inplace=True)

    if 'route_id' not in gtfs_data['routes_t'].index.names:
        gtfs_data['routes_t'].set_index('route_id', inplace=True)

    if 'trip_id' not in gtfs_data['trips_a'].index.names:
        gtfs_data['trips_a'].set_index('trip_id', inplace=True)

    if 'trip_id' not in gtfs_data['trips_t'].index.names:
        gtfs_data['trips_t'].set_index('trip_id', inplace=True)

    vehicle_list = []
    for cursor_a in vehicles_a:
        trip_id_a = cursor_a['trip']['trip_id']
        if trip_id_a in gtfs_data['trips_a'].index:
            route_id_a = gtfs_data['trips_a'].loc[trip_id_a]['route_id']
            route_short_name_a = gtfs_data['routes_a'].loc[route_id_a]['route_short_name']
            trip_headsign_a = gtfs_data['trips_a'].loc[str(trip_id_a)]['trip_headsign']
            shape_id_a = gtfs_data['trips_a'].loc[str(trip_id_a)]['shape_id']

            vehicle_a = {
                'vehicle_id': cursor_a['vehicle']['license_plate'],
                'route_short_name': route_short_name_a,
                'latitude': cursor_a['position']['latitude'],
                'longitude': cursor_a['position']['longitude'],
                'timestamp': cursor_a['timestamp'],
                'stop_id': cursor_a['stop_id'],
                'trip_id': trip_id_a,
                'route_id': route_id_a,
                'trip_headsign': trip_headsign_a,
                'shape_id': shape_id_a,
                'bearing': cursor_a['position']['bearing'],
                'type': 'bus'
            }
            vehicle_list.append(vehicle_a)

    for cursor_t in vehicles_t:
        trip_id_t = cursor_t['trip']['trip_id']
        if trip_id_t in gtfs_data['trips_t'].index:
            route_id_t = gtfs_data['trips_t'].loc[trip_id_t]['route_id']
            route_short_name_t = gtfs_data['routes_t'].loc[route_id_t]['route_short_name']
            trip_headsign_t = gtfs_data['trips_t'].loc[str(trip_id_t)]['trip_headsign']
            shape_id_t = gtfs_data['trips_t'].loc[str(trip_id_t)]['shape_id']

            vehicle_t = {
                'vehicle_id': cursor_t['vehicle']['license_plate'],
                'route_short_name': route_short_name_t,
                'latitude': cursor_t['position']['latitude'],
                'longitude': cursor_t['position']['longitude'],
                'timestamp': cursor_t['timestamp'],
                'stop_id': cursor_t['stop_id'],
                'trip_id': trip_id_t,
                'route_id': route_id_t,
                'trip_headsign': trip_headsign_t,
                'shape_id': shape_id_t,
                'bearing': cursor_t['position']['bearing'],
                'type': 'tram'
            }
            vehicle_list.append(vehicle_t)
    return vehicle_list
 


def prepare_realtime_data_for_database():
    print("New realtime data processing started.")
    gtfs_data = load_gtfs_data()
    vehicles_list = get_vehicle_with_route_name(gtfs_data)

    formated_vehicles_list = []
    for vehicle in vehicles_list:
        if vehicle['vehicle_id'][0] in ('D', 'P', 'B', 'K'):
            formated_vehicle = {
                'vehicle_id': vehicle['vehicle_id'],
                'schedule_number': get_schedule_number_from_trip_id(gtfs_data, vehicle['trip_id'], vehicle['type']),
                'latitude': vehicle['latitude'],
                'longitude': vehicle['longitude'], 
                'timestamp': vehicle['timestamp']
            }
            formated_vehicles_list.append(formated_vehicle)
    with SessionLocal() as session:
        update_vehicles_status(session, formated_vehicles_list)