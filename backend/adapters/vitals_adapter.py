from datetime import datetime
from typing import List

import httpx
from httpx import Response

from models.timeline import TimelineEvent, EventType, DataSource


class VitalsAdapter:
    def __init__(self):
        self.base_url: str = "http://mock-vitals:3001/vitals"

    async def fetch_events(self, patient_id: int, start_time: datetime, end_time: datetime) -> List[TimelineEvent]:
        url: str = f"{self.base_url}/{patient_id}"

        try:
            async with httpx.AsyncClient() as client:
                response: Response = await client.get(url, timeout=5.0)
                response.raise_for_status()

                data: list[dict] = response.json()

                events: List[TimelineEvent] = []
                for item in data:
                    timestamp_utc: datetime = datetime.fromisoformat(item["timestamp"].replace("Z", "+00:00"))
                    timestamp_naive: datetime = timestamp_utc.replace(tzinfo=None)

                    if start_time <= timestamp_naive <= end_time:
                        events.append(TimelineEvent(
                            id=str(timestamp_naive.timestamp()),
                            type=EventType.VITALS,
                            source=DataSource.VITALS,
                            timestamp=timestamp_naive,
                            patientId=patient_id,
                            data={
                                "bpm": item.get("bpm"),
                                "bp": item.get("bp")
                            }
                        ))

                return events

        except Exception as e:
            print(f"Error fetching Vitals: {e}")
            raise ConnectionError(f"Error fetching Vitals: {e}")
