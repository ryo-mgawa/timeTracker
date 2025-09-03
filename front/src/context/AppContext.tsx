import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { 
  User, 
  Project, 
  Category, 
  Task, 
  TimeEntry 
} from 'types';

// アプリケーションの状態
interface AppState {
  readonly user: User | null;
  readonly projects: readonly Project[];
  readonly categories: readonly Category[];
  readonly tasks: readonly Task[];
  readonly timeEntries: readonly TimeEntry[];
  readonly selectedProject: Project | null;
  readonly selectedTask: Task | null;
  readonly selectedCategory: Category | null;
  readonly loading: boolean;
  readonly error: string | null;
}

// アクション定義（TypeScriptのディスクリミネート共用体を使用）
export type AppAction = 
  | { type: 'SET_USER'; payload: User }
  | { type: 'SET_PROJECTS'; payload: readonly Project[] }
  | { type: 'SET_CATEGORIES'; payload: readonly Category[] }
  | { type: 'SET_TASKS'; payload: readonly Task[] }
  | { type: 'ADD_TIME_ENTRY'; payload: TimeEntry }
  | { type: 'UPDATE_TIME_ENTRY'; payload: { id: string; entry: TimeEntry } }
  | { type: 'DELETE_TIME_ENTRY'; payload: string }
  | { type: 'SELECT_PROJECT'; payload: Project | null }
  | { type: 'SELECT_TASK'; payload: Task | null }
  | { type: 'SELECT_CATEGORY'; payload: Category | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };

// 初期状態
const initialState: AppState = {
  user: null,
  projects: [],
  categories: [],
  tasks: [],
  timeEntries: [],
  selectedProject: null,
  selectedTask: null,
  selectedCategory: null,
  loading: false,
  error: null,
};

// Reducer（純粋関数として実装）
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload };
    
    case 'SET_PROJECTS':
      return { ...state, projects: action.payload };
    
    case 'SET_CATEGORIES':
      return { ...state, categories: action.payload };
    
    case 'SET_TASKS':
      return { ...state, tasks: action.payload };
    
    case 'ADD_TIME_ENTRY':
      return { 
        ...state, 
        timeEntries: [...state.timeEntries, action.payload] 
      };
    
    case 'UPDATE_TIME_ENTRY':
      return {
        ...state,
        timeEntries: state.timeEntries.map(entry => 
          entry.id === action.payload.id ? action.payload.entry : entry
        )
      };
    
    case 'DELETE_TIME_ENTRY':
      return {
        ...state,
        timeEntries: state.timeEntries.filter(entry => entry.id !== action.payload)
      };
    
    case 'SELECT_PROJECT':
      return { 
        ...state, 
        selectedProject: action.payload,
        // プロジェクト変更時はタスクもリセット
        selectedTask: null
      };
    
    case 'SELECT_TASK':
      return { ...state, selectedTask: action.payload };
    
    case 'SELECT_CATEGORY':
      return { ...state, selectedCategory: action.payload };
    
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    
    default:
      return state;
  }
}

// Context型定義
interface AppContextType {
  readonly state: AppState;
  readonly dispatch: React.Dispatch<AppAction>;
}

// Context作成
const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider Props型
interface AppProviderProps {
  readonly children: ReactNode;
}

// Provider Component
export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const contextValue: AppContextType = {
    state,
    dispatch,
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

// Custom Hook（アーリーリターンパターン適用）
export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  
  return context;
};