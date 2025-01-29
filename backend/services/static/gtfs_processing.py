import datetime
import pandas as pd
from collections import Counter
from operator import itemgetter
from ...database.crud import get_vehicle_ids_with_timestamps_by_schedule_number
from ...database.session import SessionLocal
from datetime import datetime

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

def get_routes_dict(gtfs_data):
    routes_a = get_bus_routes_list(gtfs_data)
    routes_t = get_tram_routes_list(gtfs_data)
    routes_list = pd.concat([routes_a, routes_t], ignore_index=True)
    return routes_list

def get_routes_list_with_labels(gtfs_data):
    routes_a = get_bus_routes_list(gtfs_data).values
    sorted_routes_a = routes_a[routes_a[:, 1].argsort()]

    routes_t = get_tram_routes_list(gtfs_data).values
    sorted_routes_t = routes_t[routes_t[:, 1].astype(int).argsort()]

    lines_dict = {
        "Linie tramwajowe dzienne": [],
        "Linie tramwajowe wspomagające": [],
        "Linie tramwajowe KST": [],
        "Linie tramwajowe nocne": [],
        "Linie tramwajowe zastępcze": [],
        "Linie tramwajowe cmentarne": [],
        "Linie autobusowe miejskie": [],
        "Linie autobusowe aglomeracyjne": [], 
        "Linie autobusowe aglomeracyjne przyśpieszone": [], 
        "Linie autobusowe miejskie wspomagające": [], 
        "Linie autobusowe miejskie przyśpieszone": [], 
        "Linie autobusowe miejskie nocne": [], 
        "Linie autobusowe zastępcze": [], 
        "Linie autobusowe cmentarne": [], 
        "Linie autobusowe aglomeracyjne nocne": [], 
    }
    for route in sorted_routes_a:
        line_number = int(route[1])
        if line_number < 200:
            lines_dict["Linie autobusowe miejskie"].append({route[1]: route[0]})
        elif line_number < 300:
            lines_dict["Linie autobusowe aglomeracyjne"].append({route[1]: route[0]})
        elif line_number < 400:
            lines_dict["Linie autobusowe aglomeracyjne przyśpieszone"].append({route[1]: route[0]})
        elif line_number < 500:
            lines_dict["Linie autobusowe miejskie wspomagające"].append({route[1]: route[0]})
        elif line_number < 600:
            lines_dict["Linie autobusowe miejskie przyśpieszone"].append({route[1]: route[0]})
        elif line_number < 700:
            lines_dict["Linie autobusowe miejskie nocne"].append({route[1]: route[0]})
        elif line_number < 800:
            lines_dict["Linie autobusowe zastępcze"].append({route[1]: route[0]})
        elif line_number < 900:
            lines_dict["Linie autobusowe cmentarne"].append({route[1]: route[0]})
        elif line_number < 1000:
            lines_dict["Linie autobusowe aglomeracyjne nocne"].append({route[1]: route[0]})

    for route in sorted_routes_t:
        line_number = int(route[1])
        if line_number < 40:
            lines_dict["Linie tramwajowe dzienne"].append({route[1]: route[0]})
        elif line_number < 50:
            lines_dict["Linie tramwajowe wspomagające"].append({route[1]: route[0]})
        elif line_number < 60:
            lines_dict["Linie tramwajowe KST"].append({route[1]: route[0]})
        elif line_number < 70:
            lines_dict["Linie tramwajowe nocne"].append({route[1]: route[0]})
        elif line_number < 80:
            lines_dict["Linie tramwajowe zastępcze"].append({route[1]: route[0]})
        elif line_number < 90:
            lines_dict["Linie tramwajowe cmentarne"].append({route[1]: route[0]})

    return lines_dict

def get_routes_list(gtfs_data):
    routes_a = get_bus_routes_list(gtfs_data)
    routes_t = get_tram_routes_list(gtfs_data)
    routes_list = pd.concat([routes_a, routes_t], ignore_index=True)

    return routes_list


