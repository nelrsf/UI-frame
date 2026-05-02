import { TestBed } from '@angular/core/testing';
import { WorkspaceSessionService } from './workspace-session.service';
import { WorkspaceSession, WORKSPACE_SESSION_SCHEMA_VERSION } from '../models/workspace-session.model';
import { DockZone } from '../models/dock-zone-assignment.model';

const MINIMAL_SESSION: WorkspaceSession = {
  workspaceId: 'ws-test',
  schemaVersion: WORKSPACE_SESSION_SCHEMA_VERSION,
  savedAt: '2026-01-01T00:00:00.000Z',
  zoneAssignments: [],
  activeTabPerZone: {},
  tabs: [],
  dimensions: {
    sidebarWidth: 240,
    bottomPanelHeight: 200,
    secondaryPanelWidth: 300,
  },
};

describe('WorkspaceSessionService', () => {
  let service: WorkspaceSessionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WorkspaceSessionService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // ---------------------------------------------------------------------------
  // currentSession
  // ---------------------------------------------------------------------------

  describe('currentSession', () => {
    it('should be null before any operation', () => {
      expect(service.currentSession).toBeNull();
    });
  });

  // ---------------------------------------------------------------------------
  // session$ observable
  // ---------------------------------------------------------------------------

  describe('session$ observable', () => {
    it('should emit null as the initial value', (done) => {
      service.session$.subscribe((session) => {
        expect(session).toBeNull();
        done();
      });
    });

    it('should emit the saved session after save()', (done) => {
      const emissions: (WorkspaceSession | null)[] = [];
      service.session$.subscribe((s) => emissions.push(s));

      service.save(MINIMAL_SESSION);

      const last = emissions[emissions.length - 1];
      expect(last).not.toBeNull();
      expect(last!.workspaceId).toBe('ws-test');
      done();
    });

    it('should emit null after clear() for the active workspace', (done) => {
      service.save(MINIMAL_SESSION);

      const emissions: (WorkspaceSession | null)[] = [];
      service.session$.subscribe((s) => emissions.push(s));

      service.clear('ws-test');

      const last = emissions[emissions.length - 1];
      expect(last).toBeNull();
      done();
    });
  });

  // ---------------------------------------------------------------------------
  // save
  // ---------------------------------------------------------------------------

  describe('save', () => {
    it('should persist the session to localStorage', () => {
      service.save(MINIMAL_SESSION);
      const raw = localStorage.getItem(service.storageKey('ws-test'));
      expect(raw).not.toBeNull();
    });

    it('should overwrite savedAt with the current timestamp', () => {
      service.save(MINIMAL_SESSION);
      const raw = localStorage.getItem(service.storageKey('ws-test'))!;
      const stored: WorkspaceSession = JSON.parse(raw);
      expect(stored.savedAt).not.toBe(MINIMAL_SESSION.savedAt);
      expect(new Date(stored.savedAt).getTime()).toBeGreaterThan(0);
    });

    it('should update currentSession after save', () => {
      service.save(MINIMAL_SESSION);
      expect(service.currentSession).not.toBeNull();
      expect(service.currentSession!.workspaceId).toBe('ws-test');
    });

    it('should persist tabs and zoneAssignments', () => {
      const sessionWithData: WorkspaceSession = {
        ...MINIMAL_SESSION,
        tabs: [
          {
            tabId: 'tab-1',
            viewId: 'editor',
            zone: DockZone.PrimaryWorkspace,
            groupId: 'group-main',
            pinned: false,
            closable: true,
          },
        ],
        zoneAssignments: [
          {
            tabGroupId: 'group-main',
            zone: DockZone.PrimaryWorkspace,
            visible: true,
          },
        ],
        activeTabPerZone: { [DockZone.PrimaryWorkspace]: 'tab-1' },
      };

      service.save(sessionWithData);

      const raw = localStorage.getItem(service.storageKey('ws-test'))!;
      const stored: WorkspaceSession = JSON.parse(raw);
      expect(stored.tabs.length).toBe(1);
      expect(stored.tabs[0].tabId).toBe('tab-1');
      expect(stored.zoneAssignments[0].zone).toBe(DockZone.PrimaryWorkspace);
      expect(stored.activeTabPerZone[DockZone.PrimaryWorkspace]).toBe('tab-1');
    });
  });

  // ---------------------------------------------------------------------------
  // restore
  // ---------------------------------------------------------------------------

  describe('restore', () => {
    it('should return null when no session has been persisted', () => {
      const result = service.restore('ws-unknown');
      expect(result).toBeNull();
    });

    it('should emit null on session$ when nothing is stored', (done) => {
      const emissions: (WorkspaceSession | null)[] = [];
      service.session$.subscribe((s) => emissions.push(s));

      service.restore('ws-unknown');

      expect(emissions[emissions.length - 1]).toBeNull();
      done();
    });

    it('should restore a previously saved session', () => {
      service.save(MINIMAL_SESSION);

      // Create a fresh service instance to simulate a new app start.
      const service2 = new WorkspaceSessionService();
      const restored = service2.restore('ws-test');

      expect(restored).not.toBeNull();
      expect(restored!.workspaceId).toBe('ws-test');
    });

    it('should emit the restored session on session$', (done) => {
      service.save(MINIMAL_SESSION);

      const service2 = new WorkspaceSessionService();
      const emissions: (WorkspaceSession | null)[] = [];
      service2.session$.subscribe((s) => emissions.push(s));

      service2.restore('ws-test');

      const last = emissions[emissions.length - 1];
      expect(last).not.toBeNull();
      done();
    });

    it('should return null for corrupt JSON', () => {
      localStorage.setItem(service.storageKey('ws-corrupt'), '{ invalid json }');
      const result = service.restore('ws-corrupt');
      expect(result).toBeNull();
    });

    it('should return null when schema version mismatches', () => {
      const badEnvelope = { ...MINIMAL_SESSION, workspaceId: 'ws-bad', schemaVersion: 0 };
      localStorage.setItem(service.storageKey('ws-bad'), JSON.stringify(badEnvelope));
      const result = service.restore('ws-bad');
      expect(result).toBeNull();
    });

    it('should return null when workspaceId mismatches the storage key scope', () => {
      // Save under 'ws-a' key, try to restore as 'ws-b'.
      const session = { ...MINIMAL_SESSION, workspaceId: 'ws-a' };
      localStorage.setItem(service.storageKey('ws-b'), JSON.stringify(session));
      const result = service.restore('ws-b');
      expect(result).toBeNull();
    });

    it('should return null when tabs field is missing', () => {
      const incomplete = { ...MINIMAL_SESSION } as Record<string, unknown>;
      delete incomplete['tabs'];
      localStorage.setItem(service.storageKey('ws-test'), JSON.stringify(incomplete));
      const result = service.restore('ws-test');
      expect(result).toBeNull();
    });

    it('should return null when dimensions field is missing', () => {
      const incomplete = { ...MINIMAL_SESSION } as Record<string, unknown>;
      delete incomplete['dimensions'];
      localStorage.setItem(service.storageKey('ws-test'), JSON.stringify(incomplete));
      const result = service.restore('ws-test');
      expect(result).toBeNull();
    });
  });

  // ---------------------------------------------------------------------------
  // clear
  // ---------------------------------------------------------------------------

  describe('clear', () => {
    it('should remove the persisted session from localStorage', () => {
      service.save(MINIMAL_SESSION);
      service.clear('ws-test');
      expect(localStorage.getItem(service.storageKey('ws-test'))).toBeNull();
    });

    it('should emit null on session$ when clearing the active workspace', () => {
      service.save(MINIMAL_SESSION);

      const emissions: (WorkspaceSession | null)[] = [];
      service.session$.subscribe((s) => emissions.push(s));

      service.clear('ws-test');
      expect(emissions[emissions.length - 1]).toBeNull();
    });

    it('should not emit on session$ when clearing a different workspace', () => {
      service.save(MINIMAL_SESSION);

      const emissions: (WorkspaceSession | null)[] = [];
      service.session$.subscribe((s) => emissions.push(s));
      const countBefore = emissions.length;

      service.clear('ws-other');
      expect(emissions.length).toBe(countBefore);
    });
  });

  // ---------------------------------------------------------------------------
  // storageKey
  // ---------------------------------------------------------------------------

  describe('storageKey', () => {
    it('should include the workspaceId and schema version', () => {
      const key = service.storageKey('ws-abc');
      expect(key).toContain('ws-abc');
      expect(key).toContain(String(WORKSPACE_SESSION_SCHEMA_VERSION));
    });
  });

  // ---------------------------------------------------------------------------
  // workspace isolation
  // ---------------------------------------------------------------------------

  describe('workspace isolation', () => {
    it('should keep sessions isolated per workspaceId', () => {
      const sessionA: WorkspaceSession = {
        ...MINIMAL_SESSION,
        workspaceId: 'ws-a',
        dimensions: { sidebarWidth: 100, bottomPanelHeight: 100, secondaryPanelWidth: 100 },
      };
      const sessionB: WorkspaceSession = {
        ...MINIMAL_SESSION,
        workspaceId: 'ws-b',
        dimensions: { sidebarWidth: 200, bottomPanelHeight: 200, secondaryPanelWidth: 200 },
      };

      service.save(sessionA);
      service.save(sessionB);

      const service2 = new WorkspaceSessionService();
      const restoredA = service2.restore('ws-a');
      expect(restoredA!.dimensions.sidebarWidth).toBe(100);

      const service3 = new WorkspaceSessionService();
      const restoredB = service3.restore('ws-b');
      expect(restoredB!.dimensions.sidebarWidth).toBe(200);
    });
  });
});
