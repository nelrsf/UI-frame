import {
  DEFAULT_WORKSPACE_SENTINEL,
  FALLBACK_WORKSPACE_ID,
  generateWorkspaceId,
  normalizeWorkspaceRoot,
  resolveWorkspaceId,
} from './workspace-id.util';

describe('workspace-id.util', () => {
  describe('constants', () => {
    it('FALLBACK_WORKSPACE_ID should equal ws-default', () => {
      expect(FALLBACK_WORKSPACE_ID).toBe('ws-default');
    });

    it('DEFAULT_WORKSPACE_SENTINEL should equal app://default-workspace', () => {
      expect(DEFAULT_WORKSPACE_SENTINEL).toBe('app://default-workspace');
    });
  });

  describe('normalizeWorkspaceRoot', () => {
    it('should convert backslashes to forward slashes', () => {
      expect(normalizeWorkspaceRoot('C:\\Users\\dev\\project')).toBe('c:/Users/dev/project');
    });

    it('should lowercase the Windows drive letter', () => {
      expect(normalizeWorkspaceRoot('D:/MyProject')).toBe('d:/MyProject');
    });

    it('should trim trailing forward slash', () => {
      expect(normalizeWorkspaceRoot('/home/user/project/')).toBe('/home/user/project');
    });

    it('should trim multiple trailing slashes', () => {
      expect(normalizeWorkspaceRoot('/home/user/project///')).toBe('/home/user/project');
    });

    it('should not alter a POSIX path with no trailing slash', () => {
      expect(normalizeWorkspaceRoot('/home/user/project')).toBe('/home/user/project');
    });

    it('should handle Windows path with backslashes and trailing slash', () => {
      expect(normalizeWorkspaceRoot('C:\\Projects\\app\\')).toBe('c:/Projects/app');
    });

    it('should lowercase only the drive letter and not other characters', () => {
      const result = normalizeWorkspaceRoot('C:/Users/Dev/Project');
      expect(result).toBe('c:/Users/Dev/Project');
    });

    it('should return empty string unchanged', () => {
      expect(normalizeWorkspaceRoot('')).toBe('');
    });
  });

  describe('generateWorkspaceId', () => {
    it('should return a string starting with ws-', async () => {
      const id = await generateWorkspaceId('/home/user/project');
      expect(id.startsWith('ws-')).toBeTrue();
    });

    it('should return exactly ws- followed by 16 hex characters', async () => {
      const id = await generateWorkspaceId('/home/user/project');
      expect(id).toMatch(/^ws-[0-9a-f]{16}$/);
    });

    it('should be deterministic for the same input', async () => {
      const id1 = await generateWorkspaceId('/home/user/project');
      const id2 = await generateWorkspaceId('/home/user/project');
      expect(id1).toBe(id2);
    });

    it('should produce different IDs for different inputs', async () => {
      const id1 = await generateWorkspaceId('/home/user/project-a');
      const id2 = await generateWorkspaceId('/home/user/project-b');
      expect(id1).not.toBe(id2);
    });
  });

  describe('resolveWorkspaceId', () => {
    it('should return FALLBACK_WORKSPACE_ID when no path is provided', async () => {
      expect(await resolveWorkspaceId()).toBe(FALLBACK_WORKSPACE_ID);
    });

    it('should return FALLBACK_WORKSPACE_ID for null path', async () => {
      expect(await resolveWorkspaceId(null)).toBe(FALLBACK_WORKSPACE_ID);
    });

    it('should return FALLBACK_WORKSPACE_ID for empty string', async () => {
      expect(await resolveWorkspaceId('')).toBe(FALLBACK_WORKSPACE_ID);
    });

    it('should return a ws- prefixed id for a non-empty path', async () => {
      const id = await resolveWorkspaceId('/home/user/project');
      expect(id).toMatch(/^ws-[0-9a-f]{16}$/);
    });

    it('should normalize the path before hashing', async () => {
      const id1 = await resolveWorkspaceId('/home/user/project/');
      const id2 = await resolveWorkspaceId('/home/user/project');
      expect(id1).toBe(id2);
    });

    it('should normalize Windows paths before hashing', async () => {
      const id1 = await resolveWorkspaceId('C:\\Users\\dev\\project');
      const id2 = await resolveWorkspaceId('c:/Users/dev/project');
      expect(id1).toBe(id2);
    });
  });
});
