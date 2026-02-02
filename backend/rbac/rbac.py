from typing import List

from models.enums.event_type import EventType


def filter_by_role(data: dict, role: str) -> dict:
    """
        Filters a TimelineResponse based on the user's role.

        Rules:
        - doctor: full access
        - nurse: no surgeries
        - intern: no imaging
        """

    if role == 'doctor':
        return data

    filtered_parents: List[dict] = []

    for parent in data['parents']:
        if role == 'nurse' and parent['type'] == EventType.SURGERY:
            continue

        new_children: List[dict] = [
            child for child in parent.get('children', [])
            if is_event_allowed_for_role(child, role)
        ]

        parent['children'] = new_children
        filtered_parents.append(parent)

    filtered_standalone: List[dict] = [
        event for event in data.get('standalone', [])
        if is_event_allowed_for_role(event, role)
    ]

    return {
        "parents": filtered_parents,
        "standalone": filtered_standalone,
        "partial": data.get('partial', False)
    }


def is_event_allowed_for_role(event: dict, role: str) -> bool:
    event_type: str = event.get('type')
    lower_role: str = role.lower()

    return not ((lower_role == 'nurse' and event_type == EventType.SURGERY) or
                (lower_role == 'intern' and event_type == EventType.IMAGING))
