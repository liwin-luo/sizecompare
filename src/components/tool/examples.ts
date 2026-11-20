/**
 * Ready-made example comparisons — grasp the product in one click.
 * Every example's objects share the stated attribute.
 */

import type { AttributeKey } from '../../lib/attributes';

export interface Example {
  id: string;
  title: string;
  prompt: string;
  libraryIds: string[];
  attr?: AttributeKey;
}

export const EXAMPLES: Example[] = [
  {
    id: 'elephant-vs-adult',
    title: 'How tall is an elephant really?',
    prompt: 'How many of you, standing on each other, would be as tall as this elephant?',
    libraryIds: ['elephant', 'adult', 'child'],
    attr: 'height',
  },
  {
    id: 'whale-vs-elephant',
    title: 'Who tips the scale?',
    prompt: 'How many elephants weigh as much as one blue whale?',
    libraryIds: ['bluewhale', 'elephant'],
    attr: 'weight',
  },
  {
    id: 'pencil-vs-eraser',
    title: 'Longer or shorter?',
    prompt: 'Which one is longer? About how many erasers fit along the pencil?',
    libraryIds: ['pencil', 'eraser'],
    attr: 'length',
  },
  {
    id: 'balls-and-apple',
    title: 'Same size or not?',
    prompt: 'Which is wider — the basketball or the apple? What about the tennis ball?',
    libraryIds: ['basketball', 'apple', 'tennisball'],
    attr: 'diameter',
  },
];
