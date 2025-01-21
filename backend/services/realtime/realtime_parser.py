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
                        'start_time': vehicle.trip.start_time,
                        'start_date': vehicle.trip.start_date,
                        'schedule_relationship': vehicle.trip.schedule_relationship
                    },
                    'vehicle': {
                        'id': vehicle.vehicle.id,
                        'label': vehicle.vehicle.label,
                        'license_plate': vehicle.vehicle.license_plate
                    },
                    'position': {
                        'latitude': vehicle.position.latitude,
                        'longitude': vehicle.position.longitude,
                        'bearing': vehicle.position.bearing,
                        'odometer': vehicle.position.odometer,
                        'speed': vehicle.position.speed
                    },
                    'current_stop_sequence': vehicle.current_stop_sequence,
                    'stop_id': vehicle.stop_id,
                    'current_status': vehicle.current_status,
                    'timestamp': vehicle.timestamp,
                    'congestion_level': vehicle.congestion_level,
                    'occupancy_status': vehicle.occupancy_status,
                    'occupancy_percentage': vehicle.occupancy_percentage,
                    'multi_carriage_details': [
                        {
                            'id': carriage.id,
                            'label': carriage.label,
                            'occupancy_status': carriage.occupancy_status,
                            'occupancy_percentage': carriage.occupancy_percentage,
                            'carriage_sequence': carriage.carriage_sequence
                        } for carriage in vehicle.multi_carriage_details
                    ]
                }
                vehicles.append(vehicle_info)

    except Exception as e:
        print(f"Failed to parse {file_path}: {e}")
        raise

    return vehicles
