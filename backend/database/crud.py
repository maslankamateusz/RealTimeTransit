import json
import os
from sqlalchemy.orm import Session
from sqlalchemy.dialects.postgresql import insert
from datetime import datetime, timezone
from .models import Vehicle, DailyLog, VehiclesStatus

def import_vehicles_from_json(db: Session, json_filename: str, batch_size: int = 100) -> int:
    json_path = os.path.join(os.path.dirname(__file__), 'data', json_filename)
    
    if not os.path.exists(json_path):
        raise FileNotFoundError(f"Plik {json_filename} nie został znaleziony.")

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
                print(f"Zaimportowano {len(batch)} pojazdów.")
                imported_count += len(batch)
                batch.clear()  

        return imported_count
    except Exception as e:
        db.rollback()
        print(f"Błąd podczas importu: {e}")
        raise

def delete_old_vehicle_statuses(session):
    today = datetime.now(timezone.utc).date()
    session.query(VehiclesStatus).filter(VehiclesStatus.last_updated < today).delete()
    session.commit()

def update_vehicles_status(session, vehicles_data):
    delete_old_vehicle_statuses(session) 

    for vehicle in vehicles_data:
        vehicle_status = session.query(VehiclesStatus).filter_by(vehicle_id=vehicle["vehicle_id"]).first()
        current_time = datetime.fromtimestamp(vehicle['timestamp'])
        print(current_time)
        if vehicle_status:
            vehicle_status.schedule_number = vehicle["schedule_number"]
            vehicle_status.latitude = vehicle["latitude"]
            vehicle_status.longitude = vehicle["longitude"]
            vehicle_status.last_updated = current_time
        else:
            new_status = VehiclesStatus(
                vehicle_id=vehicle["vehicle_id"],
                schedule_number=vehicle["schedule_number"],
                latitude=vehicle["latitude"],
                longitude=vehicle["longitude"],
                last_updated=current_time,
            )
            session.add(new_status)

    session.commit()
