import { IMealRepository } from './types';
import { LocalStorageAdapter } from './local-storage-adapter';
import { GoogleSheetsAdapter } from './google-sheets-adapter';

let instance: IMealRepository | null = null;

export function getRepository(): IMealRepository {
  if (!instance) {
    // Si estamos en el navegador, LocalStorageAdapter inicializa inmediatamente
    instance = new LocalStorageAdapter();
  }
  return instance;
}

export function setRepositoryAdapter(type: 'local' | 'sheets'): IMealRepository {
  if (type === 'sheets') {
    instance = new GoogleSheetsAdapter();
  } else {
    instance = new LocalStorageAdapter();
  }
  return instance;
}
