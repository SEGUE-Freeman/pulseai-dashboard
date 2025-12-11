'use client';
import { useState } from 'react';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { updateCapacity } from '../../lib/api';

export default function CapacityEditor({ hospitalId }) {
  const [bedsTotal, setBedsTotal] = useState('');
  const [bedsAvailable, setBedsAvailable] = useState('');
  const [doctorsCount, setDoctorsCount] = useState('');
  async function submit(e){
    e.preventDefault();
    const payload = { hospital_id: Number(hospitalId), beds_total: Number(bedsTotal||0), beds_available: Number(bedsAvailable||0), doctors_count: Number(doctorsCount||0), source:'dashboard' };
    const res = await updateCapacity(payload);
    if (res.update_id) alert('Mise à jour enregistrée');
    else alert('Erreur');
  }
  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        <Input value={bedsTotal} onChange={e=>setBedsTotal(e.target.value)} placeholder="Lits total" type="number"/>
        <Input value={bedsAvailable} onChange={e=>setBedsAvailable(e.target.value)} placeholder="Lits dispo" type="number"/>
        <Input value={doctorsCount} onChange={e=>setDoctorsCount(e.target.value)} placeholder="Médecins" type="number"/>
      </div>
      <Button>Publier</Button>
    </form>
  );
}
