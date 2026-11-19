/**
 * Ready-made example comparisons — a teacher should grasp the product in
 * one click, before typing anything.
 */

export interface Example {
  id: string;
  title: string;
  prompt: string;
  libraryIds: string[];
}

export const EXAMPLES: Example[] = [
  {
    id: 'elephant-vs-mouse',
    title: 'How tall is an elephant really?',
    prompt: 'How many mice would it take to be as tall as this elephant?',
    libraryIds: ['animal-elephant-african', 'animal-mouse'],
  },
  {
    id: 'giraffe-child-adult',
    title: 'Taller than a grown-up?',
    prompt: 'Who is tallest? Who is shortest? How much taller is the giraffe than the adult?',
    libraryIds: ['animal-giraffe', 'reference-adult', 'reference-child-8yr'],
  },
  {
    id: 'pencil-vs-eraser',
    title: 'Longer or shorter?',
    prompt: 'Which one is longer? About how many erasers fit along the pencil?',
    libraryIds: ['classroom-pencil', 'classroom-eraser'],
  },
  {
    id: 'balls-and-apple',
    title: 'Same size or not?',
    prompt: 'Which is wider — the basketball or the apple? What about the tennis ball?',
    libraryIds: ['everyday-basketball', 'everyday-apple', 'everyday-tennisball'],
  },
];
