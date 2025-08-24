import { Schema } from '@powersync/web';

export const baseSchema = new Schema({});

baseSchema.withRawTables({
  TodoList: {
    put: {
      sql: 'INSERT OR REPLACE INTO TodoList (id, name, description, createdAt, updatedAt, userId, color) VALUES (?, ?, ?, ?, ?, ?, ?)',
      params: [
        'Id',
        { Column: 'name' },
        { Column: 'description' },
        { Column: 'createdAt' },
        { Column: 'updatedAt' },
        { Column: 'userId' },
        { Column: 'color' },
      ],
    },
    delete: {
      sql: 'DELETE FROM TodoList WHERE id = ?',
      params: ['Id'],
    },
  },
  Todo: {
    put: {
      sql: 'INSERT OR REPLACE INTO Todo (id, title, description, completed, createdAt, updatedAt, userId, priority, todoListId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      params: [
        'Id',
        { Column: 'title' },
        { Column: 'description' },
        { Column: 'completed' },
        { Column: 'createdAt' },
        { Column: 'updatedAt' },
        { Column: 'userId' },
        { Column: 'priority' },
        { Column: 'todoListId' },
      ],
    },
    delete: {
      sql: 'DELETE FROM Todo WHERE id = ?',
      params: ['Id'],
    },
  },
});

export const createRawTableSQL = `
  CREATE TABLE IF NOT EXISTS TodoList (
    id TEXT NOT NULL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL,
    userId TEXT NOT NULL,
    color TEXT DEFAULT '#3B82F6'
  ) STRICT;

  CREATE TABLE IF NOT EXISTS Todo (
    id TEXT NOT NULL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    completed INTEGER NOT NULL DEFAULT 0,
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL,
    userId TEXT NOT NULL,
    priority INTEGER NOT NULL DEFAULT 1,
    todoListId TEXT NOT NULL,
    FOREIGN KEY (todoListId) REFERENCES TodoList(id) ON DELETE CASCADE
  ) STRICT;
`;