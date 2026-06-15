import { memo } from 'react';
import { Packet, Position } from '@/types';

interface PacketAnimationProps {
  startPos: Position;
  endPos: Position;
  packet: Packet;
  delay: number;
}

const PacketAnimation = memo(function PacketAnimation({ startPos, endPos, packet }: PacketAnimationProps) {
  const x1 = startPos.x + 40;
  const y1 = startPos.y + 40;
  const x2 = endPos.x + 40;
  const y2 = endPos.y + 40;

  const protocolColors: Record<string, string> = {
    ICMP: '#10b981',
    TCP: '#3b82f6',
    UDP: '#f59e0b',
    DNS: '#8b5cf6',
    DHCP: '#ec4899',
    HTTP: '#06b6d4',
    HTTPS: '#06b6d4',
    SSH: '#14b8a6',
    FTP: '#f97316',
  };

  const color = protocolColors[packet.protocol] || '#3b82f6';

  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;

  return (
    <circle
      cx={midX}
      cy={midY}
      r={4}
      fill={color}
      opacity={0.8}
    >
      <animate
        attributeName="cx"
        values={`${x1};${x2}`}
        dur="1.5s"
        repeatCount="indefinite"
      />
      <animate
        attributeName="cy"
        values={`${y1};${y2}`}
        dur="1.5s"
        repeatCount="indefinite"
      />
      <title>{`${packet.protocol} | ${packet.sourceIp} → ${packet.destinationIp} | ${packet.size}B`}</title>
    </circle>
  );
});

export default PacketAnimation;
