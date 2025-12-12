import { waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { formSetup } from './client-utils';
import { toast } from 'react-toastify';

const mockedUseNavigate = vi.fn();

// Mocking the useNavigate hook from React Router DOM
vi.mock('react-router-dom', async () => {
  const mod = await vi.importActual('react-router-dom');
  return {
    ...mod,
    useNavigate: () => mockedUseNavigate,
  };
});

// Mock react-toastify's toast.promise
vi.mock('react-toastify', () => ({
  toast: {
    promise: vi.fn((promise, messages) => {
      return promise.then(
        (data) => {
          messages.success.render({ data });
          return data;
        },
        (error) => {
          messages.error.render({ error });
          throw error;
        }
      );
    }),
  },
}));

describe('Integration Tests : Signin Component', async () => {
  test('Signin : Sucess - Sucessfully sign in', async () => {
    const mockedToastPromise = toast.promise;
    const userActions = userEvent.setup();
    const { usernameInput, passwordInput, signinbuttonText } = await formSetup();

    await userActions.type(usernameInput, 'test@gmail.com');
    await userActions.type(passwordInput, 'Test@1234');
    await userActions.click(signinbuttonText);

    await waitFor(() => {
      expect(mockedToastPromise).toHaveBeenCalled();
      expect(mockedUseNavigate).toHaveBeenCalled();
    });
  });
});
