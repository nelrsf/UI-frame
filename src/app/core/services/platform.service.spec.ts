import { TestBed } from '@angular/core/testing';
import { PlatformService, PlatformServiceStub } from './platform.service';
import { PlatformAdapter } from '../infrastructure/electron/adapters/platform.adapter';
import { PlatformName } from '../application/ports/platform.port';

/**
 * Creates a minimal `PlatformAdapter` stand-in that satisfies the structural
 * interface consumed by `PlatformService`.  Using a single `as PlatformAdapter`
 * cast is intentional: we only need the four properties that the service reads.
 */
function makeAdapter(platform: PlatformName): PlatformAdapter {
  return {
    platform,
    get isWindows() { return platform === 'win32'; },
    get isMac() { return platform === 'darwin'; },
    get isLinux() { return platform === 'linux'; },
  } as PlatformAdapter;
}

describe('PlatformService', () => {
  function setup(platform: PlatformName): PlatformService {
    TestBed.configureTestingModule({
      providers: [
        PlatformService,
        { provide: PlatformAdapter, useValue: makeAdapter(platform) },
      ],
    });
    return TestBed.inject(PlatformService);
  }

  afterEach(() => TestBed.resetTestingModule());

  describe('platform — win32', () => {
    let service: PlatformService;
    beforeEach(() => { service = setup('win32'); });

    it('should expose platform as win32', () => {
      expect(service.platform).toBe('win32');
    });

    it('isWindows should be true', () => {
      expect(service.isWindows).toBeTrue();
    });

    it('isMac should be false', () => {
      expect(service.isMac).toBeFalse();
    });

    it('isLinux should be false', () => {
      expect(service.isLinux).toBeFalse();
    });
  });

  describe('platform — darwin', () => {
    let service: PlatformService;
    beforeEach(() => { service = setup('darwin'); });

    it('should expose platform as darwin', () => {
      expect(service.platform).toBe('darwin');
    });

    it('isMac should be true', () => {
      expect(service.isMac).toBeTrue();
    });

    it('isWindows should be false', () => {
      expect(service.isWindows).toBeFalse();
    });

    it('isLinux should be false', () => {
      expect(service.isLinux).toBeFalse();
    });
  });

  describe('platform — linux', () => {
    let service: PlatformService;
    beforeEach(() => { service = setup('linux'); });

    it('should expose platform as linux', () => {
      expect(service.platform).toBe('linux');
    });

    it('isLinux should be true', () => {
      expect(service.isLinux).toBeTrue();
    });

    it('isWindows should be false', () => {
      expect(service.isWindows).toBeFalse();
    });

    it('isMac should be false', () => {
      expect(service.isMac).toBeFalse();
    });
  });

  describe('PlatformServiceStub', () => {
    it('should default to linux when no platform provided', () => {
      const stub = new PlatformServiceStub();
      expect(stub.platform).toBe('linux');
      expect(stub.isLinux).toBeTrue();
    });

    it('should correctly set flags for win32', () => {
      const stub = new PlatformServiceStub('win32');
      expect(stub.isWindows).toBeTrue();
      expect(stub.isMac).toBeFalse();
      expect(stub.isLinux).toBeFalse();
    });
  });
});
