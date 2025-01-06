import json
import os
from sqlalchemy.orm import Session
from .models import Vehicle

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

