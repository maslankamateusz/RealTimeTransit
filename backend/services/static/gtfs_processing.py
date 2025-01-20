import pandas as pd
from collections import Counter

def get_bus_routes_list(gtfs_data):
    if 'route_id' in gtfs_data['routes_a'].index.names:
        gtfs_data['routes_a'].reset_index(inplace=True)

    routes_a = gtfs_data['routes_a'][['route_id', 'route_short_name']]
    return routes_a

def get_tram_routes_list(gtfs_data):
    if 'route_id' in gtfs_data['routes_t'].index.names:
        gtfs_data['routes_t'].reset_index(inplace=True)

    routes_t = gtfs_data['routes_t'][['route_id', 'route_short_name']]
    return routes_t

def get_routes_list(gtfs_data):
    routes_a = get_bus_routes_list(gtfs_data)
    routes_t = get_tram_routes_list(gtfs_data)
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

def get_route_short_name_from_route_id(gtfs_data, route_id, vehicle_type):

    if vehicle_type == "bus":
        routes_list = get_bus_routes_list(gtfs_data)
    else:
        routes_list = get_tram_routes_list(gtfs_data)

    route_short_name = routes_list[routes_list["route_id"] == route_id]["route_short_name"].values[0]
    return route_short_name



def create_csv_with_schedule_numbers(gtfs_data):
    try:
        file_path_a = "./services/static/gtfs_data/bus/schedule_numbers_a.txt"
        file_path_t = "./services/static/gtfs_data/tram/schedule_numbers_t.txt"
        
        routes_data_a = gtfs_data['routes_a']
        trips_data_a = gtfs_data['trips_a']
        calendar_df_a = gtfs_data['calendar_a']
        routes_data_t = gtfs_data['routes_t']
        trips_data_t = gtfs_data['trips_t']
        calendar_df_t = gtfs_data['calendar_t']

        schedule_number_df_a = create_df_with_schedule_numbers(routes_data_a, trips_data_a, calendar_df_a)
        schedule_number_df_a.to_csv(file_path_a, sep=",", index=False) 
        schedule_number_df_t = create_df_with_schedule_numbers(routes_data_t, trips_data_t, calendar_df_t)
        schedule_number_df_t.to_csv(file_path_t, sep=",", index=False) 

        return "Data saved"
    except Exception as e:
        print(f"An error occurred: {e}")



def create_df_with_schedule_numbers(routes_data, trips_data, calendar_df):
    route_short_names = routes_data['route_short_name'].drop_duplicates().values.tolist()
    service_ids = calendar_df['service_id'].tolist()

    shedule_list = []
    for service_id in service_ids:
        filtered_trips_data = trips_data[trips_data['service_id'] == service_id]
        block_ids = filtered_trips_data['block_id'].drop_duplicates().values
        
        sorted_route_short_names = sorted(route_short_names, key=int)
        routes_list = []
        for route_short_name in sorted_route_short_names:
            route_id = routes_data[routes_data["route_short_name"] == route_short_name]["route_id"].values[0]  
            block_ids = filtered_trips_data[filtered_trips_data['route_id'] == route_id]['block_id'].drop_duplicates().values.tolist()
            block_numbers = [block.split('_')[1] for block in block_ids]
            block_numbers.sort(key=int)

            routes_list.append({route_short_name: block_numbers})

        first_key = next(iter(routes_list[0]))
        first_block_id = int(routes_list[0][first_key][0])

        last_bloc = first_block_id - 1

        for route_block in routes_list:
            for route, blocks in route_block.items():
                if blocks:
                    schedule_num = 1
                    for block in blocks:
                        if int(block) == last_bloc + 1:
                            last_bloc = int(block)
                            shedule_list.append({"block_id" : f"block_{block}", "schedule_number": f"{route}/{str(schedule_num).zfill(2)}", "service_id" : service_id})
                            schedule_num += 1
                            continue
        
    schedule_number_df = pd.DataFrame(shedule_list)
    return schedule_number_df
    

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

    filtered_data = trips_data.loc[(trips_data['route_id'] == route_id) ]
    if 'trip_id' in filtered_data.index.names:
        filtered_data.reset_index(inplace=True)
    
    block_ids = filtered_data['block_id'].drop_duplicates().values.tolist()
    schedule_number_list = []

    for block_id in block_ids:
        block_filtered_data = trips_data[trips_data['block_id'] == block_id]
        frequent_route_id = block_filtered_data['route_id'].value_counts().idxmax()
        if frequent_route_id == route_id:
            schedule_number_list.append(block_id)
            
    unique_blocks = filtered_data[['block_id']].drop_duplicates().reset_index(drop=True)
    block_prefixes = unique_blocks['block_id']

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

        schedule_dict = {
            'block_id': block_id,
            'service_id': service_id,
            'start_time': start_time,
            'end_time': end_time,
            'service_days': days_with_service
        }
        route_schedule_list.append(schedule_dict)
    return route_schedule_list


