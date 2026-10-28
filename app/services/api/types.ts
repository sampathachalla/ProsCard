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

export type MediaKind = 'profilePhoto' | 'coverPhoto' | 'companyLogo' | 'contactCard';
export type MediaScope = 'profile' | 'card' | 'contact';
export type MediaStatus = 'pending' | 'ready' | 'cleanup_failed';

export type MediaUploadRequest = {
  kind: MediaKind;
  scope?: MediaScope;
  cardId?: string;
  contactId?: string;
  fileName: string;
  contentType: string;
  sizeBytes?: number;
};

export type MediaUploadTicket = {
  mediaId: string;
  kind: MediaKind;
  scope: MediaScope;
  cardId?: string;
  contactId?: string;
  status: MediaStatus;
  objectName: string;
  method: 'PUT';
  headers: Record<string, string>;
  url: string;
  expiresAt?: string;
};

export type DynamicTagTheme = {
  id: string;
  name: string;
  tag: 'Business' | 'Personal' | 'Networking' | 'Portfolio';
  gradient: [string, string];
  surfaceColor: string;
  backgroundColor: string;
  textColor: string;
  mutedTextColor: string;
  accentColor: string;
  fontStyle: 'modern' | 'classic' | 'rounded' | 'mono';
  paletteTier: 3;
  paletteColors: string[];
  customThemeName: string;
};

export type LogoPalette = {
  dominant: string;
  secondary: string;
  accent: string;
  hasDarkElements: boolean;
  hasLightElements: boolean;
  suggestedGradient: [string, string];
  suggestedSurface: string;
  logoBackground?: string;
  isDarkRecommended: boolean;
  tagThemes?: Record<'Business' | 'Personal' | 'Networking' | 'Portfolio', DynamicTagTheme>;
  paletteSource?: 'llm' | 'deterministic';
};

export type ConfirmedMedia = {
  mediaId: string;
  kind: MediaKind;
  scope: MediaScope;
  cardId?: string | null;
  contactId?: string | null;
  status: 'ready';
  profileField?: 'photoUrl' | 'coverPhotoUrl' | 'companyLogoUrl';
  cardField?: 'profilePhoto' | 'coverPhoto' | 'logo';
  contactField?: 'cardImageUrl';
  contentUrl: string;
  replacedMediaId?: string;
  cleanupPending: boolean;
  palette?: LogoPalette;
};
