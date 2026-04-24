import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, afterEach, type Mock } from 'vitest';
import AppLayout from './Applayout';

// ---------- MOCK react-redux ----------
vi.mock('react-redux', () => ({
  useSelector: vi.fn(),
}));

import { useSelector } from 'react-redux';

// ---------- MOCK CHILD COMPONENTS ----------
vi.mock('../Sidebar/Sidebar', () => ({
  __esModule: true,
  default: ({ user }: { user: { role: string } }) => (
    <div data-testid="sidebar">Sidebar - {user.role}</div>
  ),
}));

vi.mock('../TopNavBar/TopNavBar', () => ({
  __esModule: true,
  default: ({
    userName,
    userRole,
  }: {
    userName: string;
    userRole: string;
  }) => (
    <div data-testid="top-navbar">
      {userName} - {userRole}
    </div>
  ),
}));

vi.mock('react-router-dom', () => ({
  Outlet: () => <div data-testid="outlet" />,
}));

describe('AppLayout', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('returns null when user is not present', () => {
    (useSelector as unknown as Mock).mockImplementation((selector: (state: { auth: { user: null }; ui: { sidebarCollapsed: boolean } }) => unknown) =>
      selector({
        auth: { user: null },
        ui: { sidebarCollapsed: false },
      })
    );

    const { container } = render(<AppLayout />);
    expect(container.firstChild).toBeNull();
  });

  it('renders layout when user is present', () => {
    const mockUser = {
      id: '1',
      username: 'Vamsi',
      role: 'Pharmacist',
      avatarUrl: 'avatar.png',
    };

    (useSelector as unknown as Mock).mockImplementation((selector: (state: { auth: { user: typeof mockUser }; ui: { sidebarCollapsed: boolean } }) => unknown) =>
      selector({
        auth: { user: mockUser },
        ui: { sidebarCollapsed: false },
      })
    );

    render(<AppLayout />);

    expect(screen.getByTestId('top-navbar')).toHaveTextContent(
      'Vamsi - Pharmacist'
    );
    expect(screen.getByTestId('sidebar')).toHaveTextContent('Pharmacist');
    expect(screen.getByTestId('outlet')).toBeInTheDocument();
  });
});