def get_stops_list_for_route(gtfs_data, route_number):
    routes_list = get_routes_dict(gtfs_data)
    
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
    filtered_trips = trips[trips['route_id'] == route_id][['direction_id', 'trip_headsign']].drop_duplicates()

    direction_ids = [0,1]
    for direction_id in direction_ids:
        filtered_trips = trips_for_route[trips_for_route['direction_id'] == direction_id]

    if len(route_number) <= 2:
        test_number = len(filtered_trips['block_id'].drop_duplicates())*2
    else:
        test_number = 1

    directions_with_trip_headsign_list = []
    grouped_directions_dict = {} 

    for direction_id in direction_ids:
        filtered_trips = trips_for_route[trips_for_route['direction_id'] == direction_id]['trip_headsign'].values
        trip_headsign_counts = Counter(filtered_trips)
        valid_trip_headsigns = [trip_headsign for trip_headsign, count in trip_headsign_counts.items() if count > test_number]
        for trip_headsign in valid_trip_headsigns:
            directions_with_trip_headsign_list.append({direction_id: trip_headsign})
        grouped_directions_dict[direction_id] = valid_trip_headsigns
    
    if 'trip_id' in stop_times.index.names:
            stop_times = stop_times.reset_index()

    for direction_id, trip_headsigns in grouped_directions_dict.items():
        longest_stops_dict_length = 0
        longest_stops_dict = None
        for trip_headsign in trip_headsigns:
            filtered_trips = trips_for_route[trips_for_route['trip_headsign'] == trip_headsign]
            if filtered_trips.empty:
                continue 
            trip_ids = filtered_trips['shape_id'].drop_duplicates().index
            for trip_id in trip_ids:
                stop_times_with_correct_trip_id = stop_times[stop_times['trip_id'] == trip_id]
                stops_for_all_trips = stop_times_with_correct_trip_id.merge(stops, on='stop_id', how='inner')
                stops_dict = stops_for_all_trips[['stop_id', 'stop_name']].drop_duplicates().to_dict(orient='records')
                if len(stops_dict) > longest_stops_dict_length:
                    longest_stops_dict_length = len(stops_dict)
                    longest_stops_dict = stops_dict

        grouped_directions_dict[direction_id] = [trip_headsigns, longest_stops_dict]

    return grouped_directions_dict


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
        schedule_number_df_t = create_df_with_schedule_numbers_tram(routes_data_t, trips_data_t, calendar_df_t)
        schedule_number_df_t.to_csv(file_path_t, sep=",", index=False) 

        return "Data saved"
    except Exception as e:
        print(f"An error occurred: {e}")

def create_df_with_schedule_numbers_tram(routes_data, trips_data, calendar_df):
    service_ids = calendar_df['service_id'].tolist()
    
    final_schedule_list = []
    for service_id in service_ids:
        shedule_list = []
        block_ids = trips_data[trips_data['service_id'] == service_id]['block_id'].drop_duplicates().values
        for block_id in block_ids:
            route_ids = trips_data[trips_data['block_id'] == block_id]['route_id'].drop_duplicates().values
            if(len(route_ids) > 1):
                route_id = route_ids[-1]
            else:
                route_id = route_ids[0]
            shedule_list.append({"block_id" : block_id, "route_id": route_id, "service_id" : service_id})
        
        sorted_objects = sorted(shedule_list, key=itemgetter('route_id', 'block_id'))
        route_counters = {}
        for obj in sorted_objects:
            route_id = obj['route_id']
            if route_id not in route_counters:
                route_counters[route_id] = 1
            route_short_name = routes_data[routes_data["route_id"] == route_id]["route_short_name"].values[0]

            obj['schedule_number'] = f"{route_short_name}/{route_counters[route_id]:02}"
            route_counters[route_id] += 1
            if 'route_id' in obj:
                del obj['route_id']
            final_schedule_list.append(obj)
    schedule_number_df = pd.DataFrame(final_schedule_list)
    return schedule_number_df
    

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
    
def get_block_id_list_for_route_short_name(gtfs_data, route_short_name, vehicle_type):
    if vehicle_type == "bus":
        schedule_data = gtfs_data['schedule_num_a']
    else:
        schedule_data = gtfs_data['schedule_num_t']

    filtered_schedule_data = schedule_data[schedule_data["schedule_number"].str.contains(route_short_name)]
    return filtered_schedule_data.values

