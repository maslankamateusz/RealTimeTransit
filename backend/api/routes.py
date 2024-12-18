from fastapi import APIRouter, Depends, Query
from ..services.gtfs_data_loader import load_gtfs_data
from ..services.gtfs_processing import get_routes_list, get_stops_list

router = APIRouter()

class GTFSData:
    def __init__(self):
        self.data = load_gtfs_data()

    def get_data(self):
        return self.data

def get_gtfs_data() -> GTFSData:
    return GTFSData()

@router.get("/api/routes")
async def get_routes(gtfs: GTFSData = Depends(get_gtfs_data)):
    data = gtfs.get_data()
    routes = get_routes_list(data)
    return routes

@router.get("/api/stops")
async def get_stops(
    gtfs: GTFSData = Depends(get_gtfs_data),
    route_number: str = Query(..., description="Route number"),
    direction: int = Query(..., description="Direction")
):
    data = gtfs.get_data()
    stops = get_stops_list(data, route_number, direction)
    return stops

def configure_routes(app):
    app.include_router(router)
