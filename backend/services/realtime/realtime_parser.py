import backend.services.gtfs_realtime_pb2 as gtfs_realtime_pb2


def parse_vehicle_positions(file_path):

    vehicles = []
    try:
        with open(file_path, 'rb') as f:
            data = f.read()

        feed = gtfs_realtime_pb2.FeedMessage()
        feed.ParseFromString(data)

        for entity in feed.entity:
            if entity.HasField('vehicle'):
                vehicle = entity.vehicle
                vehicle_info = {
                    'trip': {
                        'trip_id': vehicle.trip.trip_id,
                        'route_id': vehicle.trip.route_id,
                        'direction_id': vehicle.trip.direction_id,
                    },
                    'vehicle': {
                        'license_plate': vehicle.vehicle.license_plate
                    },
                    'position': {
                        'latitude': vehicle.position.latitude,
                        'longitude': vehicle.position.longitude,
                        'bearing': vehicle.position.bearing,
                    },
                    'current_stop_sequence': vehicle.current_stop_sequence,
                    'stop_id': vehicle.stop_id,
                    'timestamp': vehicle.timestamp
                }
                vehicles.append(vehicle_info)

    except Exception as e:
        print(f"Failed to parse {file_path}: {e}")
        raise

    return vehicles
