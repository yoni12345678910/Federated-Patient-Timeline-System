from datetime import datetime
from typing import Annotated

from fastapi import Query, HTTPException, Header, Response, APIRouter
from starlette import status

from exceptions.invalid_time_range_exception import InvalidTimeRangeException
from services.timeline_service import TimelineService

timeline_service = TimelineService()

router = APIRouter(prefix="/api", tags=["Timeline"])


@router.get(
    "/timeline",
    status_code=status.HTTP_200_OK,
    responses={
        200: {"description": "Full data retrieved successfully"},
        206: {"description": "Partial content - one or more services are down"},
        400: {"description": "Bad request"},
        500: {"description": "Internal server error"},
    },
    summary="Get patient medical timeline",
    description="Returns a filtered medical timeline based on user role",
)
async def get_timeline(
        response: Response,
        patient_id: Annotated[int, Query(gt=0, alias="patientId")],
        from_date: Annotated[datetime, Query(alias="from")],
        to_date: Annotated[datetime, Query(alias="to")],
        x_user_role: Annotated[str, Header(alias="X-User-Role")]
):
    try:
        patient_timeline: dict = await timeline_service.get_patient_timeline(patient_id,
                                                                             from_date,
                                                                             to_date,
                                                                             x_user_role.lower())

        if patient_timeline.get("partial"):
            response.status_code = status.HTTP_206_PARTIAL_CONTENT

        return patient_timeline

    except InvalidTimeRangeException as invalid_time_range_exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=invalid_time_range_exception.message)

    except Exception as e:
        print('An error occurred in server: {}'.format(e))
        raise HTTPException(status_code=500, detail="Error occurred in server, please contact Eden")
