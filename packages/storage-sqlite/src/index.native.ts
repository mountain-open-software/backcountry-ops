import { openDatabaseAsync } from 'expo-sqlite';
import { createSqliteJournal } from './journal.js';
export const sqliteStorage = createSqliteJournal(openDatabaseAsync);
