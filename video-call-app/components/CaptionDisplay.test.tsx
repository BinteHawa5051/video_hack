import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import * as fc from 'fast-check';
import CaptionDisplay from './CaptionDisplay';
import { Caption } from '@/types';

describe('CaptionDisplay', () => {
  // Feature: video-call-live-captions, Property 23: Caption display in designated area
  // Validates: Requirements 7.1
  it('should display all captions in the designated caption area', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            id: fc.uuid(),
            text: fc.string({ minLength: 1, maxLength: 100 }),
            originalText: fc.string({ minLength: 1, maxLength: 100 }),
            speaker: fc.constantFrom('local' as const, 'remote' as const),
            timestamp: fc.integer({ min: Date.now() - 10000, max: Date.now() }),
            language: fc.constantFrom('en', 'es', 'fr', 'de'),
            isTranslated: fc.boolean(),
          }),
          { minLength: 0, maxLength: 10 }
        ),
        (captions: Caption[]) => {
          const { container } = render(<CaptionDisplay captions={captions} />);

          // Verify the designated caption area exists
          const captionArea = container.querySelector('.w-full.bg-gray-900.rounded-lg');
          expect(captionArea).toBeTruthy();

          if (captions.length === 0) {
            // When no captions, should show placeholder message
            expect(screen.getByText('Captions will appear here...')).toBeTruthy();
          } else {
            // All captions should be displayed
            captions.forEach((caption) => {
              // Each caption text should be in the document
              expect(screen.getByText(caption.text)).toBeTruthy();
            });

            // Verify speaker indicators are present
            const localCaptions = captions.filter((c) => c.speaker === 'local');
            const remoteCaptions = captions.filter((c) => c.speaker === 'remote');

            // Count "You" indicators for local captions
            const youIndicators = screen.queryAllByText('You');
            expect(youIndicators.length).toBe(localCaptions.length);

            // Count "Remote" indicators for remote captions
            const remoteIndicators = screen.queryAllByText('Remote');
            expect(remoteIndicators.length).toBe(remoteCaptions.length);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should display translated captions with original text when isTranslated is true', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            id: fc.uuid(),
            text: fc.string({ minLength: 1, maxLength: 100 }),
            originalText: fc.string({ minLength: 1, maxLength: 100 }),
            speaker: fc.constantFrom('local' as const, 'remote' as const),
            timestamp: fc.integer({ min: Date.now() - 10000, max: Date.now() }),
            language: fc.constantFrom('en', 'es', 'fr', 'de'),
            isTranslated: fc.constant(true), // Always translated
          }),
          { minLength: 1, maxLength: 5 }
        ),
        (captions: Caption[]) => {
          render(<CaptionDisplay captions={captions} />);

          // All captions should show both translated text and original text
          captions.forEach((caption) => {
            expect(screen.getByText(caption.text)).toBeTruthy();
            expect(screen.getByText(`Original: ${caption.originalText}`)).toBeTruthy();
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should apply correct styling for local vs remote captions', () => {
    const localCaption: Caption = {
      id: '1',
      text: 'Local caption',
      originalText: 'Local caption',
      speaker: 'local',
      timestamp: Date.now(),
      language: 'en',
      isTranslated: false,
    };

    const remoteCaption: Caption = {
      id: '2',
      text: 'Remote caption',
      originalText: 'Remote caption',
      speaker: 'remote',
      timestamp: Date.now(),
      language: 'en',
      isTranslated: false,
    };

    const { container } = render(<CaptionDisplay captions={[localCaption, remoteCaption]} />);

    // Find caption containers
    const captionContainers = container.querySelectorAll('.border-l-4');
    expect(captionContainers.length).toBe(2);

    // Local caption should have blue border
    const localContainer = captionContainers[0];
    expect(localContainer.className).toContain('border-blue-500');

    // Remote caption should have green border
    const remoteContainer = captionContainers[1];
    expect(remoteContainer.className).toContain('border-green-500');
  });

  // Feature: video-call-live-captions, Property 26: Caption list management at capacity
  // Validates: Requirements 7.4
  it('should limit visible captions and remove oldest when capacity is reached', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 5, max: 20 }), // maxCaptions
        fc.integer({ min: 0, max: 30 }), // number of captions to generate
        (maxCaptions, captionCount) => {
          // Generate captions with sequential timestamps
          const captions: Caption[] = Array.from({ length: captionCount }, (_, i) => ({
            id: `caption-${i}`,
            text: `Caption ${i}`,
            originalText: `Caption ${i}`,
            speaker: (i % 2 === 0 ? 'local' : 'remote') as 'local' | 'remote',
            timestamp: Date.now() + i * 1000, // Sequential timestamps
            language: 'en',
            isTranslated: false,
          }));

          const { container } = render(
            <CaptionDisplay captions={captions} maxCaptions={maxCaptions} />
          );

          // Count displayed captions
          const displayedCaptions = container.querySelectorAll('.border-l-4');
          const expectedCount = Math.min(captionCount, maxCaptions);
          expect(displayedCaptions.length).toBe(expectedCount);

          if (captionCount > maxCaptions) {
            // When over capacity, should show only the most recent captions
            // The oldest captions should be removed
            const firstOldCaption = captions[0];
            expect(screen.queryByText(firstOldCaption.text)).toBeNull();

            // The newest captions should be visible
            const lastCaption = captions[captions.length - 1];
            expect(screen.getByText(lastCaption.text)).toBeTruthy();
          } else if (captionCount > 0) {
            // When under capacity, all captions should be visible
            captions.forEach((caption) => {
              expect(screen.getByText(caption.text)).toBeTruthy();
            });
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should keep most recent captions when list exceeds maximum', () => {
    const maxCaptions = 5;
    const captions: Caption[] = Array.from({ length: 10 }, (_, i) => ({
      id: `caption-${i}`,
      text: `Caption ${i}`,
      originalText: `Caption ${i}`,
      speaker: 'local',
      timestamp: Date.now() + i * 1000,
      language: 'en',
      isTranslated: false,
    }));

    render(<CaptionDisplay captions={captions} maxCaptions={maxCaptions} />);

    // First 5 captions should NOT be visible
    expect(screen.queryByText('Caption 0')).toBeNull();
    expect(screen.queryByText('Caption 1')).toBeNull();
    expect(screen.queryByText('Caption 2')).toBeNull();
    expect(screen.queryByText('Caption 3')).toBeNull();
    expect(screen.queryByText('Caption 4')).toBeNull();

    // Last 5 captions SHOULD be visible
    expect(screen.getByText('Caption 5')).toBeTruthy();
    expect(screen.getByText('Caption 6')).toBeTruthy();
    expect(screen.getByText('Caption 7')).toBeTruthy();
    expect(screen.getByText('Caption 8')).toBeTruthy();
    expect(screen.getByText('Caption 9')).toBeTruthy();
  });
});
