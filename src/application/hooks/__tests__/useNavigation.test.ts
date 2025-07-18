/**
 * Tests para el hook useNavigation
 * Hook crítico para navegación programática
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useNavigation } from '../useNavigation';
import { ROUTES } from '../../navigation/routes';

// Mock de react-router
const mockNavigate = vi.fn();
vi.mock('react-router', () => ({
  useNavigate: () => mockNavigate
}));

describe('useNavigation Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Funciones de navegación básicas', () => {
    it('navega al login correctamente', () => {
      const { result } = renderHook(() => useNavigation());
      
      result.current.goToLogin();
      
      expect(mockNavigate).toHaveBeenCalledWith(ROUTES.LOGIN);
      expect(mockNavigate).toHaveBeenCalledTimes(1);
    });

    it('navega al dashboard correctamente', () => {
      const { result } = renderHook(() => useNavigation());
      
      result.current.goToDashboard();
      
      expect(mockNavigate).toHaveBeenCalledWith(ROUTES.DASHBOARD);
      expect(mockNavigate).toHaveBeenCalledTimes(1);
    });

    it('navega a la lección correctamente', () => {
      const { result } = renderHook(() => useNavigation());
      
      result.current.goToLesson();
      
      expect(mockNavigate).toHaveBeenCalledWith(ROUTES.LESSON);
      expect(mockNavigate).toHaveBeenCalledTimes(1);
    });

    it('navega hacia atrás correctamente', () => {
      const { result } = renderHook(() => useNavigation());
      
      result.current.goBack();
      
      expect(mockNavigate).toHaveBeenCalledWith(-1);
      expect(mockNavigate).toHaveBeenCalledTimes(1);
    });
  });

  describe('Navegación genérica', () => {
    it('navega a una ruta específica usando goTo', () => {
      const { result } = renderHook(() => useNavigation());
      
      result.current.goTo(ROUTES.LOGIN);
      
      expect(mockNavigate).toHaveBeenCalledWith(ROUTES.LOGIN);
      expect(mockNavigate).toHaveBeenCalledTimes(1);
    });

    it('navega a diferentes rutas usando goTo', () => {
      const { result } = renderHook(() => useNavigation());
      
      // Test múltiples rutas
      result.current.goTo(ROUTES.DASHBOARD);
      result.current.goTo(ROUTES.LESSON);
      result.current.goTo(ROUTES.LOGIN);
      
      expect(mockNavigate).toHaveBeenNthCalledWith(1, ROUTES.DASHBOARD);
      expect(mockNavigate).toHaveBeenNthCalledWith(2, ROUTES.LESSON);
      expect(mockNavigate).toHaveBeenNthCalledWith(3, ROUTES.LOGIN);
      expect(mockNavigate).toHaveBeenCalledTimes(3);
    });
  });

  describe('Estructura del hook', () => {
    it('retorna todas las funciones de navegación esperadas', () => {
      const { result } = renderHook(() => useNavigation());
      
      expect(result.current).toHaveProperty('goToLogin');
      expect(result.current).toHaveProperty('goToDashboard');
      expect(result.current).toHaveProperty('goToLesson');
      expect(result.current).toHaveProperty('goBack');
      expect(result.current).toHaveProperty('goTo');
      
      // Verificar que son funciones
      expect(typeof result.current.goToLogin).toBe('function');
      expect(typeof result.current.goToDashboard).toBe('function');
      expect(typeof result.current.goToLesson).toBe('function');
      expect(typeof result.current.goBack).toBe('function');
      expect(typeof result.current.goTo).toBe('function');
    });

    it('mantiene la misma referencia de funciones entre renders', () => {
      const { result, rerender } = renderHook(() => useNavigation());
      
      const firstRender = {
        goToLogin: result.current.goToLogin,
        goToDashboard: result.current.goToDashboard,
        goToLesson: result.current.goToLesson,
        goBack: result.current.goBack,
        goTo: result.current.goTo
      };
      
      rerender();
      
      // Las funciones deben mantener la misma referencia
      expect(result.current.goToLogin).toBe(firstRender.goToLogin);
      expect(result.current.goToDashboard).toBe(firstRender.goToDashboard);
      expect(result.current.goToLesson).toBe(firstRender.goToLesson);
      expect(result.current.goBack).toBe(firstRender.goBack);
      expect(result.current.goTo).toBe(firstRender.goTo);
    });
  });

  describe('Integración con constantes de rutas', () => {
    it('usa las constantes ROUTES correctamente', () => {
      const { result } = renderHook(() => useNavigation());
      
      // Verificar que se usan las constantes y no strings hardcodeados
      result.current.goToLogin();
      result.current.goToDashboard();
      result.current.goToLesson();
      
      expect(mockNavigate).toHaveBeenCalledWith(ROUTES.LOGIN);
      expect(mockNavigate).toHaveBeenCalledWith(ROUTES.DASHBOARD);
      expect(mockNavigate).toHaveBeenCalledWith(ROUTES.LESSON);
    });
  });

  describe('Casos de uso comunes', () => {
    it('permite navegación secuencial', () => {
      const { result } = renderHook(() => useNavigation());
      
      // Simular flujo de navegación típico
      result.current.goToLogin();
      result.current.goToDashboard();
      result.current.goToLesson();
      result.current.goBack();
      
      expect(mockNavigate).toHaveBeenCalledTimes(4);
      expect(mockNavigate).toHaveBeenNthCalledWith(1, ROUTES.LOGIN);
      expect(mockNavigate).toHaveBeenNthCalledWith(2, ROUTES.DASHBOARD);
      expect(mockNavigate).toHaveBeenNthCalledWith(3, ROUTES.LESSON);
      expect(mockNavigate).toHaveBeenNthCalledWith(4, -1);
    });

    it('maneja múltiples instancias del hook independientemente', () => {
      const { result: result1 } = renderHook(() => useNavigation());
      const { result: result2 } = renderHook(() => useNavigation());
      
      result1.current.goToLogin();
      result2.current.goToDashboard();
      
      expect(mockNavigate).toHaveBeenCalledTimes(2);
      expect(mockNavigate).toHaveBeenNthCalledWith(1, ROUTES.LOGIN);
      expect(mockNavigate).toHaveBeenNthCalledWith(2, ROUTES.DASHBOARD);
    });
  });

  describe('Manejo de errores', () => {
    it('no falla si navigate lanza un error', () => {
      mockNavigate.mockImplementationOnce(() => {
        throw new Error('Navigation error');
      });
      
      const { result } = renderHook(() => useNavigation());
      
      // No debería lanzar error
      expect(() => {
        result.current.goToLogin();
      }).toThrow('Navigation error');
      
      expect(mockNavigate).toHaveBeenCalledWith(ROUTES.LOGIN);
    });
  });

  describe('TypeScript types', () => {
    it('acepta solo rutas válidas en goTo', () => {
      const { result } = renderHook(() => useNavigation());
      
      // Estas llamadas deben compilar sin errores de TypeScript
      result.current.goTo(ROUTES.LOGIN);
      result.current.goTo(ROUTES.DASHBOARD);
      result.current.goTo(ROUTES.LESSON);
      
      expect(mockNavigate).toHaveBeenCalledTimes(3);
    });
  });
});