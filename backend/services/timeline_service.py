import asyncio
from datetime import datetime
from typing import List

from adapters.pacs_adapter import PacsAdapter
from adapters.registry_adapter import RegistryAdapter
from adapters.vitals_adapter import VitalsAdapter
from exceptions.invalid_time_range_exception import InvalidTimeRangeException
from models.timeline import TimelineEvent
from rbac.rbac import filter_by_role


class TimelineService:
    def __init__(self):
        self.registry_adapter: RegistryAdapter = RegistryAdapter()
        self.pacs_adapter: PacsAdapter = PacsAdapter()
        self.vitals_adapter: VitalsAdapter = VitalsAdapter()

    async def get_patient_timeline(self, patient_id: int, from_date: datetime, to_date: datetime, role: str) -> dict:
        """
            Flow:
            1. glew data from several sources
            2. handle partial failures gracefully
            3. Assign child events to parent events by time overlap
            4. Sort timeline chronologically
        """
        if from_date > to_date:
            raise InvalidTimeRangeException("Start date must be before end date")

        start_date: datetime = from_date.replace(tzinfo=None)
        end_date: datetime = to_date.replace(tzinfo=None)

        partial: bool = False

        tasks = [
            self.registry_adapter.fetch_events(patient_id, start_date, end_date),
            self.pacs_adapter.fetch_events(patient_id, start_date, end_date),
            self.vitals_adapter.fetch_events(patient_id, start_date, end_date)
        ]

        results: tuple = await asyncio.gather(*tasks, return_exceptions=True)

        parents: List[TimelineEvent] = []
        all_children: List[TimelineEvent] = []

        for index, result in enumerate(results):
            if isinstance(result, Exception):
                partial = True
                continue
            if index == 0:
                parents = result
            else:
                all_children.extend(result)

        standalone: List[TimelineEvent] = []

        for parent in parents:
            parent.children = []

        for child in all_children:
            potential_parents: List[TimelineEvent] = [
                parent for parent in parents
                if parent.start <= child.timestamp <= parent.end
            ]

            if not potential_parents:
                standalone.append(child)
            else:
                most_recent_parent  = max(potential_parents, key=lambda parent: parent.start)
                most_recent_parent.children.append(child)

        parents.sort(key=lambda x: x.start, reverse=True)

        for parent in parents:
            parent.children.sort(key=lambda x: x.timestamp)

        data: dict = {
            "parents": [p.model_dump() for p in parents],
            "standalone": [s.model_dump() for s in standalone],
            "partial": partial
        }

        return filter_by_role(data, role)
