import { seedStories } from '@dreamsprout/content';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { StoryCard } from '@/components/StoryCard';

describe('<StoryCard />', () => {
  it('shows the title, is accessible and pressable', async () => {
    const story = seedStories[0]!;
    const onPress = jest.fn();
    await render(<StoryCard story={story} onPress={onPress} progress={0.5} />);
    expect(screen.getByText(story.title)).toBeTruthy();
    const card = screen.getByTestId(`story-card-${story.id}`);
    expect(card.props.accessibilityLabel).toContain(story.title);
    await fireEvent.press(card);
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
