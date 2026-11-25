export const workflowSchemaVersion = 4;

export const workflowFields = [
  ['desktop', 'Dev Desktop'],
  ['mobile', 'Dev Mobile'],
  ['monti', 'Monti'],
  ['scott', 'Scott'],
  ['complete', 'Complete'],
];

// Approvals are explicit checkbox values, never inferred from historical status.
export function normalizePage(page) {
  for (const [field] of workflowFields) page[field] ??= false;
  delete page.missingContent;
  delete page.designReady;
  delete page.workingInWebflow;
  delete page.awaitingContent;
  delete page.clientsHands;
  return page;
}

export function normalizeProject(project) {
  project.pages.forEach(normalizePage);
  project.schemaVersion = workflowSchemaVersion;
  return project;
}
