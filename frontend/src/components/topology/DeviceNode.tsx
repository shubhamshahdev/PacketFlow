import { memo } from 'react';
import Draggable from 'react-draggable';
import { Device, DeviceType } from '@/types';
import { Router, Server, Monitor, Shield, Wifi, Printer } from 'lucide-react';

const deviceIcons: Record<DeviceType, React.ElementType> = {
  [DeviceType.ROUTER]: Router,
  [DeviceType.SWITCH]: Server,
  [DeviceType.PC]: Monitor,
  [DeviceType.SERVER]: Server,
  [DeviceType.FIREWALL]: Shield,
  [DeviceType.WIRELESS_AP]: Wifi,
  [DeviceType.LAPTOP]: Monitor,
  [DeviceType.PRINTER]: Printer,
};

const deviceColors: Record<DeviceType, string> = {
  [DeviceType.ROUTER]: 'text-blue-600 bg-blue-100 dark:bg-blue-900/40 border-blue-300 dark:border-blue-700',
  [DeviceType.SWITCH]: 'text-green-600 bg-green-100 dark:bg-green-900/40 border-green-300 dark:border-green-700',
  [DeviceType.PC]: 'text-purple-600 bg-purple-100 dark:bg-purple-900/40 border-purple-300 dark:border-purple-700',
  [DeviceType.SERVER]: 'text-orange-600 bg-orange-100 dark:bg-orange-900/40 border-orange-300 dark:border-orange-700',
  [DeviceType.FIREWALL]: 'text-red-600 bg-red-100 dark:bg-red-900/40 border-red-300 dark:border-red-700',
  [DeviceType.WIRELESS_AP]: 'text-teal-600 bg-teal-100 dark:bg-teal-900/40 border-teal-300 dark:border-teal-700',
  [DeviceType.LAPTOP]: 'text-indigo-600 bg-indigo-100 dark:bg-indigo-900/40 border-indigo-300 dark:border-indigo-700',
  [DeviceType.PRINTER]: 'text-gray-600 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600',
};

interface DeviceNodeProps {
  device: Device;
  onDragStop: (deviceId: string, position: { x: number; y: number }) => void;
  onClick: (deviceId: string) => void;
  onStartConnect: (deviceId: string, iface: string) => void;
  isConnecting: boolean;
}

const DeviceNode = memo(function DeviceNode({ device, onDragStop, onClick, onStartConnect, isConnecting }: DeviceNodeProps) {
  const Icon = deviceIcons[device.type] || Monitor;
  const colorClasses = deviceColors[device.type] || deviceColors[DeviceType.PC];
  const isOnline = device.status === 'ONLINE';
  const hasIp = device.config.interfaces[0]?.ipAddress;

  return (
    <Draggable
      position={{ x: device.position.x, y: device.position.y }}
      onStop={(_, data) => onDragStop(device.id, { x: data.x, y: data.y })}
      bounds="parent"
      handle=".drag-handle"
    >
      <div
        className={`absolute cursor-pointer group ${isConnecting ? 'ring-2 ring-blue-500' : ''}`}
        style={{ width: 80 }}
        onClick={() => onClick(device.id)}
      >
        <div className={`drag-handle ${colorClasses} border-2 rounded-xl p-2 text-center transition-shadow hover:shadow-lg`}>
          <div className="flex justify-center mb-1">
            <Icon className="w-6 h-6" />
          </div>
          <p className="text-[10px] font-semibold truncate text-gray-800 dark:text-gray-200">{device.name}</p>
        </div>

        {hasIp && (
          <p className="text-[9px] text-gray-500 dark:text-gray-400 text-center mt-0.5 truncate">{hasIp}</p>
        )}

        <div className="absolute -top-1 -right-1">
          <div className={`w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'} ring-2 ring-white dark:ring-gray-800`} />
        </div>

        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
          {device.config.interfaces.slice(0, 2).map((iface) => (
            <button
              key={iface.id}
              onClick={(e) => { e.stopPropagation(); onStartConnect(device.id, iface.name); }}
              className="w-3 h-3 rounded-full bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center text-[8px]"
              title={`Connect from ${iface.name}`}
            >
              +
            </button>
          ))}
        </div>
      </div>
    </Draggable>
  );
});

export default DeviceNode;
