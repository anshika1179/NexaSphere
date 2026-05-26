import { getApiBase } from "../utils/runtimeConfig";
import { RoadmapNode } from "../context/RoadmapBuilderContext";

export interface AdaptiveRequestPayload {
  currentNodes: RoadmapNode[];
  completedNodeIds: string[];
  missingSkills?: string[];
  weakTechnologies?: string[];
}

export const adaptiveEngineService = {
  async getAdaptiveSuggestions(
    payload: AdaptiveRequestPayload
  ): Promise<RoadmapNode[]> {
    const res = await fetch(`${getApiBase()}/adaptive-roadmap/mutate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error("Failed to fetch AI adaptive roadmap nodes");

    const data = await res.json();
    return data.suggestedNodes || [];
  },
};
