import { useRouter } from 'expo-router';

type AppRouter = ReturnType<typeof useRouter>;

type NavigateToCardEditorOptions = {
  cardId?: string;
  create?: boolean;
};

/** Opens the shared add/edit card form from any navigator (tabs, card detail, etc.). */
export function navigateToCardEditor(router: AppRouter, options: NavigateToCardEditorOptions = {}) {
  if (options.create) {
    router.push({
      pathname: '/card-editor',
      params: { create: '1', session: Date.now().toString() },
    });
    return;
  }

  if (options.cardId) {
    router.push({
      pathname: '/card-editor',
      params: { cardId: options.cardId },
    });
    return;
  }

  router.push('/card-editor');
}

/** Run navigation after a bottom sheet closes so the transition is not swallowed. */
export function navigateToCardEditorAfterSheet(
  router: AppRouter,
  options: NavigateToCardEditorOptions = {},
  delayMs = 280,
) {
  setTimeout(() => navigateToCardEditor(router, options), delayMs);
}
