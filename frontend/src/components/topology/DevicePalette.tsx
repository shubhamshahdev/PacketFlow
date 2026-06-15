import { useDraggable } from '@dnd-kit/core';
import { DeviceType } from '@/types';
import { Server, Monitor, Wifi, Router, Shield, Printer } from 'lucide-react';

const deviceTypes = [
  { type: DeviceType.ROUTER, label: 'Router', icon: Router, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30' },
  { type: DeviceType.SWITCH, label: 'Switch', icon: Server, color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/30' },
  { type: DeviceType.PC, label: 'PC', icon: Monitor, color: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-900/30' },
  { type: DeviceType.SERVER, label: 'Server', icon: Server, color: 'text-orange-600', bg: 'bg-orange-100 dark:bg-orange-900/30' },
  { type: DeviceType.FIREWALL, label: 'Firewall', icon: Shield, color: 'text-red-600', bg: 'bg-red-100 dark:bg-red-900/30' },
  { type: DeviceType.WIRELESS_AP, label: 'WiFi AP', icon: Wifi, color: 'text-teal-600', bg: 'bg-teal-100 dark:bg-teal-900/30' },
  { type: DeviceType.LAPTOP, label: 'Laptop', icon: Monitor, color: 'text-indigo-600', bg: 'bg-indigo-100 dark:bg-indigo-900/30' },
  { type: DeviceType.PRINTER, label: 'Printer', icon: Printer, color: 'text-gray-600', bg: 'bg-gray-100 dark:bg-gray-700' },
];

function DraggableDevice({ type, label, icon: Icon, color, bg }: { type: DeviceType; label: string; icon: React.ElementType; color: string; bg: string }) {
  const { attributes, listeners, setNodeRef } = useDraggable({
    id: `palette-${type}`,
    data: { type, label },
  });

  const style = transform ? {
    transform: `translate(${transform.x}px, ${transform.y}px)`,
    opacity: isDragging ? 0.5 : 1,
  } : undefined;

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={style}
      className={`flex items-center gap-2 p-2 rounded-lg cursor-grab active:cursor-grabbing hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${isDragging ? 'opacity-50' : ''}`}
    >
      <div className={`p-1.5 rounded-md ${bg}`}>
        <Icon className={`w-4 h-4 ${color}`} />
      </div>
      <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
    </div>
  );
}

export default function DevicePalette() {
  return (
    <div className="card p-3">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">Devices</h3>
      <div className="space-y-0.5">
        {deviceTypes.map((d) => (
          <DraggableDevice key={d.type} {...d} />
        ))}
      </div>
    </div>
  );
}
