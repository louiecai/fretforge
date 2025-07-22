import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import SaveLoadConfirmModal, { SaveLoadConfirmModalProps } from '../../components/SaveLoadConfirmModal';

describe('SaveLoadConfirmModal', () => {
    const baseScales = [
        { scale: 'Major', root: 'C', color: '#FF0000' },
        { scale: 'Minor', root: 'A', color: '#00FF00' },
    ];
    const baseOverrides = { C: '#FF0000', D: '#00FF00' };

    it('renders in export mode and allows toggling', () => {
        const onConfirm = jest.fn();
        render(
            <SaveLoadConfirmModal
                open={true}
                mode="export"
                scales={baseScales}
                noteOverrides={baseOverrides}
                onClose={() => { }}
                onCancel={() => { }}
                onConfirm={onConfirm}
            />
        );
        // Scales checkboxes
        const scaleCheckboxes = screen.getAllByRole('checkbox');
        expect(scaleCheckboxes.length).toBe(3); // 2 scales + note overrides
        // Uncheck first scale
        fireEvent.click(scaleCheckboxes[0]);
        // Uncheck note overrides
        fireEvent.click(scaleCheckboxes[2]);
        // Confirm
        fireEvent.click(screen.getByRole('button', { name: /export/i }));
        expect(onConfirm).toHaveBeenCalledWith({
            selectedScales: [1],
            includeNoteOverrides: false,
            overrideOnImport: undefined,
            importData: undefined,
        });
    });

    it('renders in import mode and allows toggling', () => {
        const onConfirm = jest.fn();
        const importData = { scales: baseScales, noteOverrides: baseOverrides };
        render(
            <SaveLoadConfirmModal
                open={true}
                mode="import"
                scales={[]}
                noteOverrides={{}}
                onClose={() => { }}
                onCancel={() => { }}
                onConfirm={onConfirm}
                importData={importData}
            />
        );
        // Scales checkboxes
        const scaleCheckboxes = screen.getAllByRole('checkbox');
        expect(scaleCheckboxes.length).toBe(3); // 2 scales + note overrides
        // Uncheck second scale
        fireEvent.click(scaleCheckboxes[1]);
        // Confirm
        fireEvent.click(screen.getByRole('button', { name: /import/i }));
        expect(onConfirm).toHaveBeenCalledWith({
            selectedScales: [0],
            includeNoteOverrides: true,
            overrideOnImport: true,
            importData,
        });
    });
}); 