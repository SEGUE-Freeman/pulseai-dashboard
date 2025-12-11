'use client';
import Card from '../../../components/ui/Card';
import { useEffect, useState } from 'react';
import { getHospitals } from '../../../lib/api';
import Link from 'next/link';

export default function HospitalsPage(){
  const [hospitals, setHospitals] = useState([]);
  useEffect(()=> {
    async function load(){ const res = await getHospitals(); setHospitals(res || []); }
    load();
  },[]);
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Hôpitaux</h2>
        <Link href="/dashboard/hospitals/new"><a className="bg-pulsegreen text-white px-3 py-1 rounded">Nouveau</a></Link>
      </div>
      <Card>
        <table className="w-full text-left">
          <thead><tr><th>Nom</th><th>Contact</th><th>Actions</th></tr></thead>
          <tbody>
            {hospitals.map(h=>(
              <tr key={h.id} className="border-t">
                <td>{h.name}</td>
                <td>{h.contact_phone || h.contact_email}</td>
                <td><Link href={`/dashboard/hospitals/${h.id}`}><a className="text-pulseblue">Voir</a></Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
