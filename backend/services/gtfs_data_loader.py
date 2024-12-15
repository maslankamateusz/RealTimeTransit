import pandas as pd
import os

def load_gtfs_data():
    extracted_path = os.path.join(os.path.dirname(__file__), 'gtfs_data')

    bus_path = os.path.join(extracted_path, 'bus')
    tram_path = os.path.join(extracted_path, 'tram')

    stops_df_a = pd.read_csv(os.path.join(bus_path, 'stops.txt'))
    routes_df_a = pd.read_csv(os.path.join(bus_path, 'routes.txt'))
    trips_df_a = pd.read_csv(os.path.join(bus_path, 'trips.txt'))
    stop_times_df_a = pd.read_csv(os.path.join(bus_path, 'stop_times.txt'))
    calendar_df_a = pd.read_csv(os.path.join(bus_path, 'calendar.txt'))

    stops_df_t = pd.read_csv(os.path.join(tram_path, 'stops.txt'))
    routes_df_t = pd.read_csv(os.path.join(tram_path, 'routes.txt'))
    trips_df_t = pd.read_csv(os.path.join(tram_path, 'trips.txt'))
    stop_times_df_t = pd.read_csv(os.path.join(tram_path, 'stop_times.txt'))
    calendar_df_t = pd.read_csv(os.path.join(tram_path, 'calendar.txt'))
    
    trips_df_a.set_index('trip_id', inplace=True)
    stop_times_df_a.set_index('trip_id', inplace=True)
    trips_df_t.set_index('trip_id', inplace=True)
    stop_times_df_t.set_index('trip_id', inplace=True)

    routes_df_a['route_short_name'] = routes_df_a['route_short_name'].astype(str)
    routes_df_t['route_short_name'] = routes_df_t['route_short_name'].astype(str)

    return {
        'stops_a': stops_df_a,
        'routes_a': routes_df_a,
        'trips_a': trips_df_a,  
        'stop_times_a': stop_times_df_a,
        'calendar_a': calendar_df_a,
        'stops_t': stops_df_t,
        'routes_t': routes_df_t,
        'trips_t': trips_df_t,  
        'stop_times_t': stop_times_df_t,
        'calendar_t': calendar_df_t
    }
