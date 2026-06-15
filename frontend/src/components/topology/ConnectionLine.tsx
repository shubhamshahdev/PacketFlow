import { memo } from 'react';
import { Connection, Position } from '@/types';

interface ConnectionLineProps {
  connection: Connection;
  sourcePos: Position;
  targetPos: Position;
  deviceSize: number;
}

const ConnectionLine = memo(function ConnectionLine({ connection, sourcePos, targetPos, deviceSize }: ConnectionLineProps) {
  const x1 = sourcePos.x + deviceSize / 2;
  const y1 = sourcePos.y + deviceSize / 2;
  const x2 = targetPos.x + deviceSize / 2;
  const y2 = targetPos.y + deviceSize / 2;

  const isUp = connection.status === 'UP';
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;

  return (
    <g>
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={isUp ? '#3b82f6' : '#ef4444'}
        strokeWidth={connection.isTrunk ? 3 : 2}
        strokeDasharray={connection.type === 'WIRELESS' ? '5,5' : 'none'}
        opacity={0.6}
      />
      <rect
        x={midX - 20}
        y={midY - 8}
        width={40}
        height={16}
        rx={4}
        fill="white"
        className="dark:fill-gray-800"
        stroke="#e2e8f0"
      />
      <text
        x={midX}
        y={midY + 4}
        textAnchor="middle"
        fill="#64748b"
        fontSize="9"
      >
        {connection.bandwidth >= 1000 ? `${connection.bandwidth / 1000}G` : `${connection.bandwidth}M`}
      </text>
    </g>
  );
});

export default ConnectionLine;