def check_for_realtime_data(schedule_number):
    with SessionLocal() as session:
        return get_vehicle_ids_with_timestamps_by_schedule_number(session, schedule_number)
    return None

def adjust_end_time(end_time):
    time_parts = end_time.split(":")
    hours = int(time_parts[0])
    minutes = int(time_parts[1])

    if hours >= 24:
        hours -= 24

    return f"{hours:02}:{minutes:02}"

def get_schedule_data(gtfs_data, route_name):
    days_of_week = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

    if len(route_name) < 3:
        vehicle_type = 'tram'
        routes_data = gtfs_data['routes_t']
        trips_data = gtfs_data['trips_t']
        stop_times_data = gtfs_data['stop_times_t']
        calendar_data = gtfs_data['calendar_t']
    else:
        vehicle_type = 'bus'
        routes_data = gtfs_data['routes_a']
        trips_data = gtfs_data['trips_a']
        stop_times_data = gtfs_data['stop_times_a']
        calendar_data = gtfs_data['calendar_a']

    if 'route_id' in routes_data.index.names:
        routes_data.reset_index(inplace=True)
    route_id = routes_data[routes_data['route_short_name'] == route_name]['route_id'].values[0]
 
    filtered_data = trips_data.loc[(trips_data['route_id'] == route_id)]
    if 'trip_id' in filtered_data.index.names:
        filtered_data.reset_index(inplace=True)
    
    if 'trip_id' in stop_times_data.index.names:
        stop_times_data.reset_index(inplace=True)
    block_ids = filtered_data['block_id'].drop_duplicates().values.tolist()
    schedule_number_list = []
    
    sorted_block_ids = sorted(block_ids, key=lambda x: int(x.split('_')[1]))
    for block_id in sorted_block_ids:
        block_filtered_data = trips_data[trips_data['block_id'] == block_id]
        route_short_names_list = []
        route_ids = block_filtered_data['route_id'].drop_duplicates().values.tolist()
        for route_id in route_ids:
            route_short_names_list.append(get_route_short_name_from_route_id(gtfs_data, route_id, vehicle_type))

        service_id = block_filtered_data['service_id'].values[0]
        schedule_number = get_schedule_number_from_block_id(gtfs_data, block_id, service_id, vehicle_type)


        first_trip_id = block_filtered_data.iloc[0].name
        filtred_start_time_data = stop_times_data[stop_times_data['trip_id'] == first_trip_id]
        start_time = filtred_start_time_data.departure_time.values[0]
        last_trip_id = block_filtered_data.iloc[-1].name
        filtred_end_time_data = stop_times_data[stop_times_data['trip_id'] == last_trip_id]
        end_time = filtred_end_time_data.departure_time.values[-1]
        adjusted_end_time = adjust_end_time(end_time)
        service_id = block_filtered_data["service_id"].values[0]
        service_day = calendar_data[calendar_data['service_id'] == service_id].copy()
        days_with_service = service_day[days_of_week].loc[:, service_day[days_of_week].iloc[0] == 1].columns.tolist()
        
        today = datetime.datetime.today()
        day_of_week = today.strftime('%A').lower()

        if day_of_week in days_with_service:
            vehicle_list = check_for_realtime_data(schedule_number)
            
        else:
            vehicle_list = None
        

        schedule_dict = {
            'block_id': block_id,
            'schedule_number': schedule_number,
            'service_id': service_id,
            'start_time': start_time,
            'end_time': adjusted_end_time,
            'service_days': days_with_service,
            'route_short_names': route_short_names_list,
            'vehicles': vehicle_list
        }
        schedule_number_list.append(schedule_dict)
    
    return schedule_number_list


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

