"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import ReactFlow, {
  Background,
  Controls,
  Handle,
  MarkerType,
  MiniMap,
  Position,
  addEdge,
  useEdgesState,
  useNodesState,
  type Connection,
  type Edge,
  type Node,
  type NodeProps,
} from "reactflow";
import Link from "next/link";
import { apiUrl } from "@/lib/api";

type NodeKind = "trigger" | "condition" | "action" | "ai" | "wait";
type NodeShape = "rounded" | "square" | "diamond" | "circle";

type WorkflowNodeData = {
  label: string;
  kind: NodeKind;
  shape: NodeShape;
  color: string;
  symbol: string;
  description?: string;
  entity?: string;
};

const colorOptions = [
  { label: "Blue", value: "#2563eb" },
  { label: "Emerald", value: "#059669" },
  { label: "Violet", value: "#7c3aed" },
  { label: "Amber", value: "#d97706" },
  { label: "Rose", value: "#e11d48" },
  { label: "Slate", value: "#475569" },
];

const symbolOptions = ["Start", "Filter", "Mail", "DB", "AI", "API", "Wait", "End"];

const defaultNodes: Node<WorkflowNodeData>[] = [
  {
    id: "trigger-1",
    type: "workflow",
    position: { x: 80, y: 160 },
    data: {
      label: "Record Created",
      kind: "trigger",
      shape: "rounded",
      color: "#2563eb",
      symbol: "Start",
      description: "Starts when a record is created.",
      entity: "items",
    },
  },
  {
    id: "condition-1",
    type: "workflow",
    position: { x: 360, y: 160 },
    data: {
      label: "Priority Check",
      kind: "condition",
      shape: "diamond",
      color: "#d97706",
      symbol: "Filter",
      description: "Checks if the record matches workflow rules.",
    },
  },
  {
    id: "action-1",
    type: "workflow",
    position: { x: 660, y: 160 },
    data: {
      label: "Send Notification",
      kind: "action",
      shape: "rounded",
      color: "#059669",
      symbol: "Mail",
      description: "Sends an email or in-app notification.",
    },
  },
];

const defaultEdges: Edge[] = [
  {
    id: "trigger-1-condition-1",
    source: "trigger-1",
    target: "condition-1",
    markerEnd: { type: MarkerType.ArrowClosed },
    style: { stroke: "#64748b", strokeWidth: 2 },
  },
  {
    id: "condition-1-action-1",
    source: "condition-1",
    target: "action-1",
    markerEnd: { type: MarkerType.ArrowClosed },
    style: { stroke: "#64748b", strokeWidth: 2 },
  },
];

function shapeClass(shape: NodeShape) {
  if (shape === "circle") return "h-36 w-36 rounded-full";
  if (shape === "square") return "h-32 w-44 rounded-sm";
  if (shape === "diamond") return "h-36 w-36";
  return "h-32 w-52 rounded-lg";
}

function WorkflowNode({ data, selected }: NodeProps<WorkflowNodeData>) {
  const content = (
    <div className="flex h-full w-full flex-col items-center justify-center px-4 text-center">
      <div className="mb-2 rounded-md bg-white/12 px-2 py-1 text-[10px] font-black uppercase tracking-wide text-white/80">
        {data.symbol}
      </div>
      <div className="line-clamp-2 text-sm font-black leading-tight text-white">{data.label}</div>
      <div className="mt-2 text-[10px] font-bold uppercase tracking-wide text-white/60">{data.kind}</div>
    </div>
  );

  return (
    <div className="relative">
      <Handle type="target" position={Position.Left} className="!h-3 !w-3 !border-2 !border-slate-950 !bg-white" />
      <div
        className={`${shapeClass(data.shape)} border shadow-xl transition ${
          selected ? "border-white shadow-blue-500/30" : "border-white/15 shadow-black/30"
        }`}
        style={{ background: data.color }}
      >
        {data.shape === "diamond" ? (
          <div className="h-full w-full rotate-45 rounded-md border border-white/15">
            <div className="flex h-full w-full -rotate-45 items-center justify-center">{content}</div>
          </div>
        ) : (
          content
        )}
      </div>
      <Handle type="source" position={Position.Right} className="!h-3 !w-3 !border-2 !border-slate-950 !bg-white" />
    </div>
  );
}

