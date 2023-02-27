import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Map, { convertDevice } from '../components/Map';

convertDevice({ id: 'abc', connected: false, lat: 12, lng: 10 });

export default function HomePage() {
  const [selectedId, SetSelectedId] = useState('');

  useEffect(() => console.log(selectedId), [selectedId]);

  return (
    <div className="flex-grow p-4">
      <div className="grid h-full grid-cols-5">
        <div className="col-span-2">This is where all sensors are display</div>
        <div className="col-span-3 h-full rounded-md border">
          <Map
            selectedId={selectedId}
            setSelectedId={SetSelectedId}
            data={[
              {
                id: 'sensor-005',
                connected: true,
                lat: 10.478189,
                lng: 106.839396,
              },
            ].map((el) =>
              convertDevice({
                id: el.id,
                connected: el.connected,
                lat: el.lat,
                lng: el.lng,
              })
            )}
          />
        </div>
      </div>
    </div>
  );
}
