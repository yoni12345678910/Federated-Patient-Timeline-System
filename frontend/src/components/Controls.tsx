import { UserRole } from '../types/timeline';

interface ControlsProps {
  selectedPatientId: number;
  onPatientChange: (patientId: number) => void;
  role: UserRole;
  onRoleChange: (role: UserRole) => void;
  fromDate: string;
  onFromDateChange: (date: string) => void;
  toDate: string;
  onToDateChange: (date: string) => void;
  onRefresh: () => void;
}

const patients = [
  { id: 1, name: 'John Doe' },
];

export const Controls = ({
  selectedPatientId,
  onPatientChange,
  role,
  onRoleChange,
  fromDate,
  onFromDateChange,
  toDate,
  onToDateChange,
  onRefresh,
}: ControlsProps) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Patient Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Patient
          </label>
          <select
            value={selectedPatientId}
            onChange={(e) => onPatientChange(Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {patients.map((patient) => (
              <option key={patient.id} value={patient.id}>
                {patient.name}
              </option>
            ))}
          </select>
        </div>

        {/* Role Switcher */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Role
          </label>
          <select
            value={role}
            onChange={(e) => onRoleChange(e.target.value as UserRole)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="doctor">Doctor</option>
            <option value="nurse">Nurse</option>
            <option value="intern">Intern</option>
          </select>
        </div>

        {/* From Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            From Date
          </label>
          <input
            type="datetime-local"
            value={fromDate}
            onChange={(e) => onFromDateChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* To Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            To Date
          </label>
          <input
            type="datetime-local"
            value={toDate}
            onChange={(e) => onToDateChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <div className="mt-4">
        <button
          onClick={onRefresh}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        >
          Refresh Timeline
        </button>
      </div>
    </div>
  );
};
