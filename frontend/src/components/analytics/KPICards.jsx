export default function KPICards(){
  const items = [
    {title:'Lits disponibles', value:'12'},
    {title:'Recommandations/jour', value:'34'},
    {title:'Taux acceptance', value:'72%'}
  ];
  return <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">{items.map(i=>(
    <div key={i.title} className="bg-white p-4 rounded shadow">
      <div className="text-sm text-gray-500">{i.title}</div>
      <div className="text-2xl font-semibold">{i.value}</div>
    </div>
  ))}</div>;
}
