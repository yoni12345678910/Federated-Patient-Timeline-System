import { useState, useEffect, useCallback, useRef } from 'react';
import { Timeline } from './components/Timeline';
import { Controls } from './components/Controls';
import { fetchTimeline } from './services/api';
import { GroupedTimelineEvent, TimelineEvent, UserRole } from './types/timeline';
import toast from 'react-hot-toast';

// Helper function to read URL params
const getUrlParams = () => {
  const params = new URLSearchParams(window.location.search);
  return {
    patientId: params.get('patientId') ? parseInt(params.get('patientId')!) : 1,
    role: (params.get('role') as UserRole) || 'doctor',
    fromDate: params.get('fromDate') || '',
    toDate: params.get('toDate') || '',
  };
};

// Helper function to update URL params
const updateUrlParams = (patientId: number, role: UserRole, fromDate: string, toDate: string) => {
  const params = new URLSearchParams();
  params.set('patientId', patientId.toString());
  params.set('role', role);
  if (fromDate) params.set('fromDate', fromDate);
  if (toDate) params.set('toDate', toDate);
  
  const newUrl = `${window.location.pathname}?${params.toString()}`;
  const currentUrl = window.location.search;
  
  // Only update if URL actually changed
  if (currentUrl !== `?${params.toString()}`) {
    window.history.pushState({}, '', newUrl);
  }
};

function App() {
  // Initialize state from URL params
  const urlParams = getUrlParams();
  const [selectedPatientId, setSelectedPatientId] = useState(urlParams.patientId);
  const [role, setRole] = useState<UserRole>(urlParams.role);
  const [fromDate, setFromDate] = useState(urlParams.fromDate);
  const [toDate, setToDate] = useState(urlParams.toDate);
  const [parents, setParents] = useState<GroupedTimelineEvent[]>([]);
  const [standalone, setStandalone] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [partial, setPartial] = useState(false);
  
  // Track if this is the initial mount to prevent double calls
  const isInitialMount = useRef(true);

  // Update URL params whenever filters change (but skip on initial mount)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    updateUrlParams(selectedPatientId, role, fromDate, toDate);
  }, [selectedPatientId, role, fromDate, toDate]);

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const params = getUrlParams();
      setSelectedPatientId(params.patientId);
      setRole(params.role);
      setFromDate(params.fromDate);
      setToDate(params.toDate);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const loadTimeline = useCallback(async () => {
    setLoading(true);
    try {
      // Properly handle empty date strings - convert to undefined if empty
      const from = fromDate && fromDate.trim() !== '' 
        ? new Date(fromDate).toISOString() 
        : undefined;
      const to = toDate && toDate.trim() !== '' 
        ? new Date(toDate).toISOString() 
        : undefined;

      console.log('Loading timeline with filters:', {
        patientId: selectedPatientId,
        from,
        to,
        role,
      });

      const response = await fetchTimeline(selectedPatientId, from, to, undefined, role);

      setParents(response.parents || []);
      setStandalone(response.standalone || []);
      setPartial(response.partial);

      if (response.partial && response.warning) {
        toast.error(response.warning, {
          icon: '⚠️',
          duration: 5000,
          style: {
            background: '#FEF3C7',
            color: '#92400E',
            border: '1px solid #FCD34D',
          },
        });
      }
    } catch (error) {
      console.error('Error loading timeline:', error);
      toast.error('Failed to load timeline. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [selectedPatientId, role, fromDate, toDate]);

  // Load timeline when filters change - use filter values directly to avoid double calls
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Properly handle empty date strings - convert to undefined if empty
        const from = fromDate && fromDate.trim() !== '' 
          ? new Date(fromDate).toISOString() 
          : undefined;
        const to = toDate && toDate.trim() !== '' 
          ? new Date(toDate).toISOString() 
          : undefined;

        console.log('Loading timeline with filters:', {
          patientId: selectedPatientId,
          from,
          to,
          role,
        });

        const response = await fetchTimeline(selectedPatientId, from, to, undefined, role);

        setParents(response.parents || []);
        setStandalone(response.standalone || []);
        setPartial(response.partial);

        if (response.partial && response.warning) {
          toast.error(response.warning, {
            icon: '⚠️',
            duration: 5000,
            style: {
              background: '#FEF3C7',
              color: '#92400E',
              border: '1px solid #FCD34D',
            },
          });
        }
      } catch (error) {
        console.error('Error loading timeline:', error);
        toast.error('Failed to load timeline. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [selectedPatientId, role, fromDate, toDate]);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Sheebah Patient Timeline
        </h1>

        <Controls
          selectedPatientId={selectedPatientId}
          onPatientChange={setSelectedPatientId}
          role={role}
          onRoleChange={setRole}
          fromDate={fromDate}
          onFromDateChange={setFromDate}
          toDate={toDate}
          onToDateChange={setToDate}
          onRefresh={loadTimeline}
        />

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading timeline...</p>
          </div>
        ) : (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <Timeline parents={parents} standalone={standalone} />
          </div>
        )}

        {partial && (
          <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800 text-sm">
              ⚠️ Partial content: Some services are unavailable. Timeline may be incomplete.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
