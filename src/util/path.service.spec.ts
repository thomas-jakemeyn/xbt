import * as path from 'path';
import { Test } from '@nestjs/testing';
import { NodeService } from 'src/adapter/node.service';
import { PathService } from './path.service';

describe('PathService', () => {
  let pathService: PathService;

  beforeAll(async () => {
    const app = await Test.createTestingModule({
      providers: [NodeService, PathService],
    }).compile();
    pathService = app.get(PathService);
  });

  describe('distance()', () => {
    it('should return 0 when the paths are the same', () => {
      const path1 = buildPath('projects', 'xbt');
      expect(pathService.distance({ path1, path2: path1 })).toBe(0);
    });

    it('should return null when no path is a descendent of the other', () => {
      const path1 = buildPath('projects', 'xbt', 'dist');
      const path2 = buildPath('projects', 'xbt', 'src');
      expect(pathService.distance({ path1, path2 })).toBe(null);
    });

    it('should return 1 for a directory and a file in that directory', () => {
      const path1 = buildPath('projects', 'xbt');
      const path2 = buildPath('projects', 'xbt', 'package.json');
      expect(pathService.distance({ path1, path2 })).toBe(1);
    });

    it('should return 2 for a directory and its grand-parent', () => {
      const path1 = buildPath('projects', 'xbt', 'src', 'config');
      const path2 = buildPath('projects', 'xbt');
      expect(pathService.distance({ path1, path2 })).toBe(2);
    });
  });

  describe('findClosest()', () => {
    it('should return the closest ancestor', () => {
      const expected = { dir: buildPath('projects', 'monorepo', 'web', 'app') };
      expect(pathService.findClosest({
        path: buildPath('projects', 'monorepo', 'web', 'app', 'package.json'),
        candidates: [
          expected,
          { dir: buildPath('projects', 'monorepo', 'web') },
          { dir: buildPath('projects', 'monorepo', 'data') },
          { dir: buildPath('projects', 'monorepo') },
        ],
      })).toBe(expected);
    });

    it('should return null when none of the candidates is an ancestor', () => {
      expect(pathService.findClosest({
        path: buildPath('projects', 'monorepo', 'web', 'app', 'package.json'),
        candidates: [
          { dir: buildPath('projects', 'monorepo', 'data') },
          { dir: buildPath('projects', 'monorepo', 'api') },
        ],
      })).toBe(null);
    });
  });

  function buildPath(...parts: string[]) {
    return path.join(...parts);
  }
});
