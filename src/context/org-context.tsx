'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Organization, Location, User } from '@/lib/types';
import { AppStore } from '@/services/store';

interface OrgContextType {
  organizations: Organization[];
  activeOrg: Organization | null;
  currentUser: User | null;
  locations: Location[];
  activeLocation: Location | null;
  setActiveOrg: (orgId: string) => void;
  setActiveLocationId: (locationId: string | null) => void;
  refreshState: () => void;
}

const OrgContext = createContext<OrgContextType | undefined>(undefined);

export function OrgProvider({ children }: { children: React.ReactNode }) {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [activeOrg, setActiveOrgState] = useState<Organization | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [activeLocationId, setActiveLocationIdState] = useState<string | null>(null);

  const refreshState = () => {
    const orgs = AppStore.getOrganizations();
    setOrganizations(orgs);

    const activeId = AppStore.getActiveOrgId();
    const foundOrg = orgs.find((o) => o.id === activeId) || orgs[0] || null;
    setActiveOrgState(foundOrg);

    if (foundOrg) {
      const orgLocs = AppStore.getLocations(foundOrg.id);
      setLocations(orgLocs);
      if (!activeLocationId && orgLocs.length > 0) {
        setActiveLocationIdState(orgLocs[0].id);
      }
    }
  };

  useEffect(() => {
    refreshState();
  }, []);

  const setActiveOrg = (orgId: string) => {
    AppStore.setActiveOrgId(orgId);
    const orgs = AppStore.getOrganizations();
    const foundOrg = orgs.find((o) => o.id === orgId) || null;
    setActiveOrgState(foundOrg);

    if (foundOrg) {
      const orgLocs = AppStore.getLocations(foundOrg.id);
      setLocations(orgLocs);
      setActiveLocationIdState(orgLocs.length > 0 ? orgLocs[0].id : null);
    }
  };

  const currentUser = activeOrg?.users?.[0] || null;
  const activeLocation = locations.find((l) => l.id === activeLocationId) || locations[0] || null;

  return (
    <OrgContext.Provider
      value={{
        organizations,
        activeOrg,
        currentUser,
        locations,
        activeLocation,
        setActiveOrg,
        setActiveLocationId: setActiveLocationIdState,
        refreshState,
      }}
    >
      {children}
    </OrgContext.Provider>
  );
}

export function useOrg() {
  const context = useContext(OrgContext);
  if (!context) {
    throw new Error('useOrg must be used within an OrgProvider');
  }
  return context;
}
