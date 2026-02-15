# Medical Timeline Backend

A backend service that aggregates medical events from multiple data sources into a unified, role-aware patient timeline.
The system is designed to be resilient, asynchronous, and easy to extend, while clearly separating business logic from
infrastructure concerns.

## Setup Instructions – Run Locally

### Prerequisites

- Python 3.10+

### Clone & Install Dependencies

git clone <repository-url>
cd Federated-Patient-Timeline-System/backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

### Run the API
The api will load with the front while executing start.sh

If you want to run the api manually execute: 
uvicorn main:app --reload --port 3000 .
API base URL: http://localhost:3000, Swagger UI: http://localhost:8000/docs

## Architecture Decisions

Layered Architecture: Routes → Services → Adapters → Data Sources. Routes handle HTTP and validation, services contain
business logic, adapters abstract external systems, and data sources are replaceable and isolated. Adapter Pattern: Each
external system (PostgreSQL, MongoDB, HTTP service) is wrapped in a dedicated adapter. This allows the service layer to
remain database-agnostic, enables easy mocking, and isolates infrastructure from business logic. Asynchronous &
Concurrent Fetching: Data from all sources is fetched concurrently using asyncio.gather to reduce latency, avoid
blocking, and improve scalability. Graceful Degradation: If one data source fails, the system still returns available
data from other sources, marking partial: true and returning HTTP status 206 Partial Content.

## Features Implemented

- Unified medical timeline
- Parallel data fetching from multiple sources
- Time-based parent/child event grouping
- Role-Based Access Control (RBAC)
- Partial failure handling
- OpenAPI / Swagger documentation

## API Documentation

### Endpoint

GET /api/timeline

### Query Parameters

patientId | int
from | datetime
to | datetime

### Headers

X-User-Role: doctor | nurse | intern

### Example Request

GET /api/timeline?patientId=1&from=2024-01-01T00:00:00&to=2024-02-01T00:00:00, X-User-Role: nurse

### Example Response

"parents": [
{
"id": "3",
"type": "surgery",
"source": "registry",
"timestamp": "2024-01-17T09:00:00",
"patientId": 1,
"data": {
"surgeonName": "Dr. Robert Taylor",
"procedure": "Hernia Repair"
},
"start": "2024-01-17T09:00:00",
"end": "2024-01-17T11:00:00",
"children": [
{
"id": "1705474800.0",
"type": "vitals",
"source": "vitals",
"timestamp": "2024-01-17T09:00:00",
"patientId": 1,
"data": {
"bpm": 71,
"bp": "119/79"
}
}
]
}
],
"standalone": [],
"partial": false
}

## Algorithm Explanation – Event Grouping Logic

Grouping Rules:

1) Registry events act as parent events.
2) PACS and Vitals events act as child events.
3) A child event is attached to a parent if its timestamp falls within the parent’s time range.
4) If multiple parents match, the child is attached to the most recently started parent.
5) If no parent matches, the event becomes standalone.
6) Example: Surgery A: 08:00–10:00, Surgery B: 09:30–11:00, Imaging: 09:45. The imaging event is attached to Surgery B,
   as it started later and is contextually relevant.

## Error Handling

Partial Failures: Data sources are fetched with asyncio.gather(return_exceptions=True). Failed sources do not fail the
request. Response includes partial: true and HTTP status 206. Validation Errors: Invalid time range → 400 Bad Request.
Missing or invalid parameters → 422 Unprocessable Entity. Unexpected Errors: Logged server-side and returned as 500
Internal Server Error.

## Known Limitations

- organize better the main logic code any try to optimize (first thing I was doing, in addition to what I already have)
- No caching (second thing I was doing, in addition to what I already have)
- No retries or circuit breakers
- No logging
- no not returning warnings in response
- understand the __init__.py thing in packages and add if needed
###### These were intentionally excluded due to time constraints.