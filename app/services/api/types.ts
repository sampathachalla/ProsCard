export type ApiUser = {
  id: string;
  username: string;
};

export type AuthSession = {
  user: ApiUser;
  token?: string;
  refreshToken?: string;
  emailConfirmationRequired: boolean;
};

export type ApiErrorPayload = {
  message?: string;
  issues?: unknown;
};

export type EntityMetadata = {
  userId: string;
  updatedAt: string;
};

export type OnboardingState<TDraft> = {
  draft: TDraft;
  completed: boolean;
  completedAt: string | null;
  updatedAt?: string;
};

export type MediaKind = 'profilePhoto' | 'coverPhoto' | 'companyLogo';
export type MediaScope = 'profile' | 'card';
export type MediaStatus = 'pending' | 'ready' | 'cleanup_failed';

export type MediaUploadRequest = {
  kind: MediaKind;
  scope?: MediaScope;
  cardId?: string;
  fileName: string;
  contentType: string;
  sizeBytes?: number;
};

export type MediaUploadTicket = {
  mediaId: string;
  kind: MediaKind;
  scope: MediaScope;
  cardId?: string;
  status: MediaStatus;
  objectName: string;
  method: 'PUT';
  headers: Record<string, string>;
  url: string;
  expiresAt?: string;
};

export type ConfirmedMedia = {
  mediaId: string;
  kind: MediaKind;
  scope: MediaScope;
  cardId?: string | null;
  status: 'ready';
  profileField?: 'photoUrl' | 'coverPhotoUrl' | 'companyLogoUrl';
  cardField?: 'profilePhoto' | 'coverPhoto' | 'logo';
  contentUrl: string;
  replacedMediaId?: string;
  cleanupPending: boolean;
};
