import { useState, useEffect } from 'react';
import type { GameSettings } from '../types/game';

interface SavedWordList {
  id: string;
  name: string;
  settings: GameSettings;
  createdAt: number;
}

export const useSavedWordLists = (isOpen: boolean) => {
  const [savedLists, setSavedLists] = useState<SavedWordList[]>([]);
  const [showSaveListModal, setShowSaveListModal] = useState(false);
  const [showLoadListModal, setShowLoadListModal] = useState(false);
  const [listNameInput, setListNameInput] = useState('');
  const [selectedListId, setSelectedListId] = useState<string | null>(null);

  // Load saved lists from localStorage when modal opens
  useEffect(() => {
    if (isOpen) {
      const savedListsJson = localStorage.getItem('wordSearchSavedLists');
      if (savedListsJson) {
        try {
          const lists = JSON.parse(savedListsJson);
          setSavedLists(lists);
        } catch (e) {
          console.error('Failed to parse saved lists:', e);
        }
      }
    }
  }, [isOpen]);

  // Save leaderboard to localStorage when it changes
  useEffect(() => {
    if (savedLists.length > 0) {
      localStorage.setItem('wordSearchSavedLists', JSON.stringify(savedLists));
    }
  }, [savedLists]);

  const saveCustomList = (settings: GameSettings) => {
    if (!listNameInput.trim()) return;

    const newList: SavedWordList = {
      id: selectedListId || Date.now().toString(),
      name: listNameInput,
      settings,
      createdAt: Date.now()
    };

    const updatedLists = selectedListId
      ? savedLists.map(list => list.id === selectedListId ? newList : list)
      : [...savedLists, newList];

    setSavedLists(updatedLists);
    setShowSaveListModal(false);
    setListNameInput('');
    setSelectedListId(null);
  };

  const deleteCustomList = (id: string) => {
    const updatedLists = savedLists.filter(list => list.id !== id);
    setSavedLists(updatedLists);
  };

  return {
    savedLists,
    showSaveListModal,
    setShowSaveListModal,
    showLoadListModal,
    setShowLoadListModal,
    listNameInput,
    setListNameInput,
    selectedListId,
    setSelectedListId,
    saveCustomList,
    deleteCustomList
  };
};