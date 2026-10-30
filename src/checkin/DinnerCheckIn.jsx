import StaffGate from '../components/StaffGate'
import ScanStation from './ScanStation'

export default function DinnerCheckIn() {
  return (
    <StaffGate
      allowedRoles={['admin', 'dinner']}
      icon="🍽️"
      title="Dinner Check-in"
      subtitle="VIGAM 2026 Dinner Stall"
      buttonLabel="Open Dinner Gate →"
    >
      <ScanStation station="dinner" />
    </StaffGate>
  )
}
