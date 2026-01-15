import { useState, useEffect } from 'react';
import { GroupedTimelineEvent, TimelineEvent } from '../types/timeline';
import { Calendar, Activity, Stethoscope, FileText, AlertCircle, ChevronDown, ChevronRight } from 'lucide-react';

interface TimelineProps {
  parents: GroupedTimelineEvent[];
  standalone: TimelineEvent[];
}

const getEventIcon = (type: TimelineEvent['type']) => {
  switch (type) {
    case 'surgery':
      return <Stethoscope className="w-5 h-5 text-red-600" />;
    case 'emergency_room':
      return <AlertCircle className="w-5 h-5 text-orange-600" />;
    case 'imaging':
      return <FileText className="w-5 h-5 text-blue-500" />;
    case 'vitals':
      return <Activity className="w-5 h-5 text-green-600" />;
    case 'admission':
      return <Calendar className="w-5 h-5 text-gray-600" />;
    default:
      return <Calendar className="w-5 h-5 text-gray-500" />;
  }
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
};

const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
};

// Render a child event (Vitals or Imaging)
const ChildEventCard = ({ event }: { event: TimelineEvent }) => {
  return (
    <div className="ml-8 mb-2 p-3 bg-white rounded border border-gray-200 shadow-sm">
      <div className="flex items-center gap-2 mb-1">
        {getEventIcon(event.type)}
        <span className="font-medium text-sm capitalize">{event.type}</span>
        <span className="text-xs text-gray-500">{formatTime(event.timestamp)}</span>
      </div>

      {event.type === 'imaging' && (
        <div className="text-sm space-y-1">
          {event.data.modality && (
            <p>
              <span className="font-medium text-blue-600">Modality:</span>{' '}
              <span className="text-blue-500">{event.data.modality}</span>
            </p>
          )}
          {event.data.radiologistNote && (
            <p className="text-blue-500">{event.data.radiologistNote}</p>
          )}
        </div>
      )}

      {event.type === 'vitals' && (
        <div className="text-sm space-y-1">
          {event.data.bpm !== undefined && (
            <p className="text-green-600">
              <span className="font-medium">BPM:</span> {event.data.bpm}
            </p>
          )}
          {event.data.bp && (
            <p className="text-green-600">
              <span className="font-medium">BP:</span> {event.data.bp}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

// Render a parent event (Surgery or Emergency Room) with its children
const ParentEventCard = ({ 
  parent, 
  isExpanded, 
  onToggle 
}: { 
  parent: GroupedTimelineEvent;
  isExpanded: boolean;
  onToggle: () => void;
}) => {
  const isSurgery = parent.type === 'surgery';
  const isEmergencyRoom = parent.type === 'emergency_room';
  
  // Color scheme: Surgery (Red bg), Emergency Room (Orange bg)
  const bgColor = isEmergencyRoom ? 'bg-orange-50' : 'bg-red-50';
  const borderColor = isEmergencyRoom ? 'border-orange-500' : 'border-red-500';
  const textColor = isEmergencyRoom ? 'text-orange-700' : 'text-red-700';
  
  const hasChildren = parent.children && parent.children.length > 0;

  return (
    <div className={`mb-4 p-4 rounded-lg border-2 ${borderColor} ${bgColor} shadow-md`}>
      {/* Parent Header - Clickable if has children */}
      <div 
        className={`flex items-center justify-between mb-3 ${hasChildren ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
        onClick={hasChildren ? onToggle : undefined}
      >
        <div className="flex items-center gap-2">
          {hasChildren && (
            <div className="flex items-center justify-center w-6 h-6">
              {isExpanded ? (
                <ChevronDown className="w-5 h-5 text-gray-600" />
              ) : (
                <ChevronRight className="w-5 h-5 text-gray-600" />
              )}
            </div>
          )}
          {!hasChildren && <div className="w-6" />} {/* Spacer for alignment */}
          {getEventIcon(parent.type)}
          <span className={`font-bold text-lg capitalize ${textColor}`}>
            {parent.type}
          </span>
          {parent.flag === 'post-discharge' && (
            <span className="flex items-center gap-1 text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded">
              <AlertCircle className="w-3 h-3" />
              Post-Discharge
            </span>
          )}
          {hasChildren && (
            <span className="text-xs text-gray-500 font-normal">
              ({parent.children?.length} {parent.children?.length === 1 ? 'event' : 'events'})
            </span>
          )}
        </div>
        <div className="text-sm text-gray-600">
          {parent.start && parent.end ? (
            <span>
              {formatDate(parent.start)} - {formatTime(parent.end)}
            </span>
          ) : (
            <span>{formatDate(parent.timestamp)}</span>
          )}
        </div>
      </div>

      {/* Parent Details */}
      <div className={`mb-3 text-sm ${textColor}`}>
        {isSurgery && (
          <>
            {parent.data.procedure && (
              <p>
                <span className="font-medium">Procedure:</span>{' '}
                {parent.data.procedure}
              </p>
            )}
            {parent.data.surgeonName && (
              <p>
                <span className="font-medium">Surgeon:</span>{' '}
                {parent.data.surgeonName}
              </p>
            )}
          </>
        )}

        {isEmergencyRoom && (
          <>
            {parent.data.chiefComplaint && (
              <p>
                <span className="font-medium">Chief Complaint:</span>{' '}
                {parent.data.chiefComplaint}
              </p>
            )}
            {parent.data.attendingPhysician && (
              <p>
                <span className="font-medium">Attending Physician:</span>{' '}
                {parent.data.attendingPhysician}
              </p>
            )}
          </>
        )}

      </div>

      {/* Children Container - Only show if expanded */}
      {hasChildren && isExpanded && (
        <div className="mt-4 pt-3 border-t border-gray-300">
          <h4 className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
            Events During {parent.type}
          </h4>
          <div className="space-y-2">
            {parent.children.map((child) => (
              <ChildEventCard key={child.id} event={child} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Render a standalone event (no parent)
const StandaloneEventCard = ({ event }: { event: TimelineEvent }) => {
  return (
    <div className="mb-4 p-4 bg-white rounded-lg border-2 border-gray-300 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {getEventIcon(event.type)}
          <span className="font-semibold text-lg capitalize">{event.type}</span>
          {event.flag === 'post-discharge' && (
            <span className="flex items-center gap-1 text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded">
              <AlertCircle className="w-3 h-3" />
              Post-Discharge
            </span>
          )}
        </div>
        <span className="text-sm text-gray-600">{formatDate(event.timestamp)}</span>
      </div>

      <div className="space-y-1 text-sm">
        {event.type === 'imaging' && (
          <>
            {event.data.modality && (
              <p>
                <span className="font-medium text-blue-600">Modality:</span>{' '}
                <span className="text-blue-500">{event.data.modality}</span>
              </p>
            )}
            {event.data.radiologistNote && (
              <p className="text-blue-500">{event.data.radiologistNote}</p>
            )}
          </>
        )}

        {event.type === 'vitals' && (
          <>
            {event.data.bpm !== undefined && (
              <p className="text-green-600">
                <span className="font-medium">BPM:</span> {event.data.bpm}
              </p>
            )}
            {event.data.bp && (
              <p className="text-green-600">
                <span className="font-medium">BP:</span> {event.data.bp}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export const Timeline = ({ parents, standalone }: TimelineProps) => {
  // Track which parent events are expanded (default: all expanded)
  const [expandedIds, setExpandedIds] = useState<Set<string>>(
    new Set(parents.map(p => p.id))
  );

  // Update expanded state when parents change (keep existing expanded state if parent still exists)
  useEffect(() => {
    setExpandedIds(prev => {
      const newSet = new Set<string>();
      // Keep previously expanded items if they still exist in new parents
      parents.forEach(parent => {
        if (prev.has(parent.id)) {
          newSet.add(parent.id);
        } else {
          // Default to expanded for new parents
          newSet.add(parent.id);
        }
      });
      return newSet;
    });
  }, [parents]);

  const hasNoEvents = parents.length === 0;

  if (hasNoEvents) {
    return (
      <div className="text-center py-12 text-gray-500">
        No events found for the selected criteria.
      </div>
    );
  }

  // Toggle expansion for a specific parent
  const toggleExpanded = (parentId: string) => {
    setExpandedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(parentId)) {
        newSet.delete(parentId);
      } else {
        newSet.add(parentId);
      }
      return newSet;
    });
  };

  // Separate surgeries and emergency rooms
  const surgeries = parents.filter((p) => p.type === 'surgery');
  const emergencyRooms = parents.filter((p) => p.type === 'emergency_room');

  // Sort all by start time - latest to earliest
  const sortedSurgeries = [...surgeries].sort(
    (a, b) => new Date(b.start || b.timestamp).getTime() - new Date(a.start || a.timestamp).getTime()
  );
  const sortedEmergencyRooms = [...emergencyRooms].sort(
    (a, b) => new Date(b.start || b.timestamp).getTime() - new Date(a.start || a.timestamp).getTime()
  );

  // Combine and sort all parents
  const allParents = [...sortedSurgeries, ...sortedEmergencyRooms].sort(
    (a, b) => {
      const aTime = a.start ? new Date(a.start).getTime() : new Date(a.timestamp).getTime();
      const bTime = b.start ? new Date(b.start).getTime() : new Date(b.timestamp).getTime();
      return bTime - aTime; // Latest first
    }
  );

  return (
    <div className="space-y-4">
      {/* Render all parents (surgeries and emergency rooms) */}
      {allParents.map((parent) => (
        <ParentEventCard 
          key={parent.id} 
          parent={parent}
          isExpanded={expandedIds.has(parent.id)}
          onToggle={() => toggleExpanded(parent.id)}
        />
      ))}
    </div>
  );
};