def get_trips_data_from_vehicle_type(gtfs_data, vehicle_type):
    if vehicle_type == 'bus':
        return gtfs_data['trips_a']
    elif vehicle_type == 'tram':
        return gtfs_data['trips_t']
    else:
        raise ValueError(f"Unknown vehicle type: {vehicle_type}")



def get_schedule_route_short_name(gtfs_data, trip_id, vehicle_type):
    block_id = "_".join(trip_id.split("_")[:2])
    trips_data = get_trips_data_from_vehicle_type(gtfs_data, vehicle_type)
    filtered_data = trips_data[trips_data['block_id'] == block_id]
    route_ids = filtered_data['route_id'].values
    counter = Counter(route_ids)
    schedule_route_id = counter.most_common(1)[0][0]

    route_short_name = get_route_short_name_from_route_id(gtfs_data, schedule_route_id, vehicle_type)
    return route_short_name


def get_schedule_from_block_id(gtfs_data, block_id, vehicle_type):
    trips_data = get_trips_data_from_vehicle_type(gtfs_data, vehicle_type)
    filtered_data = trips_data[trips_data['block_id'] == block_id]

    if filtered_data.empty:
        raise ValueError(f"No data found for block_id {block_id}")

    return filtered_data

def get_block_ids_from_route_id(gtfs_data, route_id, vehicle_type):
    trips_data = get_trips_data_from_vehicle_type(gtfs_data, vehicle_type)
    filtered_data = trips_data[trips_data['route_id'] == route_id]

    if filtered_data.empty:
        raise ValueError(f"No data found for route_id {route_id}")

    block_ids = sorted(set(filtered_data['block_id'].values))
    return block_ids

def get_route_id_from_route_number(gtfs_data, route_number):
    routes_list = get_routes_list(gtfs_data)
    route_id = routes_list[routes_list["route_short_name"] == route_number]["route_id"].values[0]

    return route_id

def get_timetable_data(gtfs_data, route_number, direction, stop_id):
    if(len(route_number) >= 3):
        stop_times_data = gtfs_data['stop_times_a']
        block_ids = get_block_ids_from_route_id(gtfs_data, get_route_id_from_route_number(gtfs_data, route_number), "bus")
    else:
        stop_times_data = gtfs_data['stop_times_t']
        block_ids = get_block_ids_from_route_id(gtfs_data, get_route_id_from_route_number(gtfs_data, route_number), "tram")


    filtred_stop_times_data = stop_times_data[stop_times_data['stop_id'] == stop_id]
    filtred_df = filtred_stop_times_data[['departure_time', 'stop_id']].copy()
    filtred_df['block_id'] = filtred_df.index.str.split('_').str[:2].str.join('_')
    filtred_df['trip_id'] = filtred_df.index.str.split('_').str[3:4].str.join('_')
    filtred_df['service_id'] = filtred_df.index.str.split('_').str[5:].str.join('_')

    filtred_df = filtred_df[filtred_df['block_id'].isin(block_ids)]

    if direction == 0:
        filtred_df = filtred_df[filtred_df['trip_id'].astype(int) % 2 == 0]
    elif direction == 1:
        filtred_df = filtred_df[filtred_df['trip_id'].astype(int) % 2 != 0]

    return filtred_df.to_dict(orient='records')

def get_schedule_number_from_block_id(gtfs_data, block_id, service_id, vehicle_type):
    if vehicle_type == "bus":
        schedule_data = gtfs_data['schedule_num_a']
    else:
        schedule_data = gtfs_data['schedule_num_t']

    schedule_number = schedule_data[(schedule_data['block_id'] == block_id) & (schedule_data['service_id'] == service_id)]['schedule_number'].values[0]
    return schedule_number

def get_routes_list_from_block_id(gtfs_data, vehicle_type, block_id):
    if vehicle_type == "bus":
        trips_data = gtfs_data['trips_a']
    else:
        trips_data = gtfs_data['trips_t']

    routes_list = trips_data[trips_data['block_id'] == block_id]['route_id'].unique()
    route_short_names_list = []
    for route_id in routes_list:
        route_short_name = get_route_short_name_from_route_id(gtfs_data, route_id, vehicle_type)
        route_short_names_list.append(route_short_name)

    return route_short_names_list