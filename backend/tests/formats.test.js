import request from 'supertest';
import express from 'express';
import { jest } from '@jest/globals';

describe('/api/formats', () => {
  let testApp, app, exec;
  beforeAll(async () => {
    jest.unstable_mockModule('child_process', () => ({
      exec: jest.fn(),
    }));
    ({ default: app } = await import('../index.js'));
    ({ exec } = await import('child_process'));
    testApp = express();
    testApp.use(express.json());
    testApp.use('/', app);
  });

  it('should return 400 if url is missing', async () => {
    const res = await request(testApp).get('/api/formats');
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Missing url parameter');
  });

  it('should parse yt-dlp output and return formats', async () => {
    exec.mockImplementation((cmd, opts, cb) => {
      const fakeStdout = `format code  extension  resolution note\n251          webm       audio only tiny  123k , webm_dash\n18           mp4        640x360    360p , 500k , 1.2MiB\n22           mp4        1280x720   720p , 2.3MiB\n`;
      cb(null, fakeStdout, '');
    });
    const res = await request(testApp).get('/api/formats?url=https://test');
    expect(res.status).toBe(200);
    expect(res.body.formats).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: '18', ext: 'mp4', resolution: '640x360', size: '1.2MiB' }),
        expect.objectContaining({ code: '22', ext: 'mp4', resolution: '1280x720', size: '2.3MiB' })
      ])
    );
    exec.mockReset();
  });
});
