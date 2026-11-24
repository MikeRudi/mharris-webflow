export const workflowFields = [
  ['desktop', 'Desktop'],
  ['mobile', 'Mobile'],
  ['missingContent', 'Missing content'],
  ['complete', 'Complete'],
];

// Existing approvals carry across; new checkboxes never infer approval.
export function normalizePage(page) {
  page.desktop ??= false;
  page.mobile ??= false;
  page.missingContent ??= page.awaitingContent ?? page.status === 'awaiting-content';
  page.complete = Boolean(page.complete ?? page.status === 'complete') || page.clientsHands === true;
  delete page.designReady;
  delete page.workingInWebflow;
  delete page.awaitingContent;
  delete page.clientsHands;
  return page;
}

export function normalizeProject(project) {
  project.pages.forEach(normalizePage);
  project.schemaVersion = 3;
  return project;
}
