export type SetoranType = 'ziyadah' | 'murajaah' | 'tasmi';

export type GradeType = 'mumtaz' | 'jayyid_jiddan' | 'jayyid' | 'maqbul' | 'rasib';

export type JuzStatus = 'belum' | 'proses' | 'mutqin';

export type UserRole = 'admin' | 'ustadz' | 'wali';

export interface AuthSession {
  role: UserRole;
  userId?: string;
  name: string;
  detail?: string;
  santriId?: string;
}

export interface UstadzAccount {
  id: string;
  name: string;
  username: string;
  password: string;
  halaqah: string;
}

export interface Santri {
  id: string;
  nis: string;
  name: string;
  gender: 'L' | 'P';
  halaqah: string;
  targetJuz: number;
  juzStatusMap: Record<number, JuzStatus>;
  totalMutqinJuz: number;
  currentSurah: string;
  currentAyah: number;
  guardianName: string;
  guardianPhone: string;
  ustadzName: string;
  avatarColor: string;
  joinedDate: string;
  notes?: string;
}

export interface SetoranRecord {
  id: string;
  santriId: string;
  santriName: string;
  timestamp: string; // ISO string
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  type: SetoranType;
  surahNumber: number;
  surahName: string;
  ayahStart: number;
  ayahEnd: number;
  juz: number;
  page?: number;
  grade: GradeType;
  makhrajScore: number; // 1-5
  tajwidScore: number; // 1-5
  kelancaranScore: number; // 1-5
  ustadzName: string;
  notes: string;
  verifiedByGuardian: boolean;
  guardianComment?: string;
  guardianCommentDate?: string;
}

export interface SurahItem {
  number: number;
  nameArabic: string;
  nameLatin: string;
  meaning: string;
  totalAyah: number;
  juz: number;
}

export interface GoogleSyncConfig {
  isConnected: boolean;
  userEmail: string | null;
  accessToken: string | null;
  spreadsheetId: string | null;
  spreadsheetUrl: string | null;
  lastSyncedAt: string | null;
  isSyncing: boolean;
  error?: string | null;
}
