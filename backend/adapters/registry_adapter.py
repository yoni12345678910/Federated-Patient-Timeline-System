from datetime import datetime
from typing import List

import databases
from asyncpg import Record

from models.timeline import TimelineEvent, EventType, DataSource


class RegistryAdapter:
    def __init__(self):
        self.database: databases.Database = databases.Database(
            "postgresql://postgres:postgres@postgres:5432/registry?connect_timeout=5")

    async def fetch_events(self, patient_id: int, start_time: datetime, end_time: datetime) -> List[TimelineEvent]:
        try:
            await self.database.connect()
            rows: List[Record] = await self.database.fetch_all(
                query=self._build_query(),
                values={"p_id": patient_id, "st_time": start_time, "en_time": end_time}
            )

            return self._map_rows_to_events(rows, patient_id)
        except Exception as e:
            await self.database.disconnect()
            print(f"Error fetching from Postgres: {e}")
            raise ConnectionError("Failed to fetch data from Postgres")
        finally:
            await self.database.disconnect()

    @staticmethod
    def _build_query() -> str:
        return """
               SELECT id,
                      'surgery'    as type,
                      start_time,
                      end_time,
                      surgeon_name as first_extra_field, procedure as second_extra_field
               FROM surgeries
               WHERE patient_id = :p_id AND start_time BETWEEN :st_time AND :en_time
               UNION ALL
               SELECT id,
                      'emergency_room'    as type,
                      start_time,
                      end_time,
                      attending_physician as first_extra_field,
                      chief_complaint     as second_extra_field
               FROM emergency_rooms
               WHERE patient_id = :p_id
                 AND start_time BETWEEN :st_time AND :en_time
               """

    def _map_rows_to_events(self, rows: List[Record], patient_id: int) -> List[TimelineEvent]:
        events: List[TimelineEvent] = []
        for row in rows:
            event_type: EventType = EventType(row['type'])
            event_data: dict[str, str] = self._map_event_type(row, event_type)
            events.append(TimelineEvent(
                id=str(row['id']),
                type=event_type,
                source=DataSource.REGISTRY,
                timestamp=row['start_time'],
                patientId=patient_id,
                start=row['start_time'],
                end=row['end_time'],
                data=event_data
            ))

        return events

    @staticmethod
    def _map_event_type(row: Record, event_type: EventType) -> dict[str, str]:
        if event_type == EventType.SURGERY:
            return {
                "surgeonName": row['first_extra_field'],
                "procedure": row['second_extra_field']
            }
        else:
            return {
                "attendingPhysician": row['first_extra_field'],
                "chiefComplaint": row['second_extra_field']
            }
