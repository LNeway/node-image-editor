import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { ReactFlowProvider } from 'reactflow';
import CustomEdge from '../../src/components/canvas/CustomEdge';

describe('CustomEdge', () => {
  const defaultProps = {
    id: 'edge-1',
    sourceX: 0,
    sourceY: 0,
    targetX: 100,
    targetY: 100,
    sourcePosition: 'right' as const,
    targetPosition: 'left' as const,
    selected: false,
  };

  it('should render edge path', () => {
    const { container } = render(
      <ReactFlowProvider>
        <svg>
          <CustomEdge {...defaultProps} />
        </svg>
      </ReactFlowProvider>
    );

    const path = container.querySelector('.react-flow__edge-path');
    expect(path).toBeTruthy();
  });

  it('should apply selected styles when selected is true', () => {
    const { container } = render(
      <ReactFlowProvider>
        <svg>
          <CustomEdge {...defaultProps} selected={true} />
        </svg>
      </ReactFlowProvider>
    );

    const path = container.querySelector('.react-flow__edge-path');
    expect(path).toBeTruthy();
    
    const style = path?.getAttribute('style');
    expect(style).toContain('stroke-width: 3');
    expect(style).toContain('rgb(255, 107, 107)');
  });

  it('should apply default styles when selected is false', () => {
    const { container } = render(
      <ReactFlowProvider>
        <svg>
          <CustomEdge {...defaultProps} selected={false} />
        </svg>
      </ReactFlowProvider>
    );

    const path = container.querySelector('.react-flow__edge-path');
    expect(path).toBeTruthy();
    
    const style = path?.getAttribute('style');
    expect(style).toContain('stroke-width: 2');
    expect(style).toContain('rgb(0, 184, 148)');
  });
});
