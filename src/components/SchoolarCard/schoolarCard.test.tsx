import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { SchoolarProvider, useSchoolar } from '@/SchoolarContext.tsx';
import SchoolarCard from './index.tsx';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const mockSetSchoolar = vi.fn();

// Mock the entire `@/SchoolarContext.tsx` module
vi.mock('@/SchoolarContext.tsx', async () => {
  const actual = await vi.importActual('@/SchoolarContext.tsx');
  return {
    ...actual,
    useSchoolar: vi.fn(), // Explicitly mock `useSchoolar`
    SchoolarProvider: actual.SchoolarProvider,
  };
});

describe('SchoolarCard', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: 3,
          refetchOnWindowFocus: false,
          staleTime: 100000,
        },
      },
    });
    vi.clearAllMocks();
  });

  const renderComponent = () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <SchoolarProvider>
            <SchoolarCard />
          </SchoolarProvider>
        </MemoryRouter>
      </QueryClientProvider>
    );
  };

  it('should navigate to "/" if schoolar is null', () => {
    // Mock `useSchoolar` to return null for schoolar
    (useSchoolar as ReturnType<typeof vi.fn>).mockReturnValue({
      schoolar: null, // schoolar is null
      setSchoolar: mockSetSchoolar,
    });

    renderComponent();

    // Check if navigate is called with '/'
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('should render the schoolar details when schoolar is provided', () => {
    // Mock `useSchoolar` to return a schoolar object with some properties
    (useSchoolar as ReturnType<typeof vi.fn>).mockReturnValue({
      schoolar: {
        FirstName: null, // Default FirstName is 'John'
        LastName: 'Samantha',
        SecondName: null, // Default SecondName is 'Doe'
      },
      setSchoolar: mockSetSchoolar,
    });

    renderComponent();

    // Check if the correct details are rendered
    expect(screen.getByText('John')).toBeInTheDocument(); // default for FirstName
    expect(screen.getByText('Samantha')).toBeInTheDocument(); // LastName
    expect(screen.getByText('Doe')).toBeInTheDocument(); // default for SecondName
  });

  it('should call setSchoolar and navigate to "/" when back button is clicked', () => {
    // Mock `useSchoolar` to return a schoolar object
    (useSchoolar as ReturnType<typeof vi.fn>).mockReturnValue({
      schoolar: {
        FirstName: 'John',
        LastName: 'Doe',
        SecondName: 'Smith',
      },
      setSchoolar: mockSetSchoolar,
    });

    renderComponent();

    // Simulate back button click
    const backButton = screen.getByText('< Назад');
    fireEvent.click(backButton);

    // Check if `setSchoolar` was called with null and navigate to '/'
    expect(mockSetSchoolar).toHaveBeenCalledWith(null);
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });
});