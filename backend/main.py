import os
from typing import Union

from fastapi import FastAPI
from services.gtfs_data_loader import load_gtfs_data

app = FastAPI()


@app.get("/")
def main_page():
    extracted_path = os.path.join(os.path.dirname(__file__), 'services', 'gtfs_data')
    load_gtfs_data(extracted_path)
    return {"Hello": "World"}

