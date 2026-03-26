/**
 * Fossil Dashboard — FossilRegistryProvider
 * Commit 2 Update — March 25, 2026 | PI Decision | Snoddy Method v7.3
 *
 * GOVERNANCE NOTE:
 * Provider accepts traces as a prop. Parent is responsible for fetching.
 * activeNodeId hover state is centralized here. Single control path.
 * useMemo prevents unnecessary re-renders of the entire tree.
 *
 * Ring 3 silence: No scoring fields, no derived metrics,
 * no interpretive language in any prop, state, or rendered output.
 */

import React, { createContext, useContext, useState, useMemo } from 'react';
import type { MappedTrace } from '../types/fossil';

interface FossilRegistryContextType {
  traces: MappedTrace[];
  activeNodeId: string | null;
  setActiveNodeId: (id: string | null) => void;
}

const FossilRegistryContext = createContext<FossilRegistryContextType | undefined>(undefined);

export const useFossilRegistry = (): FossilRegistryContextType => {
  const context = useContext(FossilRegistryContext);
  if (!context) {
    throw new Error('useFossilRegistry must be used within a FossilRegistryProvider');
  }
  return context;
};

interface FossilRegistryProviderProps {
  children: React.ReactNode;
  traces: MappedTrace[];
}

export const FossilRegistryProvider: React.FC<FossilRegistryProviderProps> = ({
  children,
  traces,
}) => {
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);

  const value = useMemo(() => ({
    traces,
    activeNodeId,
    setActiveNodeId,
  }), [traces, activeNodeId]);

  return (
    <FossilRegistryContext.Provider value={value}>
      {children}
    </FossilRegistryContext.Provider>
  );
};
