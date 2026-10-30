import StaffGate from '../components/StaffGate'
import ScanStation from './ScanStation'

export default function CheckIn() {
  return (
    <StaffGate
      allowedRoles={['admin', 'gate']}
      icon="🚪"
      title="Gate Access"
      subtitle="VIGAM 2026 Entry System"
      buttonLabel="Open The Gates →"
    >
      <ScanStation station="gate" />
    </StaffGate>
  )
}
