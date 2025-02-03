import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SchoolarCard from './index.tsx';
import { useSchoolar } from '@/SchoolarContext.tsx';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('@/SchoolarContext.tsx', () => ({
  useSchoolar: vi.fn(),
}));

describe('SchoolarCard', () => {
  const mockSetSchoolar = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    (useSchoolar as ReturnType<typeof vi.fn>).mockReturnValue({
      schoolar: {
        FirstName: 'John',
        LastName: 'Doe',
        SecondName: 'Smith',
      },
      setSchoolar: mockSetSchoolar,
    });
  });

  it('renders the component with schoolar data', () => {
    render(<SchoolarCard />);

    expect(screen.getByText('John')).toBeInTheDocument();
    expect(screen.getByText('Doe')).toBeInTheDocument();
    expect(screen.getByText('Smith')).toBeInTheDocument();

    // Проверяем, что кнопка "Назад" отображается
    expect(screen.getByText('< Назад')).toBeInTheDocument();
  });

  it('redirects to home if schoolar is not provided', () => {
    (useSchoolar as ReturnType<typeof vi.fn>).mockReturnValue({
      schoolar: null,
      setSchoolar: mockSetSchoolar,
    });

    render(<SchoolarCard />);

    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('calls setSchoolar and navigates to home on back button click', () => {
    render(<SchoolarCard />);

    const backButton = screen.getByText('< Назад');
    fireEvent.click(backButton);

    expect(mockSetSchoolar).toHaveBeenCalledWith(null);
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('renders default values if schoolar data is missing', () => {
    (useSchoolar as ReturnType<typeof vi.fn>).mockReturnValue({
      schoolar: {
        FirstName: null,
        LastName: 'Samatha',
        SecondName: null,
      },
      setSchoolar: mockSetSchoolar,
    });

    render(<SchoolarCard />);

    expect(screen.getByText('John')).toBeInTheDocument();
    expect(screen.getByText('Samatha')).toBeInTheDocument();
    expect(screen.getByText('Doe')).toBeInTheDocument();
  });
});