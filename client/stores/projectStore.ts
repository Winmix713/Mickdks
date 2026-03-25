import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/react';

export interface Page {
  id: string;
  name: string;
  slug: string;
  title: string;
  description: string;
  componentIds: string[];
  order: number;
}

export interface Project {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  pages: Page[];
}

interface ProjectStore {
  currentProject: Project | null;
  currentPageId: string | null;
  
  // Project actions
  createProject: (name: string) => Project;
  setCurrentProject: (project: Project) => void;
  updateProject: (updates: Partial<Project>) => void;
  deleteProject: () => void;
  
  // Page actions
  createPage: (name: string, slug?: string) => void;
  updatePage: (pageId: string, updates: Partial<Page>) => void;
  deletePage: (pageId: string) => void;
  setCurrentPage: (pageId: string) => void;
  getCurrentPage: () => Page | null;
  reorderPages: (pages: Page[]) => void;
}

export const useProjectStore = create<ProjectStore>()(
  subscribeWithSelector((set, get) => ({
    currentProject: null,
    currentPageId: null,

    createProject: (name) => {
      const now = Date.now();
      const projectId = `project-${now}`;
      const pageId = `page-${now}-home`;
      
      const project: Project = {
        id: projectId,
        name,
        createdAt: now,
        updatedAt: now,
        pages: [
          {
            id: pageId,
            name: 'Home',
            slug: 'home',
            title: 'Home',
            description: '',
            componentIds: [],
            order: 0,
          },
        ],
      };

      set({
        currentProject: project,
        currentPageId: pageId,
      });

      return project;
    },

    setCurrentProject: (project) => {
      const firstPage = project.pages[0];
      set({
        currentProject: project,
        currentPageId: firstPage?.id || null,
      });
    },

    updateProject: (updates) =>
      set((state) => {
        if (!state.currentProject) return state;
        return {
          currentProject: {
            ...state.currentProject,
            ...updates,
            updatedAt: Date.now(),
          },
        };
      }),

    deleteProject: () => set({ currentProject: null, currentPageId: null }),

    createPage: (name, slug) => {
      set((state) => {
        if (!state.currentProject) return state;
        
        const now = Date.now();
        const pageId = `page-${now}`;
        const newPage: Page = {
          id: pageId,
          name,
          slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
          title: name,
          description: '',
          componentIds: [],
          order: state.currentProject.pages.length,
        };

        return {
          currentProject: {
            ...state.currentProject,
            pages: [...state.currentProject.pages, newPage],
            updatedAt: now,
          },
        };
      });
    },

    updatePage: (pageId, updates) =>
      set((state) => {
        if (!state.currentProject) return state;
        return {
          currentProject: {
            ...state.currentProject,
            pages: state.currentProject.pages.map((page) =>
              page.id === pageId ? { ...page, ...updates } : page
            ),
            updatedAt: Date.now(),
          },
        };
      }),

    deletePage: (pageId) =>
      set((state) => {
        if (!state.currentProject) return state;
        const newPages = state.currentProject.pages.filter((p) => p.id !== pageId);
        const isCurrentPageDeleted = state.currentPageId === pageId;
        
        return {
          currentProject: {
            ...state.currentProject,
            pages: newPages,
            updatedAt: Date.now(),
          },
          currentPageId: isCurrentPageDeleted ? newPages[0]?.id || null : state.currentPageId,
        };
      }),

    setCurrentPage: (pageId) => set({ currentPageId: pageId }),

    getCurrentPage: () => {
      const { currentProject, currentPageId } = get();
      if (!currentProject || !currentPageId) return null;
      return currentProject.pages.find((p) => p.id === currentPageId) || null;
    },

    reorderPages: (pages) =>
      set((state) => {
        if (!state.currentProject) return state;
        return {
          currentProject: {
            ...state.currentProject,
            pages: pages.map((p, idx) => ({ ...p, order: idx })),
            updatedAt: Date.now(),
          },
        };
      }),
  }))
);
