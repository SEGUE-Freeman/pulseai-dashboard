'use client';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect, useState } from 'react';
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({ iconRetinaUrl:'/leaflet/marker-icon-2x.png', iconUrl:'/leaflet/marker-icon.png', shadowUrl:'/leaflet/marker-shadow.png' });

export default function MapPicker({ lat=6.13, lon=1.21, onSelect }) {
  const [pos, setPos] = useState([lat, lon]);
  useEffect(()=> setPos([lat, lon]), [lat, lon]);
  return (
    <div style={{height: 300}}>
      <MapContainer center={pos} zoom={12} style={{height:'100%', width:'100%'}} whenCreated={map => map.on('click', (e)=> { setPos([e.latlng.lat, e.latlng.lng]); onSelect && onSelect(e.latlng); })}>
        <TileLayer attribution="&copy; OpenStreetMap" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker position={pos} />
      </MapContainer>
    </div>
  );
}
