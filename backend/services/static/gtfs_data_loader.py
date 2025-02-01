import pandas as pd
import os
import requests
import zipfile

class GTFSData:
    def __init__(self):
        self.data = None

    def load_data(self, data):
        self.data = data

    def get_data(self):
        return self.data

gtfs_data_instance = GTFSData()

def should_download_files(folder_path):
    if not os.path.exists(folder_path):
        return True 

    files = list(os.scandir(folder_path))
    return len(files) <= 1 

def download_and_extract_gtfs(url, extract_to):
    if not should_download_files(extract_to):
        print(f"Pliki GTFS w {extract_to} już istnieją, pomijam pobieranie.")
        return

    os.makedirs(extract_to, exist_ok=True)
    zip_path = os.path.join(extract_to, os.path.basename(url))

    print(f"Pobieranie {url}...")
    response = requests.get(url, stream=True)
    
    if response.status_code == 200:
        with open(zip_path, 'wb') as file:
            for chunk in response.iter_content(chunk_size=8192):
                file.write(chunk)
        print(f"Pobrano: {zip_path}")

        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            zip_ref.extractall(extract_to)
        print(f"Rozpakowano do: {extract_to}")

        os.remove(zip_path)
    else:
        raise Exception(f"Nie udało się pobrać pliku: {url}")

def load_gtfs_data():
    base_path = os.path.dirname(__file__)
    extracted_path = os.path.join(base_path, 'gtfs_data')

    bus_path = os.path.join(extracted_path, 'bus')
    tram_path = os.path.join(extracted_path, 'tram')

    url_gtfs_a = "https://gtfs.ztp.krakow.pl/GTFS_KRK_A.zip"
    url_gtfs_t = "https://gtfs.ztp.krakow.pl/GTFS_KRK_T.zip"

    download_and_extract_gtfs(url_gtfs_a, bus_path)
    download_and_extract_gtfs(url_gtfs_t, tram_path)

    stops_df_a = pd.read_csv(os.path.join(bus_path, 'stops.txt'))
    routes_df_a = pd.read_csv(os.path.join(bus_path, 'routes.txt'))
    trips_df_a = pd.read_csv(os.path.join(bus_path, 'trips.txt'))
    stop_times_df_a = pd.read_csv(os.path.join(bus_path, 'stop_times.txt'))
    calendar_df_a = pd.read_csv(os.path.join(bus_path, 'calendar.txt'))
    schedule_numbers_df_a = pd.read_csv(os.path.join(bus_path, 'schedule_numbers_a.txt'))
    shapes_df_a = pd.read_csv(os.path.join(bus_path, 'shapes.txt'))

    stops_df_t = pd.read_csv(os.path.join(tram_path, 'stops.txt'))
    routes_df_t = pd.read_csv(os.path.join(tram_path, 'routes.txt'))
    trips_df_t = pd.read_csv(os.path.join(tram_path, 'trips.txt'))
    stop_times_df_t = pd.read_csv(os.path.join(tram_path, 'stop_times.txt'))
    calendar_df_t = pd.read_csv(os.path.join(tram_path, 'calendar.txt'))
    schedule_numbers_df_t = pd.read_csv(os.path.join(tram_path, 'schedule_numbers_t.txt'))
    shapes_df_t = pd.read_csv(os.path.join(tram_path, 'shapes.txt'))

    try:
        if 'trip_id' in trips_df_a.columns:
            trips_df_a.set_index('trip_id', inplace=True)
        else:
            raise KeyError("Column 'trip_id' does not exist in trips_df_a")
        
        stop_times_df_a.set_index('trip_id', inplace=True)

        if 'trip_id' in trips_df_t.columns:
            trips_df_t.set_index('trip_id', inplace=True)
        else:
            raise KeyError("Column 'trip_id' does not exist in trips_df_t")
        
        stop_times_df_t.set_index('trip_id', inplace=True)

    except KeyError as e:
        print(f"Key error: {e}")
        raise

    routes_df_a['route_short_name'] = routes_df_a['route_short_name'].astype(str)
    routes_df_t['route_short_name'] = routes_df_t['route_short_name'].astype(str)

    gtfs_data = {
        'stops_a': stops_df_a,
        'routes_a': routes_df_a,
        'trips_a': trips_df_a,  
        'stop_times_a': stop_times_df_a,
        'calendar_a': calendar_df_a,
        'schedule_num_a': schedule_numbers_df_a,
        'shapes_a': shapes_df_a,
        'stops_t': stops_df_t,
        'routes_t': routes_df_t,
        'trips_t': trips_df_t,  
        'stop_times_t': stop_times_df_t,
        'calendar_t': calendar_df_t,
        'schedule_num_t': schedule_numbers_df_t,
        'shapes_t': shapes_df_t
    }

    gtfs_data_instance.load_data(gtfs_data)
