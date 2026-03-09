import { LibraryPoem } from './types';

export const PUBLIC_DOMAIN_POEMS: LibraryPoem[] = [
  {
    id: '1',
    title: 'Daffodils',
    author: 'William Wordsworth',
    content: `I wandered lonely as a cloud
That floats on high o'er vales and hills,
When all at once I saw a crowd,
A host, of golden daffodils;
Beside the lake, beneath the trees,
Fluttering and dancing in the breeze.

Continuous as the stars that shine
And twinkle on the milky way,
They stretched in never-ending line
Along the margin of a bay:
Ten thousand saw I at a glance,
Tossing their heads in sprightly dance.`,
    description: 'One of the most famous works of British Romanticism, exploring the relationship between nature and the human imagination.',
    category: 'Nature',
    themeBreakdown: 'The poem focuses on the healing power of nature and the "inward eye" of memory. The daffodils serve as a metaphor for unexpected joy and the enduring impact of natural beauty.'
  },
  {
    id: '2',
    title: 'Ozymandias',
    author: 'Percy Bysshe Shelley',
    content: `I met a traveller from an antique land,
Who said—“Two vast and trunkless legs of stone
Stand in the desert. . . . Near them, on the sand,
Half sunk a shattered visage lies, whose frown,
And wrinkled lip, and sneer of cold command,
Tell that its sculptor well those passions read
Which yet survive, stamped on these lifeless things,
The hand that mocked them, and the heart that fed;
And on the pedestal, these words appear:
My name is Ozymandias, King of Kings;
Look on my Works, ye Mighty, and despair!
Nothing beside remains. Round the decay
Of that colossal Wreck, boundless and bare
The lone and level sands stretch far away.`,
    description: 'A powerful sonnet about the inevitable decline of all leaders and empires, no matter how great.',
    category: 'Classic',
    themeBreakdown: 'Themes of transience, the power of art over political might, and the hubris of man. The "shattered visage" contrasts with the boastful words on the pedestal.'
  },
  {
    id: '3',
    title: 'Bright Star',
    author: 'John Keats',
    content: `Bright star, would I were stedfast as thou art—
Not in lone splendour hung aloft the night
And watching, with eternal lids apart,
Like nature's patient, sleepless Eremite,
The moving waters at their priestlike task
Of pure ablution round earth's human shores,
Or gazing on the new soft-fallen mask
Of snow upon the mountains and the moors—
No—yet still stedfast, still unchangeable,
Pillow'd upon my fair love's ripening breast,
To feel for ever its soft fall and swell,
Awake for ever in a sweet unrest,
Still, still to hear her tender-taken breath,
And so live ever—or else swoon to death.`,
    description: 'A romantic sonnet expressing the desire for eternal constancy in love, modeled after the unchanging nature of a star.',
    category: 'Romantic',
    themeBreakdown: 'Explores the tension between the eternal (the star) and the mortal (human love). It uses celestial imagery to elevate personal affection to a cosmic level.'
  }
];
