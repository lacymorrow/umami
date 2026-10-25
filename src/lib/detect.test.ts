import { expect, test } from 'vitest';
import { hasBlockedScreen } from './detect';
import { getIpAddress } from './ip';

const IP = '127.0.0.1';

test('getIpAddress: Custom header', () => {
  process.env.CLIENT_IP_HEADER = 'x-custom-ip-header';

  expect(getIpAddress(new Headers({ 'x-custom-ip-header': IP }))).toEqual(IP);
});

test('getIpAddress: CloudFlare header', () => {
  expect(getIpAddress(new Headers({ 'cf-connecting-ip': IP }))).toEqual(IP);
});

test('getIpAddress: Standard header', () => {
  expect(getIpAddress(new Headers({ 'x-forwarded-for': IP }))).toEqual(IP);
});

test('getIpAddress: No header', () => {
  expect(getIpAddress(new Headers())).toEqual(undefined);
});

test('hasBlockedScreen: unset env ignores every screen', () => {
  delete process.env.IGNORE_SCREEN;

  expect(hasBlockedScreen('1600x1600')).toEqual(false);
});

test('hasBlockedScreen: exact match', () => {
  process.env.IGNORE_SCREEN = '1600x1600';

  expect(hasBlockedScreen('1600x1600')).toEqual(true);
});

test('hasBlockedScreen: list, whitespace and case', () => {
  process.env.IGNORE_SCREEN = ' 1280x1200 , 1600X1600 ';

  expect(hasBlockedScreen('1280x1200')).toEqual(true);
  expect(hasBlockedScreen('1600x1600')).toEqual(true);
});

test('hasBlockedScreen: real resolutions pass', () => {
  process.env.IGNORE_SCREEN = '1280x1200,1600x1600';

  expect(hasBlockedScreen('1920x1080')).toEqual(false);
  expect(hasBlockedScreen('1280x1024')).toEqual(false);
  expect(hasBlockedScreen(undefined)).toEqual(false);
});
