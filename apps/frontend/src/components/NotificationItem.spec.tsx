import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { App } from '../app/app';

describe('Test Notifications Page', () => {
  it('should render successfully', () => {
    // Just in case
    render(
      <MemoryRouter initialEntries={['/notifications']}>
        <App />
      </MemoryRouter>
    );
  });
});
