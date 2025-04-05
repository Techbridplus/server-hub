import { create } from 'zustand'
import { MemberRole,Server } from '@prisma/client';


interface StoreState {
    role: MemberRole;
    ServerData: Server | null;
    setRole: (role: MemberRole) => void;
    setServerData: (server: Server) => void;
    clearServerData: () => void;
}


export const useStore = create<StoreState>((set) => ({
    role:   MemberRole.VISITOR,
    ServerData: {} as Server,
    setRole: (role: MemberRole) => set({ role }),
    setServerData: (server: Server) => set({ ServerData: server }),
    clearServerData: () => set({ ServerData: {} as Server})
    }));