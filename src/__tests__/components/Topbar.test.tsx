import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
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
                onExportImport={() => { }}
            />
        );
    });

    it('renders Export/Import dropdown and triggers callbacks', () => {
        const onExportImport = jest.fn();
        render(
            <Topbar
                preferFlat={false}
                onPreferFlatChange={() => { }}
                octaveSelectionMode={false}
                onOctaveSelectionModeChange={() => { }}
                onExport={() => { }}
                onOpenSettings={() => { }}
                onExportImport={onExportImport}
            />
        );
        // Dropdown button present
        const dropdownBtn = screen.getByRole('button', { name: /export\/import/i });
        expect(dropdownBtn).toBeInTheDocument();
        // Open dropdown
        fireEvent.click(dropdownBtn);
        // Options visible
        const exportOption = screen.getByRole('button', { name: /export data/i });
        const importOption = screen.getByRole('button', { name: /import data/i });
        expect(exportOption).toBeInTheDocument();
        expect(importOption).toBeInTheDocument();
        // Click Export Data
        fireEvent.click(exportOption);
        expect(onExportImport).toHaveBeenCalledWith('export');
        // Reopen and click Import Data
        fireEvent.click(dropdownBtn);
        fireEvent.click(importOption);
        expect(onExportImport).toHaveBeenCalledWith('import');
    });
}); 