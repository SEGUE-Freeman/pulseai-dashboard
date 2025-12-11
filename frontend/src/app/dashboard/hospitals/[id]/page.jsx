'use client';
import HospitalForm from '../../../../components/hospital/HospitalForm';
import CapacityEditor from '../../../../components/hospital/CapacityEditor';
import AuditTrail from '../../../../components/hospital/AuditTrail';

export default function HospitalDetail({ params }) {
  const id = params.id;
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <HospitalForm hospitalId={id} />
        <CapacityEditor hospitalId={id} />
      </div>
      <aside className="space-y-6">
        <AuditTrail hospitalId={id} />
      </aside>
    </div>
  );
}
