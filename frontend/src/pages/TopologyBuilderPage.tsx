import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DndContext } from '@dnd-kit/core';
import { useAppDispatch, useAppSelector } from '@/hooks/useAppSelector';
import { fetchTopologyById, createTopology, updateTopology, removeDevice, removeConnection } from '@/store/slices/topologySlice';
import DevicePalette from '@/components/topology/DevicePalette';
import TopologyCanvas from '@/components/topology/TopologyCanvas';
import DeviceConfigPanel from '@/components/topology/DeviceConfigPanel';
import { Plus, Trash2, Save, Play, FolderOpen, Download, Upload } from 'lucide-react';

export default function TopologyBuilderPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { currentTopology } = useAppSelector((state) => state.topology);
  const [topologyName, setTopologyName] = useState('New Topology');
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [showNewDialog, setShowNewDialog] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(fetchTopologyById(id));
    }
  }, [id, dispatch]);

  useEffect(() => {
    if (currentTopology) {
      setTopologyName(currentTopology.name);
    }
  }, [currentTopology]);

  const handleSave = async () => {
    if (!currentTopology) {
      await dispatch(createTopology({
        name: topologyName,
        description: '',
        devices: [],
        connections: [],
        isPublic: false,
        tags: [],
      }));
    } else {
      await dispatch(updateTopology({
        id: currentTopology.id,
        data: { name: topologyName },
      }));
    }
  };

  const handleExport = () => {
    if (!currentTopology) return;
    const blob = new Blob([JSON.stringify(currentTopology, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentTopology.name || 'topology'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const text = await file.text();
      try {
        const data = JSON.parse(text);
        if (data.devices && data.connections) {
          dispatch({ type: 'topology/setCurrentTopology', payload: data });
          setTopologyName(data.name || 'Imported Topology');
        }
      } catch { /* ignore parse errors */ }
    };
    input.click();
  };

  return (
    <div className="flex gap-4 h-[calc(100vh-7rem)]">
      {/* Left sidebar - device palette */}
      <div className="w-48 flex-shrink-0 space-y-3">
        <DevicePalette />

        {/* Topology actions */}
        <div className="card p-3 space-y-2">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">Actions</h3>
          <button onClick={() => setShowNewDialog(true)} className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300">
            <Plus className="w-4 h-4" /> New
          </button>
          <button onClick={handleSave} className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300">
            <Save className="w-4 h-4" /> Save
          </button>
          <button onClick={handleExport} className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300">
            <Download className="w-4 h-4" /> Export
          </button>
          <button onClick={handleImport} className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300">
            <Upload className="w-4 h-4" /> Import
          </button>
        </div>
      </div>

      {/* Center - Canvas */}
      <DndContext>
        <TopologyCanvas />
      </DndContext>

      {/* Right sidebar - device config */}
      <div className="w-72 flex-shrink-0">
        <DeviceConfigPanel />
      </div>
    </div>
  );
}
