import requests

def download_gtfs_realtime_file():

    url_a = 'https://gtfs.ztp.krakow.pl/VehiclePositions_A.pb'
    local_filename_a = 'services/realtime/realtime_data/vehicle_positions_a.pb'
    url_t = 'https://gtfs.ztp.krakow.pl/VehiclePositions_T.pb'
    local_filename_t = 'services/realtime/realtime_data/vehicle_positions_t.pb'

    response_a = requests.get(url_a, stream=True)
    if response_a.status_code == 200:
        with open(local_filename_a, 'wb') as f:
            for chunk in response_a.iter_content(chunk_size=8192):
                if chunk:
                    f.write(chunk)
        print(f"Downloaded {local_filename_a} successfully.")
    else:
        raise Exception(f"Failed to download file {url_a}. Status code: {response_a.status_code}")
    
    response_t = requests.get(url_t, stream=True)
    if response_t.status_code == 200:
        with open(local_filename_t, 'wb') as f:
            for chunk in response_t.iter_content(chunk_size=8192):
                if chunk:
                    f.write(chunk)
        print(f"Downloaded {local_filename_t} successfully.")
    else:
        raise Exception(f"Failed to download file {url_t}. Status code: {response_t.status_code}")
