import { useAppSelector } from '@/hooks/useAppSelector';
import { DeviceType } from '@/types';
import { Info, Wifi, Shield, Route } from 'lucide-react';

const typeLabels: Record<DeviceType, string> = {
  [DeviceType.ROUTER]: 'Router',
  [DeviceType.SWITCH]: 'Switch',
  [DeviceType.PC]: 'PC',
  [DeviceType.SERVER]: 'Server',
  [DeviceType.FIREWALL]: 'Firewall',
  [DeviceType.WIRELESS_AP]: 'Wireless AP',
  [DeviceType.LAPTOP]: 'Laptop',
  [DeviceType.PRINTER]: 'Printer',
};

export default function DeviceConfigPanel() {
  const { currentTopology } = useAppSelector((state) => state.topology);
  const devices = currentTopology?.devices || [];
  const selectedDevice = devices[0];

  if (!selectedDevice) {
    return (
      <div className="card p-4">
        <div className="text-center py-8 text-gray-400 dark:text-gray-500">
          <Info className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Select a device to configure</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card p-4 space-y-4">
      <div className="flex items-center gap-2 pb-3 border-b border-gray-200 dark:border-gray-700">
        <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/30">
          <Route className="w-4 h-4 text-blue-600" />
        </div>
        <div>
          <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100">{selectedDevice.name}</h3>
          <p className="text-xs text-gray-500">{typeLabels[selectedDevice.type]}</p>
        </div>
      </div>

      <div>
        <p className="label">Hostname</p>
        <input className="input text-sm" defaultValue={selectedDevice.config.hostname} />
      </div>

      <div>
        <p className="label">Status</p>
        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
          selectedDevice.status === 'ONLINE' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
          'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${selectedDevice.status === 'ONLINE' ? 'bg-green-500' : 'bg-red-500'}`} />
          {selectedDevice.status}
        </span>
      </div>

      <div>
        <p className="label">Interfaces</p>
        <div className="space-y-2">
          {selectedDevice.config.interfaces.map((iface) => (
            <div key={iface.id} className="p-2 rounded-lg bg-gray-50 dark:bg-gray-900/50 text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-700 dark:text-gray-300">{iface.name}</span>
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                  iface.status === 'UP' ? 'bg-green-100 dark:bg-green-900/30 text-green-700' : 'bg-red-100 text-red-700'
                }`}>{iface.status}</span>
              </div>
              <p className="text-gray-500">IP: {iface.ipAddress}/{iface.subnetMask}</p>
              <p className="text-gray-500">MAC: {iface.macAddress}</p>
            </div>
          ))}
        </div>
      </div>

      {selectedDevice.config.routingProtocol && (
        <div>
          <p className="label">Routing Protocol</p>
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-xs font-medium">
            <Route className="w-3 h-3" /> {selectedDevice.config.routingProtocol}
          </span>
        </div>
      )}

      {selectedDevice.type === DeviceType.FIREWALL && (
        <div>
          <p className="label">Firewall Rules</p>
          <p className="text-xs text-gray-500 flex items-center gap-1">
            <Shield className="w-3 h-3" />
            {selectedDevice.config.firewallRules?.length || 0} rules configured
          </p>
        </div>
      )}

      {(selectedDevice.type === DeviceType.WIRELESS_AP || selectedDevice.type === DeviceType.LAPTOP) && (
        <div>
          <p className="label">Wireless</p>
          <p className="text-xs text-gray-500 flex items-center gap-1">
            <Wifi className="w-3 h-3" />
            SSID broadcast enabled
          </p>
        </div>
      )}
    </div>
  );
}
