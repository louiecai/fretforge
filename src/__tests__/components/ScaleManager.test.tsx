import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import React from 'react';
import ScaleManager from '../../components/ScaleManager';

describe('ScaleManager', () => {
    it('renders without crashing', () => {
        render(
            <ScaleManager
                scales={[]}
                onScalesChange={() => { }}
            />
        );
    });
    // TODO: Add tests for adding, editing, and removing scales/chords
}); 