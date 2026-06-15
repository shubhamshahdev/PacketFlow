import { useCallback, useRef, useState, useEffect } from 'react';
import { useDndMonitor, DragEndEvent } from '@dnd-kit/core';
import { useAppDispatch, useAppSelector } from '@/hooks/useAppSelector';
import { addDevice, updateDevicePosition } from '@/store/slices/topologySlice';
import { Device, Connection, DeviceType, ConnectionType } from '@/types';
import { v4 as uuidv4 } from '@/utils/uuid';
import DeviceNode from './DeviceNode';
import ConnectionLine from './ConnectionLine';
import PacketAnimation from './PacketAnimation';

export default function TopologyCanvas() {
  const dispatch = useAppDispatch();
  const { currentTopology } = useAppSelector((state) => state.topology);
  const { packets } = useAppSelector((state) => state.simulation);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [canvasOffset, setCanvasOffset] = useState({ x: 0, y: 0 });
  const [connecting, setConnecting] = useState<{ sourceId: string; sourceInterface: string } | null>(null);
  const [connectionLine, setConnectionLine] = useState<{ x1: number; y1: number; x2: number; y2: number } | null>(null);

  const devices = currentTopology?.devices || [];
  const connections = currentTopology?.connections || [];

  useEffect(() => {
    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      setCanvasOffset({ x: rect.left, y: rect.top });
    }
  }, []);

  useDndMonitor({
    onDragEnd: (event: DragEndEvent) => {
      const { active, over } = event;
      if (!active || !active.data.current) return;

      const paletteId = active.id as string;
      if (!paletteId.startsWith('palette-')) return;

      const type = active.data.current.type as DeviceType;
      const label = active.data.current.label as string;

      if (over?.id === 'canvas-drop-area' || !over) {
        const canvasRect = canvasRef.current?.getBoundingClientRect();
        if (!canvasRect) return;

        const x = (event.delta?.x || 0) + canvasRect.width / 2 - 50;
        const y = (event.delta?.y || 0) + canvasRect.height / 2 - 50;

        const newDevice: Device = {
          id: uuidv4(),
          name: `${label} ${devices.filter((d) => d.type === type).length + 1}`,
          type,
          position: { x: Math.max(0, x), y: Math.max(0, y) },
          config: {
            hostname: `${label.toLowerCase()}${devices.filter((d) => d.type === type).length + 1}`,
            interfaces: [
              {
                id: uuidv4(),
                name: 'eth0',
                ipAddress: `10.0.${devices.length}.1`,
                subnetMask: '255.255.255.0',
                macAddress: `00:${Array.from({ length: 5 }, () => Math.floor(Math.random() * 256).toString(16).padStart(2, '0')).join(':')}`.toUpperCase(),
                status: 'UP',
                type: 'ethernet',
              },
            ],
          },
          status: 'ONLINE',
          lastSeen: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        dispatch(addDevice(newDevice));
      }
    },
  });

  const handleDeviceDragStop = useCallback(
    (deviceId: string, position: { x: number; y: number }) => {
      dispatch(updateDevicePosition({ deviceId, position }));
    },
    [dispatch]
  );

  const handleDeviceClick = useCallback((deviceId: string) => {
    if (connecting) {
      const newConn: Connection = {
        id: uuidv4(),
        sourceDeviceId: connecting.sourceId,
        targetDeviceId: deviceId,
        sourceInterface: connecting.sourceInterface,
        targetInterface: 'eth0',
        type: ConnectionType.ETHERNET,
        bandwidth: 1000,
        latency: 1,
        status: 'UP',
        isTrunk: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      // Dispatch addConnection through redux
      const action = { type: 'topology/addConnection', payload: newConn };
      dispatch(action);
      setConnecting(null);
      setConnectionLine(null);
    }
  }, [connecting, dispatch]);

  const handleStartConnect = useCallback((deviceId: string, ifaceName: string) => {
    setConnecting({ sourceId: deviceId, sourceInterface: ifaceName });
  }, []);

  return (
    <div
      id="canvas-drop-area"
      ref={canvasRef}
      className="relative flex-1 bg-gray-50 dark:bg-gray-900/50 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl min-h-[500px] overflow-hidden"
    >
      {/* Grid pattern */}
      <svg className="absolute inset-0 w-full h-full" style={{ pointerEvents: 'none' }}>
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" className="text-gray-200 dark:text-gray-700" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      {/* Connections */}
      <svg className="absolute inset-0 w-full h-full" style={{ pointerEvents: 'none' }}>
        {connections.map((conn) => {
          const source = devices.find((d) => d.id === conn.sourceDeviceId);
          const target = devices.find((d) => d.id === conn.targetDeviceId);
          if (!source || !target) return null;
          return (
            <ConnectionLine
              key={conn.id}
              connection={conn}
              sourcePos={source.position}
              targetPos={target.position}
              deviceSize={80}
            />
          );
        })}

        {/* Packet animations */}
        {packets.map((pkt, idx) => {
          const pathDevices = pkt.path || [];
          if (pathDevices.length < 2) return null;
          const startDev = devices.find((d) => d.id === pathDevices[idx % pathDevices.length]);
          const endDev = devices.find((d) => d.id === pathDevices[(idx + 1) % pathDevices.length]);
          if (!startDev || !endDev) return null;
          return (
            <PacketAnimation
              key={pkt.id}
              startPos={startDev.position}
              endPos={endDev.position}
              packet={pkt}
              delay={idx * 0.5}
            />
          );
        })}
      </svg>

      {/* Devices */}
      {devices.map((device) => (
        <DeviceNode
          key={device.id}
          device={device}
          onDragStop={handleDeviceDragStop}
          onClick={handleDeviceClick}
          onStartConnect={handleStartConnect}
          isConnecting={connecting?.sourceId === device.id}
        />
      ))}

      {/* Drop hint */}
      {devices.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <p className="text-gray-400 dark:text-gray-500 font-medium">Drag devices here</p>
            <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">Select from the palette on the left</p>
          </div>
        </div>
      )}
    </div>
  );
}
