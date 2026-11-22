import React, { createContext, useContext, type ReactNode } from 'react';
import { RootStore, rootStore } from './RootStore';

export const StoreContext = createContext<RootStore>(rootStore);

export interface StoreProviderProps {
	children: ReactNode;
	store?: RootStore;
}

export const StoreProvider: React.FC<StoreProviderProps> = ({ children, store = rootStore }) => {
	return React.createElement(StoreContext.Provider, { value: store }, children);
};

export const useRootStore = (): RootStore => {
	const context = useContext(StoreContext);
	if (!context) {
		throw new Error('useRootStore must be used within a StoreProvider');
	}
	return context;
};

// Convenience modular hooks
export const useAuthStore = () => useRootStore().authStore;
export const useOrgStore = () => useRootStore().organizationStore;
export const useMembershipStore = () => useRootStore().membershipStore;
export const useTeamStore = () => useRootStore().teamStore;
export const useProjectStore = () => useRootStore().projectStore;
export const useTaskStore = () => useRootStore().taskStore;

export { rootStore, RootStore };
