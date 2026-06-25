import { useEffect, useState } from 'react';
import axios from 'axios';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';

export default function Prescription() {
  const [prescriptions, setPrescriptions] = useState([]);

  useEffect(() => {
    axios.get('/api/prescriptions').then((response) => setPrescriptions(response.data)).catch(console.error);
  }, []);

  return (
    <div className="space-y-6">
      <Card>
        <h2 className="text-2xl font-semibold">Digital prescriptions</h2>
        <p className="mt-2 text-slate-600">Review all prescriptions issued for your appointments.</p>
      </Card>
      <div className="grid gap-6">
        {prescriptions.length === 0 ? (
          <div className="rounded-3xl bg-slate-50 p-8 text-slate-600">No prescriptions available yet.</div>
        ) : prescriptions.map((prescription) => (
          <Card key={prescription._id} className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold">Prescription from {prescription.doctor?.name || 'Doctor'}</h3>
                <p className="text-slate-600">Appointment ID: {prescription.appointment?._id || 'N/A'}</p>
              </div>
              <Badge tone="indigo">Issued</Badge>
            </div>
            <div className="mt-5 space-y-3">
              {prescription.medicines.map((item, index) => (
                <div key={index} className="rounded-2xl bg-slate-50 p-4">
                  <p className="font-medium">{item.name}</p>
                  <p className="text-slate-600">{item.dosage} · {item.frequency}</p>
                </div>
              ))}
            </div>
            <p className="mt-4 text-slate-600">Notes: {prescription.notes || 'No additional notes.'}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
