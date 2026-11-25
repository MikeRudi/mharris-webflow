import { workflowFields, workflowSchemaVersion } from '../workflow.mjs';

const fields = workflowFields.map(([field]) => field);

export class ChecklistError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.status = status;
  }
}

export function createChecklistStore({ project, read, write, isConflict }) {
  const defaults = Object.fromEntries(project.pages.map(page => [page.id,
    Object.fromEntries(fields.map(field => [field, page[field] === true]))]));

  function validate(change) {
    if (!change || typeof change !== 'object' || Array.isArray(change) ||
        Object.keys(change).length !== 3 || typeof change.pageId !== 'string' ||
        !Object.hasOwn(defaults, change.pageId) || !fields.includes(change.field) ||
        typeof change.value !== 'boolean') {
      throw new ChecklistError('Choose a valid page, checkbox and value.');
    }
  }

  function mergeDefaults(saved) {
    if (saved && (saved.schemaVersion !== 1 || !Number.isSafeInteger(saved.revision) ||
        !saved.pages || typeof saved.pages !== 'object')) {
      throw new ChecklistError('Shared checklist could not be read. Please try again.', 503);
    }
    const state = saved ? structuredClone(saved) : {
      schemaVersion: 1, revision: 0, updatedAt: project.updatedAt, pages: {},
    };
    // New exports can add pages, but never overwrite saved shared checkboxes.
    for (const [id, values] of Object.entries(defaults)) {
      if (!Object.hasOwn(state.pages, id)) state.pages[id] = { ...values };
      for (const field of fields) {
        if (typeof state.pages[id][field] !== 'boolean') {
          throw new ChecklistError('Shared checklist could not be read. Please try again.', 503);
        }
      }
    }
    return state;
  }

  function publicState(state) {
    return { schemaVersion: workflowSchemaVersion, revision: state.revision, updatedAt: state.updatedAt,
      pages: Object.fromEntries(Object.keys(defaults).map(id => [id, state.pages[id]])) };
  }

  async function transact(change, isUpdate = false) {
    if (isUpdate) validate(change);
    for (let attempt = 0; attempt < 8; attempt++) {
      const current = await read();
      const state = mergeDefaults(current?.state);
      if (current && (!change || state.pages[change.pageId][change.field] === change.value)) {
        return publicState(state);
      }
      if (change) state.pages[change.pageId][change.field] = change.value;
      state.revision++;
      state.updatedAt = new Date().toISOString();
      try {
        await write(state, current?.etag);
        return publicState(state);
      } catch (error) {
        // Re-read and merge only this checkbox if another visitor saved first.
        if (!isConflict(error)) throw error;
      }
    }
    throw new ChecklistError('Someone else is saving. Please try this checkbox again.', 409);
  }

  return { get: () => transact(), update: change => transact(change, true) };
}
