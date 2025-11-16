import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Local Video Player', () => {
  render(<App />);
  const titleElement = screen.getByText(/Local Video Player/i);
  expect(titleElement).toBeInTheDocument();
});
