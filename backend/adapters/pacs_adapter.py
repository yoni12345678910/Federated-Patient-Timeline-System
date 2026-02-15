from datetime import datetime
from typing import List

from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorCollection, AsyncIOMotorDatabase, AsyncIOMotorCursor

from models.timeline import TimelineEvent, EventType, DataSource


class PacsAdapter:
    def __init__(self):
        self.client: AsyncIOMotorClient = AsyncIOMotorClient("mongodb://mongodb:27017", socketTimeoutMS=10000)
        self.db: AsyncIOMotorDatabase = self.client["pacs"]
        self.collection: AsyncIOMotorCollection = self.db["imaging"]

    async def fetch_events(self, patient_id: int, start_time: datetime, end_time: datetime) -> List[TimelineEvent]:
        query: dict = {
            "patientId": patient_id,
            "timestamp": {
                "$gte": start_time,
                "$lte": end_time
            }
        }

        events: List[TimelineEvent] = []
        try:
            cursor: AsyncIOMotorCursor = self.collection.find(query)
            async for doc in cursor:
                events.append(TimelineEvent(
                    id=str(doc['_id']),
                    type=EventType.IMAGING,
                    source=DataSource.PACS,
                    timestamp=doc["timestamp"],
                    patientId=patient_id,
                    data={
                        "modality": doc.get("modality"),
                        "radiologistNote": doc.get("radiologistNote")
                    }
                ))

            return events
        except Exception as e:
            print(f"Error fetching pacs from mongo db: {e}")
            raise ConnectionError("Failed to fetch pacs mongo db")