function nodeToAction(node: Node<WorkflowNodeData>) {
  if (node.data.kind === "trigger") return null;
  if (node.data.kind === "condition") return null;

  return {
    id: node.id,
    name: node.data.label,
    type: node.data.kind,
    config: {
      description: node.data.description || "",
      symbol: node.data.symbol,
      color: node.data.color,
      shape: node.data.shape,
    },
  };
}

function graphToWorkflow(nodes: Node<WorkflowNodeData>[], edges: Edge[], appConfig: any) {
  const triggerNode = nodes.find((node) => node.data.kind === "trigger") || nodes[0];
  const conditionNodes = nodes.filter((node) => node.data.kind === "condition");
  const actions = nodes.map(nodeToAction).filter(Boolean);
  const primaryEntity = triggerNode?.data.entity || appConfig?.entities?.[0]?.name || "items";

  return {
    id: "visual-workflow",
    name: "Visual Workflow",
    enabled: true,
    trigger: {
      type: "record.create",
      entity: primaryEntity,
      label: triggerNode?.data.label || "Manual Trigger",
    },
    conditions: conditionNodes.map((node) => ({
      id: node.id,
      label: node.data.label,
      description: node.data.description || "",
    })),
    conditionLogic: "and",
    actions,
    graph: {
      nodes: nodes.map((node) => ({
        id: node.id,
        type: node.type,
        position: node.position,
        data: node.data,
      })),
      edges,
    },
    errorHandling: { onFailure: "continue", retry: { maxAttempts: 1 } },
  };
}

function graphFromConfig(config: any) {
  const visualWorkflow = Array.isArray(config?.workflows)
    ? config.workflows.find((workflow: any) => workflow.id === "visual-workflow" && workflow.graph)
    : null;

  if (!visualWorkflow?.graph?.nodes?.length) {
    return { nodes: defaultNodes, edges: defaultEdges };
  }

  return {
    nodes: visualWorkflow.graph.nodes.map((node: Node<WorkflowNodeData>) => ({ ...node, type: "workflow" })),
    edges: visualWorkflow.graph.edges || [],
  };
}