def get_timetable_data(gtfs_data, route_number, direction, stop_id, service_id):
    if(len(route_number) >= 3):
        stop_times_data = gtfs_data['stop_times_a']
        block_ids = get_block_ids_from_route_id(gtfs_data, get_route_id_from_route_number(gtfs_data, route_number), "bus")
    else:
        stop_times_data = gtfs_data['stop_times_t']
        block_ids = get_block_ids_from_route_id(gtfs_data, get_route_id_from_route_number(gtfs_data, route_number), "tram")


    filtred_stop_times_data = stop_times_data[stop_times_data['stop_id'] == stop_id]
    filtred_df = filtred_stop_times_data[['departure_time', 'stop_id']].copy()
    filtred_df['block_id'] = filtred_df.index.str.split('_').str[:2].str.join('_')
    filtred_df['trip_number'] = filtred_df.index.str.split('_').str[3:4].str.join('_')
    filtred_df['service_id'] = filtred_df.index.str.split('_').str[5:].str.join('_')

    filtred_df = filtred_df[(filtred_df['block_id'].isin(block_ids)) & ("service_" + filtred_df['service_id'] == service_id)]
    if direction == 0:
        filtred_df = filtred_df[filtred_df['trip_number'].astype(int) % 2 == 0]
    elif direction == 1:
        filtred_df = filtred_df[filtred_df['trip_number'].astype(int) % 2 != 0]

    return filtred_df.to_dict(orient='records')

def get_schedule_number_from_block_id(gtfs_data, block_id, service_id, vehicle_type):
    schedule_data = gtfs_data['schedule_num_a'] if vehicle_type == "bus" else gtfs_data['schedule_num_t']
    filtered_data = schedule_data[(schedule_data['block_id'] == block_id) & (schedule_data['service_id'] == service_id)]
    if not filtered_data.empty:
        return filtered_data.iloc[0]['schedule_number'] 

    return None


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

def get_stops_list(gtfs_data):
    stops_data_a = gtfs_data['stops_a']
    stops_data_t = gtfs_data['stops_t']

    stops_list_a = stops_data_a['stop_name'].drop_duplicates().values.tolist()
    stops_list_t = stops_data_t['stop_name'].drop_duplicates().values.tolist()
    stops_list = stops_list_a + stops_list_t
    sorted_list = list(sorted(set(stops_list)))

    return sorted_list

def get_stops_list_with_location(gtfs_data):
    stops_data_a = add_stop_number_to_stop_name(gtfs_data['stops_a'], "bus")
    stops_data_t = add_stop_number_to_stop_name(gtfs_data['stops_t'], "tram")
    if 'stop_id' in stops_data_a.index.names:
        stops_data_a.reset_index(inplace=True)
    if 'stop_id' in stops_data_t.index.names:
        stops_data_t.reset_index(inplace=True)
    stops_data_a['type'] = "bus"
    stops_data_t['type'] = "tram"
    stops_list_a = stops_data_a[['stop_id', 'stop_name', 'stop_lat', 'stop_lon', 'type']]
    stops_list_t = stops_data_t[['stop_id', 'stop_name', 'stop_lat', 'stop_lon', 'type']]

    stops_list = pd.concat([stops_list_a, stops_list_t], ignore_index=True)
    return stops_list

def add_stop_number_to_stop_name(stops_data, vehicle_type):
    if vehicle_type == "bus":
        number_index = -1 
    else:
        number_index = -2  
    
    def add_number(row):
        try:
            stop_number = int(row['stop_id'][number_index]) 
            stop_number_str = str(stop_number).zfill(2) 
            if row['stop_name'].endswith(f" ({stop_number_str})"):
                return row['stop_name'] 
            else:
                return f"{row['stop_name']} ({stop_number_str})"
        except (ValueError, IndexError):
            return row['stop_name']  

    stops_data['stop_name'] = stops_data.apply(add_number, axis=1)
    
    return stops_data

def get_shape_list_for_trip_id(gtfs_data, trip_id, vehicle_type):
    if vehicle_type == "bus":
        trips_data = gtfs_data['trips_a']
        shapes_data = gtfs_data['shapes_a']
    else:
        trips_data = gtfs_data['trips_t']
        shapes_data = gtfs_data['shapes_t']

    shape_id = trips_data.loc[trip_id].shape_id
    filtred_shapes_data = shapes_data[shapes_data['shape_id'] == shape_id]
    shapes_list = filtred_shapes_data[['shape_pt_sequence', 'shape_pt_lat', 'shape_pt_lon']]
    return shapes_list

