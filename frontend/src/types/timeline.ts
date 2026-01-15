export interface TimelineEvent {
  id: string;
  type: 'surgery' | 'imaging' | 'vitals' | 'emergency_room';
  timestamp: string;
  patientId: number;
  data: {
    surgeonName?: string;
    procedure?: string;
    attendingPhysician?: string;
    chiefComplaint?: string;
    modality?: string;
    radiologistNote?: string;
    bpm?: number;
    bp?: string;
  };
  flag?: 'post-discharge';
  source: 'registry' | 'pacs' | 'vitals';
}

export interface GroupedTimelineEvent extends TimelineEvent {
  start?: string;
  end?: string;
  children?: TimelineEvent[];
}

export interface TimelineResponse {
  parents: GroupedTimelineEvent[];
  standalone: TimelineEvent[];
  partial: boolean;
  warning?: string;
}

export type UserRole = 'doctor' | 'nurse' | 'intern';