export default function WorkflowEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = React.use(params);
  const appId = resolvedParams.id;
  const [appConfig, setAppConfig] = useState<any>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState<WorkflowNodeData>(defaultNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(defaultEdges);
  const [selectedNodeId, setSelectedNodeId] = useState<string>("trigger-1");
  const [status, setStatus] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const selectedNode = nodes.find((node) => node.id === selectedNodeId) || null;
  const nodeTypes = useMemo(() => ({ workflow: WorkflowNode }), []);
  const entityOptions = useMemo(
    () => (Array.isArray(appConfig?.entities) ? appConfig.entities.map((entity: any) => entity.name) : ["items"]),
    [appConfig],
  );

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(apiUrl(`/apps/${appId}/config`), { credentials: "include" });
        const json = await res.json();
        const config = json.data?.config || {
          app: { name: "Workflow App" },
          entities: [{ name: "items", fields: [{ name: "title", type: "string" }] }],
          pages: [],
          workflows: [],
        };
        setAppConfig(config);
        const graph = graphFromConfig(config);
        setNodes(graph.nodes);
        setEdges(graph.edges);
        setSelectedNodeId(graph.nodes[0]?.id || "");
      } catch (err) {
        setStatus(err instanceof Error ? err.message : "Failed to load workflow config.");
      }
    };

    load();
  }, [appId, setEdges, setNodes]);

  const onConnect = useCallback(
    (connection: Connection) =>
      setEdges((current) =>
        addEdge(
          {
            ...connection,
            markerEnd: { type: MarkerType.ArrowClosed },
            style: { stroke: "#64748b", strokeWidth: 2 },
          },
          current,
        ),
      ),
    [setEdges],
  );

  function updateSelectedNode(partial: Partial<WorkflowNodeData>) {
    if (!selectedNode) return;
    setNodes((current) =>
      current.map((node) =>
        node.id === selectedNode.id
          ? {
              ...node,
              data: { ...node.data, ...partial },
            }
          : node,
      ),
    );
  }

  function addNode(kind: NodeKind = "action") {
    const count = nodes.length + 1;
    const id = `${kind}-${Date.now()}`;
    const color = kind === "condition" ? "#d97706" : kind === "ai" ? "#7c3aed" : kind === "wait" ? "#475569" : "#059669";
    const nextNode: Node<WorkflowNodeData> = {
      id,
      type: "workflow",
      position: { x: 120 + count * 90, y: 120 + (count % 3) * 120 },
      data: {
        label: `${kind.charAt(0).toUpperCase()}${kind.slice(1)} Node`,
        kind,
        shape: kind === "condition" ? "diamond" : "rounded",
        color,
        symbol: kind === "condition" ? "Filter" : kind === "ai" ? "AI" : kind === "wait" ? "Wait" : "API",
        description: "",
        entity: entityOptions[0] || "items",
      },
    };

    setNodes((current) => [...current, nextNode]);
    if (selectedNodeId) {
      setEdges((current) => [
        ...current,
        {
          id: `${selectedNodeId}-${id}`,
          source: selectedNodeId,
          target: id,
          markerEnd: { type: MarkerType.ArrowClosed },
          style: { stroke: "#64748b", strokeWidth: 2 },
        },
      ]);
    }
    setSelectedNodeId(id);
  }

  function duplicateSelectedNode() {
    if (!selectedNode) return;
    const id = `${selectedNode.data.kind}-${Date.now()}`;
    setNodes((current) => [
      ...current,
      {
        ...selectedNode,
        id,
        selected: false,
        position: { x: selectedNode.position.x + 80, y: selectedNode.position.y + 80 },
        data: { ...selectedNode.data, label: `${selectedNode.data.label} Copy` },
      },
    ]);
    setSelectedNodeId(id);
  }

  function deleteSelectedNode() {
    if (!selectedNode || nodes.length <= 1) return;
    setNodes((current) => current.filter((node) => node.id !== selectedNode.id));
    setEdges((current) => current.filter((edge) => edge.source !== selectedNode.id && edge.target !== selectedNode.id));
    setSelectedNodeId(nodes.find((node) => node.id !== selectedNode.id)?.id || "");
  }

  async function saveOrDeploy(deploy: boolean) {
    if (!appConfig) return;
    setIsSaving(true);
    setStatus(null);

    try {
      const workflow = graphToWorkflow(nodes, edges, appConfig);
      const nextConfig = {
        ...appConfig,
        workflows: [
          workflow,
          ...(Array.isArray(appConfig.workflows) ? appConfig.workflows.filter((item: any) => item.id !== "visual-workflow") : []),
        ],
      };

      const endpoint = deploy ? "/deploy" : `/apps/${appId}/config`;
      const res = await fetch(apiUrl(endpoint), {
        method: deploy ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(deploy ? { appId, config: nextConfig } : nextConfig),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || "Workflow save failed.");
      }

      setAppConfig(nextConfig);
      setStatus(deploy ? "Workflow deployed and app config updated." : "Workflow draft saved.");
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Workflow action failed.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] overflow-hidden rounded-lg border border-slate-800 bg-[#0b1220] shadow-2xl shadow-black/30">
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-slate-800 bg-[#101827] px-5 py-4">
          <div className="flex items-center gap-4">
            <Link href={`/studio/apps/${appId}/workflows`} className="text-slate-400 transition hover:text-white">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            <div>
              <h1 className="text-xl font-black text-white">Visual Workflow Editor</h1>
              <p className="text-sm text-slate-500">Edit nodes, connect actions, and deploy the workflow into the app config.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => addNode("action")}
              className="inline-flex items-center rounded-lg border border-slate-700 px-4 py-2 text-sm font-bold text-slate-200 transition hover:border-blue-500 hover:bg-blue-500/10 hover:text-white"
            >
              <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Add Node
            </button>
            <button
              type="button"
              onClick={() => saveOrDeploy(false)}
              disabled={isSaving}
              className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-bold text-slate-200 transition hover:border-slate-500 hover:bg-slate-800 disabled:opacity-50"
            >
              Save Draft
            </button>
            <button
              type="button"
              onClick={() => saveOrDeploy(true)}
              disabled={isSaving}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-blue-950/30 transition hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-400"
            >
              {isSaving ? "Working..." : "Deploy Workflow"}
            </button>
          </div>
        </header>

        {status && (
          <div className="border-b border-slate-800 bg-slate-950 px-5 py-3 text-sm text-slate-300">
            {status}
          </div>
        )}

        <div className="min-h-0 flex-1">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={(_, node) => setSelectedNodeId(node.id)}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{ padding: 0.3 }}
          >
            <Background color="#1e293b" gap={24} />
            <MiniMap pannable zoomable nodeStrokeWidth={3} nodeColor={(node) => (node.data as WorkflowNodeData).color} />
            <Controls />
          </ReactFlow>
        </div>
      </div>

      <aside className="flex w-96 flex-col border-l border-slate-800 bg-[#101827]">
        <div className="border-b border-slate-800 p-5">
          <h2 className="text-lg font-black text-white">Node Properties</h2>
          <p className="mt-1 text-sm text-slate-500">Select a node to edit its behavior and visual style.</p>
        </div>

        {selectedNode ? (
          <div className="flex-1 space-y-5 overflow-y-auto p-5">
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">Name</label>
              <input
                value={selectedNode.data.label}
                onChange={(event) => updateSelectedNode({ label: event.target.value })}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none transition focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">Type</label>
                <select
                  value={selectedNode.data.kind}
                  onChange={(event) => updateSelectedNode({ kind: event.target.value as NodeKind })}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none transition focus:border-blue-500"
                >
                  <option value="trigger">Trigger</option>
                  <option value="condition">Condition</option>
                  <option value="action">Action</option>
                  <option value="ai">AI</option>
                  <option value="wait">Wait</option>
                </select>
              </div>
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">Entity</label>
                <select
                  value={selectedNode.data.entity || entityOptions[0] || "items"}
                  onChange={(event) => updateSelectedNode({ entity: event.target.value })}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none transition focus:border-blue-500"
                >
                  {entityOptions.map((entity: string) => (
                    <option key={entity} value={entity}>
                      {entity}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">Shape</label>
              <div className="grid grid-cols-4 gap-2">
                {(["rounded", "square", "diamond", "circle"] as NodeShape[]).map((shape) => (
                  <button
                    key={shape}
                    type="button"
                    onClick={() => updateSelectedNode({ shape })}
                    className={`rounded-lg border px-2 py-2 text-xs font-bold capitalize transition ${
                      selectedNode.data.shape === shape
                        ? "border-blue-500 bg-blue-500/10 text-blue-200"
                        : "border-slate-700 text-slate-400 hover:border-slate-500 hover:text-white"
                    }`}
                  >
                    {shape}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">Color</label>
              <div className="grid grid-cols-6 gap-2">
                {colorOptions.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    title={color.label}
                    onClick={() => updateSelectedNode({ color: color.value })}
                    className={`h-9 rounded-lg border transition ${
                      selectedNode.data.color === color.value ? "border-white" : "border-slate-700"
                    }`}
                    style={{ background: color.value }}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">Symbol</label>
              <div className="grid grid-cols-4 gap-2">
                {symbolOptions.map((symbol) => (
                  <button
                    key={symbol}
                    type="button"
                    onClick={() => updateSelectedNode({ symbol })}
                    className={`rounded-lg border px-2 py-2 text-xs font-bold transition ${
                      selectedNode.data.symbol === symbol
                        ? "border-blue-500 bg-blue-500/10 text-blue-200"
                        : "border-slate-700 text-slate-400 hover:border-slate-500 hover:text-white"
                    }`}
                  >
                    {symbol}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">Description</label>
              <textarea
                rows={4}
                value={selectedNode.data.description || ""}
                onChange={(event) => updateSelectedNode({ description: event.target.value })}
                className="w-full resize-none rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none transition focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 border-t border-slate-800 pt-5">
              <button
                type="button"
                onClick={duplicateSelectedNode}
                className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-bold text-slate-200 transition hover:border-blue-500 hover:bg-blue-500/10"
              >
                Duplicate
              </button>
              <button
                type="button"
                onClick={deleteSelectedNode}
                className="rounded-lg border border-rose-900/70 px-4 py-2 text-sm font-bold text-rose-200 transition hover:bg-rose-950/40"
              >
                Delete Node
              </button>
            </div>

            <div className="rounded-lg border border-slate-800 bg-slate-950/50 p-4">
              <div className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">Quick Add</div>
              <div className="grid grid-cols-2 gap-2">
                {(["trigger", "condition", "action", "ai", "wait"] as NodeKind[]).map((kind) => (
                  <button
                    key={kind}
                    type="button"
                    onClick={() => addNode(kind)}
                    className="rounded-md border border-slate-700 px-3 py-2 text-xs font-bold capitalize text-slate-300 transition hover:border-blue-500 hover:text-white"
                  >
                    {kind}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-5 text-sm text-slate-500">No node selected.</div>
        )}
      </aside>
    </div>
  );
}
