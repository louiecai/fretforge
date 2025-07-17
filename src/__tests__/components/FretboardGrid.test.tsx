import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import React from 'react';
import FretboardGrid from '../../components/FretboardGrid';
import { Note } from '../../lib/Note';

describe('FretboardGrid', () => {
    it('renders without crashing', () => {
        const board = [
            [new Note(0, 0, 4), new Note(2, 0, 4)],
            [new Note(4, 0, 4), new Note(5, 0, 4)]
        ];
        render(
            <FretboardGrid
                board={board}
                highlightedNotes={{}}
                preferFlat={false}
                onNoteHoverStart={() => { }}
                onNoteHoverEnd={() => { }}
            />
        );
    });
    // TODO: Add tests for note highlighting, selection, and interaction
}); 