def get_stops_list_for_trip_with_delay(gtfs_data, vehicle_type, trip_id):
    if vehicle_type == "bus":
        stops = gtfs_data['stops_a']
        stop_times = gtfs_data['stop_times_a']
    else:
        stops = gtfs_data['stops_t']
        stop_times = gtfs_data['stop_times_t']
    stop_times_filtred = stop_times.loc[trip_id]
    if 'stop_id' not in stops.columns:
        stops = stops.reset_index() 

    stop_times_filtred.loc[:, 'stop_id'] = stop_times_filtred['stop_id'].astype(str) 
    stops['stop_id'] = stops['stop_id'].astype(str)  
    stop_times_filtred = stop_times_filtred.merge(stops[['stop_name', 'stop_id']], on='stop_id', how='left')

    return stop_times_filtred[['stop_id', 'stop_name', 'departure_time']].values.tolist()


def get_stop_details(gtfs_data, stop_name, service_id):
    stops_data_a = gtfs_data['stops_a']
    stops_data_t = gtfs_data['stops_t']
    stop_times_a = gtfs_data['stop_times_a']
    stop_times_t = gtfs_data['stop_times_t']

    stop_ids_a = stops_data_a[stops_data_a['stop_name'] == stop_name]['stop_id'].values.tolist()
    stop_ids_t = stops_data_t[stops_data_t['stop_name'] == stop_name]['stop_id'].values.tolist()

    schedule_dict = {}

    def process_stop_times(stop_ids, stop_times, transport_type):
        nonlocal schedule_dict
        stop_number = None
        
        for stop_id in stop_ids:
            filtered_data = stop_times[stop_times['stop_id'] == stop_id]
            for index, row in filtered_data.iterrows():
                trip_id_parts = index.split('_')
                
                if trip_id_parts[5] == service_id:
                    if transport_type == "bus":
                        number_index = -1
                    else:
                        number_index = -2

                    try:
                        stop_number = int(stop_id[number_index])
                    except (ValueError, IndexError):
                        stop_number = None  
                    
                    departure_time = row['departure_time']
                    departure_time_without_seconds = ':'.join(departure_time.split(':')[:2])
                    
                    schedule_number = get_schedule_number_from_trip_id(gtfs_data, index, transport_type)
                    
                    if schedule_number not in schedule_dict:
                        schedule_dict[schedule_number] = {
                            'stop_number': stop_number,  
                            'departure_times': []
                        }
                    
                    schedule_dict[schedule_number]['departure_times'].append(departure_time_without_seconds)

    process_stop_times(stop_ids_a, stop_times_a, "bus")
    process_stop_times(stop_ids_t, stop_times_t, "tram")

    return schedule_dict


def get_schedule_number_from_trip_id(gtfs_data, trip_id, vehicle_type):
    parts = trip_id.split("_")
    block_id = f"block_{parts[1]}".strip()
    service_id = f"service_{parts[5]}".strip()
    if vehicle_type == "bus":
        schedule_numbers = gtfs_data['schedule_num_a']
    else:
        schedule_numbers = gtfs_data['schedule_num_t']
    schedule_number = schedule_numbers[
        (schedule_numbers['block_id'] == block_id) &
        (schedule_numbers['service_id'] == service_id)
    ]['schedule_number'].values[0]
    return schedule_number



def get_stop_delay(gtfs_data, vehicle_type, trip_id, stop_id, timestamp):
    stop_list = get_stops_list_for_trip_with_delay(gtfs_data, vehicle_type, trip_id)

    for i, stop in enumerate(stop_list):
        current_stop_id = stop[0]
        departure_time = stop[2]

        if current_stop_id == stop_id:
            if i == 0: 
                return 0 
            today_date = datetime.today().strftime('%Y-%m-%d')

            try:
                departure_time_obj = datetime.strptime(f"{today_date} {departure_time}", '%Y-%m-%d %H:%M:%S')
            except ValueError:
                print(f"Invalid departure time format: {departure_time}")
                continue  

            departure_timestamp = int(departure_time_obj.timestamp())
            delay_seconds = timestamp - departure_timestamp
            delay_minutes = round(delay_seconds / 60)

            return delay_minutes  

    return None 

