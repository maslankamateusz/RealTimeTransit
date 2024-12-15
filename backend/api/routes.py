from fastapi import APIRouter, Depends
from ..services.gtfs_data_loader import load_gtfs_data

router = APIRouter()

class GTFSData:
    def __init__(self):
        self.data = load_gtfs_data()

    def get_data(self):
        return self.data

def get_gtfs_data() -> GTFSData:
    return GTFSData()

@router.get("/get_gtfs_data")
async def get_gtfs_data(gtfs: GTFSData = Depends(get_gtfs_data)):
    data = gtfs.get_data()
    stops_df = data.get('trips_t')
    print(stops_df)
    json_data = stops_df.to_json(orient='records', force_ascii=False)
    return json_data


def configure_routes(app):
    app.include_router(router)
