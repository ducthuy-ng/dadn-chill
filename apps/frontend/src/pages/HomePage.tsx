import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
    <div className="flex-grow p-4">
      <div className="grid h-full grid-cols-5">
        <div className="col-span-2">This is where all sensors are display</div>
        <div className="col-span-3 h-full rounded-md border">
          This is where the map locate
        </div>
      </div>
    </div>
  );
}
