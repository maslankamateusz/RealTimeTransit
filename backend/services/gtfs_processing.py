import pandas as pd
from collections import Counter

def get_routes_list(gtfs_data):
    routes_a = gtfs_data['routes_a'][['route_id', 'route_short_name']]
    routes_t = gtfs_data['routes_t'][['route_id', 'route_short_name']]
    routes_list = pd.concat([routes_a, routes_t], ignore_index=True)
    return routes_list

def get_stops_list(gtfs_data, route_number, direction):
    routes_list = get_routes_list(gtfs_data)
    matching_routes = routes_list[routes_list['route_short_name'] == str(route_number)]
    
    if matching_routes.empty:
        raise ValueError(f"No route found for route number {route_number}")
    if len(matching_routes) > 1:
        raise ValueError(f"Multiple routes found for route number {route_number}")
    
    route_id = matching_routes.iloc[0]['route_id']
    trips_key = 'trips_a' if len(route_number) == 3 else 'trips_t'
    stop_times_key = 'stop_times_a' if len(route_number) == 3 else 'stop_times_t'
    stops_key = 'stops_a' if len(route_number) == 3 else 'stops_t'

    trips = gtfs_data[trips_key]
    stop_times = gtfs_data[stop_times_key]
    stops = gtfs_data[stops_key]

    trips_for_route = trips[trips['route_id'] == route_id]
    filtered_trips = trips_for_route[trips_for_route['direction_id'] == int(direction)]

    trip_ids = filtered_trips.index.unique()
    stops_for_all_trips = stop_times.loc[trip_ids].merge(stops, on='stop_id', how='inner')
    return stops_for_all_trips[['stop_id', 'stop_name']].drop_duplicates().to_dict(orient='records')


def get_schedule_data(gtfs_data, route_id, vehicle_type='bus'):
    days_of_week = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    if vehicle_type == 'bus':
        trips_data = gtfs_data['trips_a']
        stop_times_data = gtfs_data['stop_times_a']
        calendar_data = gtfs_data['calendar_a']
    elif vehicle_type == 'tram':
        trips_data = gtfs_data['trips_t']
        stop_times_data = gtfs_data['stop_times_t']
        calendar_data = gtfs_data['calendar_t']
    else:
        raise ValueError("Invalid vehicle type. Must be 'bus' or 'tram'.")

    filtered_data = trips_data[trips_data['route_id'] == route_id].copy()
    if 'trip_id' in filtered_data.index.names:
        filtered_data.reset_index(inplace=True)
    
    filtered_data['block_prefix'] = filtered_data['trip_id'].str.split('_').str[:2].str.join('_')
    unique_blocks = filtered_data[['block_prefix']].drop_duplicates().reset_index(drop=True)
        
    block_prefixes = unique_blocks['block_prefix']

    if 'trip_id' in stop_times_data.index.names:
        stop_times_data.reset_index(inplace=True)

    route_schedule_list = []

    for block_prefix in block_prefixes:
        block_filtered_trips = trips_data[trips_data.index.str.startswith(block_prefix + '_t')]

        first_trip_id = block_filtered_trips.iloc[0].name
        filtred_start_time_data = stop_times_data[stop_times_data['trip_id'] == first_trip_id]
        start_time = filtred_start_time_data.departure_time.values[0]
        last_trip_id = block_filtered_trips.iloc[-1].name
        filtred_end_time_data = stop_times_data[stop_times_data['trip_id'] == last_trip_id]
        end_time = filtred_end_time_data.departure_time.values[-1]

        service_id = block_filtered_trips["service_id"].values[0]

        service_day = calendar_data[calendar_data['service_id'] == service_id].copy()
        days_with_service = service_day[days_of_week].loc[:, service_day[days_of_week].iloc[0] == 1].columns.tolist()
        block_filtered_trips_with_index = block_filtered_trips.reset_index()

        schedule_dict = {
            'block_prefix': block_prefix,
            'start_time': start_time,
            'end_time': end_time,
            'route_schedule': block_filtered_trips_with_index,
            'service_days': days_with_service
        }
        route_schedule_list.append(schedule_dict)
    return route_schedule_list

def get_trips_data_from_vehicle_type(gtfs_data, vehicle_type):
    if vehicle_type == "bus":
        trips_data = gtfs_data['trips_a']
    elif vehicle_type == "tram":
        trips_data = gtfs_data['trips_t']
    else:
        raise ValueError("Invalid vehicle type. Must be 'bus' or 'tram'.")

    if 'trip_id' in trips_data.index.names:
        trips_data.reset_index(inplace=True)

    return trips_data

def get_route_short_name_from_route_id(gtfs_data, route_id):
    routes_list = get_routes_list(gtfs_data)
    route_short_name = routes_list[routes_list["route_id"] == route_id]["route_short_name"].values[0]

    return route_short_name

def get_schedule_route_short_name(gtfs_data, trip_id, vehicle_type):
    block_id = "_".join(trip_id.split("_")[:2])
    trips_data = get_trips_data_from_vehicle_type(gtfs_data, vehicle_type)

    filtered_data = trips_data[trips_data['block_id'] == block_id]
    route_ids = filtered_data['route_id'].values

    counter = Counter(route_ids)
    schedule_route_id = counter.most_common(1)[0][0]

    route_short_name = get_route_short_name_from_route_id(gtfs_data, schedule_route_id)
    return route_short_name

def get_schedule_number_from_trip_id(gtfs_data, trip_id, vehicle_type):
    trips_data = get_trips_data_from_vehicle_type(gtfs_data, vehicle_type)
    filtered_data = trips_data[trips_data['trip_id'] == trip_id]

    route_id = filtered_data['route_id'].values[0]
    service_id = filtered_data['service_id'].values[0]
    block_id = filtered_data['block_id'].values[0]

    if pd.isna(filtered_data['route_id'].values[0]) or pd.isna(filtered_data['service_id'].values[0]) or pd.isna(filtered_data['block_id'].values[0]):
        raise ValueError(f"Missing data for trip_id {trip_id}")
    
    filtred_data = trips_data[(trips_data['route_id'] == route_id) & (trips_data['service_id'] == service_id)]

    if filtered_data.empty:
        raise ValueError(f"No data found for trip_id {trip_id}")

    block_ids = sorted(set(filtred_data['block_id'].values))
    schedule_number = block_ids.index(block_id) + 1
    formatted_schedule_number = str(schedule_number).zfill(2)

    route_short_name = get_schedule_route_short_name(gtfs_data, trip_id, vehicle_type)
    result = f"{route_short_name}/{formatted_schedule_number}"
    return result