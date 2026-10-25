import '@fontsource/silkscreen/400.css';
import '../styles.css';
import { saveLang } from '../content';

// Visiting a quick view in one language makes it the default for the game too.
saveLang(document.documentElement.lang === 'es' ? 'es' : 'en');
