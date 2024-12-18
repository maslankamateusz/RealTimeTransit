import pandas as pd

def get_routes_list(gtfs_data):
    routes_a = gtfs_data['routes_a'][['route_id', 'route_short_name']]
    routes_t = gtfs_data['routes_t'][['route_id', 'route_short_name']]
    routes_list = pd.concat([routes_a, routes_t], ignore_index=True)
    return routes_list.to_dict(orient="records")

def get_stops_list(gtfs_data, route_number, direction):
    routes_list = get_routes_list(gtfs_data)
    matching_routes = pd.DataFrame(routes_list)[pd.DataFrame(routes_list)['route_short_name'] == str(route_number)]
    if matching_routes.empty:
        raise ValueError(f"No route found for route number {route_number}")
    if len(matching_routes) > 1:
        raise ValueError(f"Multiple routes found for route number {route_number}")
    route_id = matching_routes['route_id'].values[0]

    if len(route_number) == 3:
        trips = gtfs_data['trips_a']
        stop_times = gtfs_data['stop_times_a']
        stops = gtfs_data['stops_a']
    else:
        trips = gtfs_data['trips_t']
        stop_times = gtfs_data['stop_times_t']
        stops = gtfs_data['stops_t']

    trips_for_route = trips[trips['route_id'] == route_id]
    if len(route_number) < 3:
        trips_for_route = trips_for_route.groupby('block_id').apply(lambda x: x.iloc[1:-1] if len(x) >= 3 else x)
    
    filtered_trips = trips_for_route[trips_for_route['direction_id'] == int(direction)]
    if len(route_number) == 3:
        trip_ids = filtered_trips.index.unique()
    else:
        trip_ids = filtered_trips.index.get_level_values(1).unique()

    stops_for_all_trips = stop_times.loc[trip_ids].reset_index().merge(stops, on='stop_id')
    stops = stops_for_all_trips[['stop_id', 'stop_name']].drop_duplicates().to_dict(orient='records')
    
    print(stops)
    return stops

