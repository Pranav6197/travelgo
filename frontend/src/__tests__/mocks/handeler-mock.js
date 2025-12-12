// src/mocks/handlers.js
import { http, HttpResponse } from 'msw';

export const handlers = [
  http.post('*/api/auth/email-password/signup', () => {
    return new HttpResponse(null, {
      status: 200,
    });
  }),
  http.post('*/api/auth/email-password/signin', () => {
    return new HttpResponse(
      JSON.stringify({
        data: {
          token: 'fake-token',
          user: { id: '1', name: 'Test User', role: 'USER' },
        },
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }),
];
