import React, { useEffect, useRef, useState } from 'react';
import * as Blockly from 'blockly';
import { javascriptGenerator } from 'blockly/javascript';
import {
  Code,
  Download,
  Upload,
  RotateCcw,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  FolderOpen,
  CheckCircle,
  FileCode,
  X
} from 'lucide-react';
import { initDerivBlocks } from '../../services/bot/derivBlocks';
import { DERIV_TOOLBOX_CONFIG } from '../../services/bot/derivToolbox';
import {
  OFFICIAL_STRATEGY_TEMPLATES,
  exportWorkspaceToXml,
  loadXmlIntoWorkspace,
  validateStrategyXml
} from '../../services/bot/botXml';
import { sound } from '../../services/sound';

interface BlocklyWorkspaceProps {
  onWorkspaceChange?: (xml: string, code: string) => void;
  onSelectTemplate?: (templateId: string) => void;
}

export const BlocklyWorkspace: React.FC<BlocklyWorkspaceProps> = ({
  onWorkspaceChange
}) => {
  const blocklyDivRef = useRef<HTMLDivElement>(null);
  const workspaceRef = useRef<Blockly.WorkspaceSvg | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeModal, setActiveModal] = useState<'code' | 'xml' | 'library' | null>(null);
  const [generatedCode, setGeneratedCode] = useState<string>('');
  const [currentXml, setCurrentXml] = useState<string>('');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(OFFICIAL_STRATEGY_TEMPLATES[0].id);

  useEffect(() => {
    initDerivBlocks();

    if (blocklyDivRef.current && !workspaceRef.current) {
      const ws = Blockly.inject(blocklyDivRef.current, {
        toolbox: DERIV_TOOLBOX_CONFIG as any,
        grid: {
          spacing: 20,
          length: 3,
          colour: '#1e293b',
          snap: true
        },
        zoom: {
          controls: false,
          wheel: true,
          startScale: 0.85,
          maxScale: 2,
          minScale: 0.4,
          scaleSpeed: 1.1
        },
        trashcan: true,
        sounds: false,
        theme: Blockly.Theme.defineTheme('derivDark', {
          name: 'derivDark',
          base: Blockly.Themes.Classic,
          componentStyles: {
            workspaceBackgroundColour: '#090d16',
            toolboxBackgroundColour: '#0f172a',
            toolboxForegroundColour: '#e2e8f0',
            flyoutBackgroundColour: '#0f172a',
            flyoutForegroundColour: '#cbd5e1',
            flyoutOpacity: 0.95,
            scrollbarColour: '#334155',
            scrollbarOpacity: 0.7,
            cursorColour: '#38bdf8'
          }
        })
      });

      workspaceRef.current = ws;

      // Load initial default official Deriv template
      loadXmlIntoWorkspace(ws, OFFICIAL_STRATEGY_TEMPLATES[0].xml);

      const updateCodeAndXml = () => {
        if (!workspaceRef.current) return;
        try {
          const code = javascriptGenerator.workspaceToCode(workspaceRef.current);
          const xml = exportWorkspaceToXml(workspaceRef.current);
          setGeneratedCode(code);
          setCurrentXml(xml);
          if (onWorkspaceChange) {
            onWorkspaceChange(xml, code);
          }
        } catch (err) {
          console.warn('Blockly code gen error:', err);
        }
      };

      ws.addChangeListener(updateCodeAndXml);
      updateCodeAndXml();
    }

    return () => {
      if (workspaceRef.current) {
        workspaceRef.current.dispose();
        workspaceRef.current = null;
      }
    };
  }, []);

  const handleZoomIn = () => {
    sound.playClick();
    if (workspaceRef.current) {
      workspaceRef.current.zoomCenter(1);
    }
  };

  const handleZoomOut = () => {
    sound.playClick();
    if (workspaceRef.current) {
      workspaceRef.current.zoomCenter(-1);
    }
  };

  const handleResetZoom = () => {
    sound.playClick();
    if (workspaceRef.current) {
      workspaceRef.current.setScale(0.85);
      workspaceRef.current.scrollCenter();
    }
  };

  const handleExportXml = () => {
    sound.playClick();
    if (!workspaceRef.current) return;
    const xml = exportWorkspaceToXml(workspaceRef.current);
    const blob = new Blob([xml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `deriv_strategy_${Date.now()}.xml`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !workspaceRef.current) return;
    const reader = new FileReader();
    reader.onload = evt => {
      const text = evt.target?.result as string;
      if (text) {
        const validation = validateStrategyXml(text);
        if (!validation.isValid) {
          alert('Strategy XML Error:\n' + validation.errors.join('\n'));
          return;
        }
        loadXmlIntoWorkspace(workspaceRef.current!, text);
        sound.playClick();
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleApplyTemplate = (tmpl: typeof OFFICIAL_STRATEGY_TEMPLATES[0]) => {
    sound.playClick();
    setSelectedTemplateId(tmpl.id);
    if (workspaceRef.current) {
      loadXmlIntoWorkspace(workspaceRef.current, tmpl.xml);
    }
    setActiveModal(null);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 relative overflow-hidden select-none">
      {/* Top Blockly Canvas Action Bar */}
      <div className="h-12 border-b border-slate-800 bg-slate-900/90 px-3 flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveModal('library')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-400 border border-cyan-500/40 text-xs font-semibold transition-all"
          >
            <FolderOpen className="w-3.5 h-3.5" />
            <span>Templates</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold transition-all"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import XML</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".xml"
            className="hidden"
          />

          <button
            onClick={handleExportXml}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Save XML</span>
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setActiveModal('code')}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs"
            title="Inspect Generated JavaScript"
          >
            <Code className="w-4 h-4 text-emerald-400" />
          </button>

          <button
            onClick={() => setActiveModal('xml')}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs"
            title="Inspect Strategy XML"
          >
            <FileCode className="w-4 h-4 text-purple-400" />
          </button>

          <div className="h-4 w-px bg-slate-800 mx-1" />

          <button
            onClick={handleZoomIn}
            className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleResetZoom}
            className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
            title="Center View"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Blockly Workspace SVG Element */}
      <div className="flex-1 w-full h-full relative">
        <div ref={blocklyDivRef} className="absolute inset-0 w-full h-full" />
      </div>

      {/* Modal: Strategy Template Library */}
      {activeModal === 'library' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-2xl w-full shadow-2xl p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FolderOpen className="w-5 h-5 text-cyan-400" />
                <h3 className="font-bold text-base text-white">Official Deriv Strategy Templates</h3>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {OFFICIAL_STRATEGY_TEMPLATES.map(tmpl => (
                <div
                  key={tmpl.id}
                  onClick={() => handleApplyTemplate(tmpl)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between space-y-3 ${
                    selectedTemplateId === tmpl.id
                      ? 'bg-cyan-950/40 border-cyan-500/60 shadow-lg'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-xs text-white">{tmpl.name}</span>
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold uppercase ${
                          tmpl.riskLevel === 'low'
                            ? 'bg-emerald-950 text-emerald-400'
                            : tmpl.riskLevel === 'medium'
                            ? 'bg-amber-950 text-amber-400'
                            : 'bg-rose-950 text-rose-400'
                        }`}
                      >
                        {tmpl.riskLevel}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-3 leading-relaxed">
                      {tmpl.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-400">
                    <span>{tmpl.market}</span>
                    <span className="text-cyan-400 font-bold">Load &rarr;</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Generated JS Code Inspector */}
      {activeModal === 'code' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-3xl w-full shadow-2xl p-6 space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Code className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-base text-white">Generated Strategy JavaScript</h3>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <pre className="flex-1 overflow-auto p-4 rounded-lg bg-slate-950 border border-slate-800 text-emerald-400 font-mono text-xs leading-relaxed">
              {generatedCode || '// No statements generated from workspace blocks.'}
            </pre>
          </div>
        </div>
      )}

      {/* Modal: Strategy XML Inspector */}
      {activeModal === 'xml' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-3xl w-full shadow-2xl p-6 space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FileCode className="w-5 h-5 text-purple-400" />
                <h3 className="font-bold text-base text-white">Strategy XML Specification (4-Root Deriv DOM)</h3>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <pre className="flex-1 overflow-auto p-4 rounded-lg bg-slate-950 border border-slate-800 text-purple-300 font-mono text-xs leading-relaxed">
              {currentXml || '<xml></xml>'}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
