import { fireEvent, render, screen } from '@testing-library/react-native';
import { HighlightedText } from '@/components/HighlightedText';
import { tokenize } from '@/features/player/timing';

const timings: [number, number, string][] = [
  [0, 0.3, 'Hello'],
  [0.4, 0.3, 'little'],
  [0.8, 0.3, 'star'],
];

describe('<HighlightedText />', () => {
  it('renders every word and reports taps for seeking', async () => {
    const onWord = jest.fn();
    const tokens = tokenize('Hello little star.', timings);
    await render(<HighlightedText tokens={tokens} activeToken={1} mode="word" onWordPress={onWord} />);
    expect(screen.getByText(/little/)).toBeTruthy();
    await fireEvent.press(screen.getByTestId('word-2'));
    expect(onWord).toHaveBeenCalledWith(2);
  });

  it('highlights the active word in word mode', async () => {
    const tokens = tokenize('Hello little star.', timings);
    await render(<HighlightedText tokens={tokens} activeToken={1} mode="word" />);
    const style = [screen.getByTestId('word-1').props.style].flat(3).filter(Boolean) as { color?: string }[];
    expect(style.some((s) => s.color === '#FFD66B')).toBe(true);
  });
});
