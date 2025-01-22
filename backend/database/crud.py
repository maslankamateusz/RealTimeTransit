import json
import os
from sqlalchemy.orm import Session
from sqlalchemy.dialects.postgresql import insert
from datetime import datetime, timezone
from .models import Vehicle, DailyLogs, VehiclesStatus

def import_vehicles_from_json(db: Session, json_filename: str, batch_size: int = 100) -> int:
    json_path = os.path.join(os.path.dirname(__file__), 'data', json_filename)
    
    if not os.path.exists(json_path):
        raise FileNotFoundError(f"File {json_filename} was not found.")

    with open(json_path, "r", encoding="utf-8") as file:
        vehicles_data = json.load(file)

    imported_count = 0
    batch = []

    try:
        for idx, vehicle in enumerate(vehicles_data):
            new_vehicle = Vehicle(
                vehicle_id=vehicle["vehicle_id"],
                bus_brand=vehicle.get("bus_brand"),
                depot=vehicle.get("depot")
            )
            batch.append(new_vehicle)

            if len(batch) >= batch_size or idx == len(vehicles_data) - 1:
                db.add_all(batch)
                db.commit()
                print(f"Imported {len(batch)} vehicles.")
                imported_count += len(batch)
                batch.clear()  

        return imported_count
    except Exception as e:
        db.rollback()
        print(f"Error while importing: {e}")
        raise

def delete_old_vehicle_statuses(session):
    today = datetime.now(timezone.utc).date()
    session.query(VehiclesStatus).filter(VehiclesStatus.last_updated < today).delete()
    session.commit()

def update_vehicles_status(session, vehicles_data):
    delete_old_vehicle_statuses(session)
    existing_statuses = {
        v.vehicle_id: v
        for v in session.query(VehiclesStatus).filter(
            VehiclesStatus.vehicle_id.in_([v["vehicle_id"] for v in vehicles_data])
        )
    }
    
    new_objects = []
    for vehicle in vehicles_data:
        current_time = datetime.fromtimestamp(vehicle['timestamp']).replace(microsecond=0)
        vehicle_id = vehicle["vehicle_id"]
        
        if vehicle_id in existing_statuses:
            vehicle_status = existing_statuses[vehicle_id]
            if vehicle_status.schedule_number != vehicle["schedule_number"]:
                handle_line_change(session, vehicle_status, vehicle)
            vehicle_status.schedule_number = vehicle["schedule_number"]
            vehicle_status.latitude = vehicle["latitude"]
            vehicle_status.longitude = vehicle["longitude"]
            vehicle_status.last_updated = current_time
        else:
            new_vehicle = VehiclesStatus(
                vehicle_id=vehicle_id,
                schedule_number=vehicle["schedule_number"],
                latitude=vehicle["latitude"],
                longitude=vehicle["longitude"],
                last_updated=current_time,
            )
            new_objects.append(new_vehicle)
            log_new_vehicle_to_daily_logs(session, vehicle)
    
    if new_objects:
        session.bulk_save_objects(new_objects)

    session.commit()

def handle_line_change(session,old_status, new_status):
    vehicle_old_id = old_status.vehicle_id
    vehicle_old_schedule_number = old_status.schedule_number
    vehicle_old_date = old_status.last_updated.date()

    vehicle_new_schedule_number = new_status['schedule_number']
    vehicle_new_routes_list = new_status['routes_list']
    vehicle_new_formatted_routes_list = [int(route) for route in vehicle_new_routes_list]

    daily_log = session.query(DailyLogs).filter(
        DailyLogs.vehicle_id == vehicle_old_id,
        DailyLogs.date == vehicle_old_date
    ).first()

    if daily_log:
        if vehicle_new_schedule_number not in daily_log.schedule_number:
            daily_log.schedule_number = daily_log.schedule_number + [vehicle_new_schedule_number]
        vehicle_new_formatted_routes_list = [148]
        if vehicle_new_formatted_routes_list not in daily_log.route_short_names:

            max_length = max(len(route_list) for route_list in daily_log.route_short_names) if daily_log.route_short_names else 0
            if len(vehicle_new_formatted_routes_list) < max_length:
                last_value = vehicle_new_formatted_routes_list[-1]
                vehicle_new_formatted_routes_list.extend([last_value] * (max_length - len(vehicle_new_formatted_routes_list)))
 
            updated_routes = [
                route_list + [route_list[-1]] * (len(vehicle_new_formatted_routes_list) - len(route_list))
                for route_list in daily_log.route_short_names
            ]
            updated_routes.append(vehicle_new_formatted_routes_list)

            daily_log.route_short_names = updated_routes
            
        session.commit()



def log_new_vehicle_to_daily_logs(session, vehicle):
    current_time = datetime.fromtimestamp(vehicle['timestamp']).replace(microsecond=0)
    current_date = current_time.date()

    routes_list = [int(route) for route in vehicle["routes_list"]]
    daily_log = DailyLogs(
        vehicle_id=vehicle["vehicle_id"],
        schedule_number=[vehicle["schedule_number"]],
        route_short_names=[routes_list],   
        date=current_date, 
    )
    
    session.add(daily_log)
    session.commit()
    
