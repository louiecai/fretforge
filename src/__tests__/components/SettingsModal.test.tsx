import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import React from 'react';
import SettingsModal from '../../components/SettingsModal';

describe('SettingsModal', () => {
    it('renders without crashing', () => {
        render(
            <SettingsModal
                open={true}
                onClose={() => { }}
                numFrets={22}
                onNumFretsChange={() => { }}
                preferFlat={false}
                onPreferFlatChange={() => { }}
                numStrings={6}
                onNumStringsChange={() => { }}
                tuning={['E2,A2,D3,G3', 'B3', 'E4']}
                onTuningChange={() => { }}
                blendOverlaps={false}
                onBlendOverlapsChange={() => { }}
                showFretMarkers={true}
                onShowFretMarkersChange={() => { }}
                tritoneLabel="♭5"
                onTritoneLabelChange={() => { }}
            />
        );
    });
    // TODO: Add tests for settings changes and modal interactions
}); 