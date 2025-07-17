import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import React from 'react';
import Topbar from '../../components/Topbar';

describe('Topbar', () => {
    it('renders without crashing', () => {
        render(
            <Topbar
                preferFlat={false}
                onPreferFlatChange={() => { }}
                octaveSelectionMode={false}
                onOctaveSelectionModeChange={() => { }}
                onExport={() => { }}
                onOpenSettings={() => { }}
            />
        );
    });
    // TODO: Add tests for toggles and export/settings actions
}); 