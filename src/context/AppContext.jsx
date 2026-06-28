import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Initial state
const initialState = {
  workbook: null,
  sheetNames: [],
  activeSheet: '',
  parsedData: {},
  analyzedData: null,
  fileName: '',
  fileSize: 0,
  
  currentView: 'upload', // upload, dashboard, report, chat, settings
  sidebarCollapsed: false,
  
  aiReport: null,
  aiReportLoading: false,
  chatHistory: [],
  chatLoading: false,
  
  settings: {
    geminiApiKey: import.meta.env.VITE_GEMINI_API_KEY || '',
    maskPersonalInfo: false,
    darkMode: true,
  }
};

// Action types
const SET_FILE_DATA = 'SET_FILE_DATA';
const SET_ACTIVE_SHEET = 'SET_ACTIVE_SHEET';
const SET_ANALYZED_DATA = 'SET_ANALYZED_DATA';
const SET_CURRENT_VIEW = 'SET_CURRENT_VIEW';
const TOGGLE_SIDEBAR = 'TOGGLE_SIDEBAR';
const SET_AI_REPORT = 'SET_AI_REPORT';
const SET_AI_REPORT_LOADING = 'SET_AI_REPORT_LOADING';
const ADD_CHAT_MESSAGE = 'ADD_CHAT_MESSAGE';
const SET_CHAT_LOADING = 'SET_CHAT_LOADING';
const UPDATE_SETTINGS = 'UPDATE_SETTINGS';
const RESET_ALL = 'RESET_ALL';
const LOAD_SAVED_STATE = 'LOAD_SAVED_STATE';

// Reducer
const appReducer = (state, action) => {
  switch (action.type) {
    case LOAD_SAVED_STATE:
      return { ...state, ...action.payload };
    case SET_FILE_DATA:
      return {
        ...state,
        workbook: action.payload.workbook,
        sheetNames: action.payload.sheetNames,
        parsedData: action.payload.parsedData,
        fileName: action.payload.fileName,
        fileSize: action.payload.fileSize,
        activeSheet: action.payload.sheetNames[0] || '',
        currentView: 'dashboard',
        aiReport: null,
        chatHistory: []
      };
    case SET_ACTIVE_SHEET:
      return { ...state, activeSheet: action.payload };
    case SET_ANALYZED_DATA:
      return { ...state, analyzedData: action.payload };
    case SET_CURRENT_VIEW:
      return { ...state, currentView: action.payload };
    case TOGGLE_SIDEBAR:
      return { ...state, sidebarCollapsed: !state.sidebarCollapsed };
    case SET_AI_REPORT:
      return { ...state, aiReport: action.payload };
    case SET_AI_REPORT_LOADING:
      return { ...state, aiReportLoading: action.payload };
    case ADD_CHAT_MESSAGE:
      return { ...state, chatHistory: [...state.chatHistory, action.payload] };
    case SET_CHAT_LOADING:
      return { ...state, chatLoading: action.payload };
    case UPDATE_SETTINGS:
      const newSettings = { ...state.settings, ...action.payload };
      localStorage.setItem('ai-excel-settings', JSON.stringify(newSettings));
      return { ...state, settings: newSettings };
    case RESET_ALL:
      return { 
        ...initialState, 
        settings: state.settings,
        sidebarCollapsed: state.sidebarCollapsed 
      };
    default:
      return state;
  }
};

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load saved settings and history on mount
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem('ai-excel-settings');
      const savedChat = localStorage.getItem('ai-excel-chat');
      
      const payload = {};
      if (savedSettings) {
        payload.settings = { ...initialState.settings, ...JSON.parse(savedSettings) };
      }
      if (savedChat) {
        payload.chatHistory = JSON.parse(savedChat);
      }
      
      if (Object.keys(payload).length > 0) {
        dispatch({ type: LOAD_SAVED_STATE, payload });
      }
    } catch (e) {
      console.error("Error loading state", e);
    }
  }, []);

  // Sync settings with DOM (dark mode)
  useEffect(() => {
    if (state.settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state.settings.darkMode]);

  // Save chat to localstorage when it changes
  useEffect(() => {
    if (state.chatHistory.length > 0) {
      localStorage.setItem('ai-excel-chat', JSON.stringify(state.chatHistory));
    }
  }, [state.chatHistory]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

export {
  SET_FILE_DATA, SET_ACTIVE_SHEET, SET_ANALYZED_DATA, SET_CURRENT_VIEW, 
  TOGGLE_SIDEBAR, SET_AI_REPORT, SET_AI_REPORT_LOADING, ADD_CHAT_MESSAGE, 
  SET_CHAT_LOADING, UPDATE_SETTINGS, RESET_ALL
};
