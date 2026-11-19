import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AppLayout from '../components/Layout';

describe('AppLayout Component', () => {
  it('renders application title and navigation items', () => {
    render(
      <BrowserRouter>
        <AppLayout>
          <div>Child Content</div>
        </AppLayout>
      </BrowserRouter>,
    );

    expect(screen.getByText('SalarySight')).toBeInTheDocument();
    expect(screen.getByText('Employees')).toBeInTheDocument();
    expect(screen.getByText('Child Content')).toBeInTheDocument();
  });
});
