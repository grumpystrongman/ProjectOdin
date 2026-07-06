import { realms, artifacts, corvusLines, achievements } from './content.js';

const EXTREME_SPORTS_REALM_ID = 'extreme-sports';

if (!realms.some((realm) => realm.id === EXTREME_SPORTS_REALM_ID)) {
  realms.push({
    id: EXTREME_SPORTS_REALM_ID,
    name: 'Proving Grounds',
    short: 'EXTREME SPORTS',
    x: 1040,
    z: -430,
    color: '#ff5f45',
    stem: 'arena',
    elevation: 18,
    title: 'Strength, endurance, obstacle racing, and armored combat',
    body: 'A rugged arena for the physical side of Jeff’s story: power lifting, strongman competitions, Spartan Trifectas, half marathons, ultra marathons, and fighting for Team USA in Bohurt in Barcelona, Spain, and Rome.',
    plain: 'Power lifting, strongman, Spartan Trifectas, endurance running, ultra marathons, and Team USA Bohurt.',
    quest: 'Enter the Proving Grounds to see the competitions, endurance events, and combat sports that shaped Jeff’s grit.',
    artifacts: ['iron-platform', 'strongman-stones', 'spartan-trifecta-shield', 'ultra-trail-markers', 'bohurt-team-usa-banner']
  });
}

Object.assign(artifacts, {
  'iron-platform': {
    realm: EXTREME_SPORTS_REALM_ID,
    title: 'Iron Platform',
    type: 'Power Lifting',
    body: 'Power lifting belongs here as the pure strength foundation: disciplined training, heavy attempts, technical lifts, and the patience to build capacity over time.'
  },
  'strongman-stones': {
    realm: EXTREME_SPORTS_REALM_ID,
    title: 'Strongman Stones',
    type: 'Strongman Competitions',
    body: 'Strongman competitions represent odd-object strength, carrying, loading, pressing, pulling, and the willingness to do hard things without clean edges or perfect conditions.'
  },
  'spartan-trifecta-shield': {
    realm: EXTREME_SPORTS_REALM_ID,
    title: 'Spartan Trifecta Shield',
    type: 'Obstacle Racing',
    body: 'Multiple Spartan Trifectas completed: Sprint, Super, and Beast distances across mud, obstacles, carries, climbs, burpees, and long-course problem solving under fatigue.'
  },
  'ultra-trail-markers': {
    realm: EXTREME_SPORTS_REALM_ID,
    title: 'Ultra Trail Markers',
    type: 'Endurance Running',
    body: 'Completed half marathons and two ultra marathons: Dances with Dirt 50K and Huff 50K. This belongs beside leadership because endurance is decision-making after comfort is gone.'
  },
  'bohurt-team-usa-banner': {
    realm: EXTREME_SPORTS_REALM_ID,
    title: 'Team USA Bohurt Banner',
    type: 'Armored Combat',
    body: 'Fought for Team USA in Bohurt in Barcelona, Spain, and Rome. Full-contact armored combat gives the Proving Grounds its battle-ring identity rather than just a fitness résumé.'
  }
});

corvusLines[EXTREME_SPORTS_REALM_ID] = [
  'The Proving Grounds are not decorative. This is where strength, endurance, and contact reveal character.',
  'Power lifting, strongman, Spartan racing, ultras, and Bohurt all say the same thing in different languages: keep moving under load.',
  'The arena remembers what the office cannot see: grit is built before it is needed.'
];

achievements.extremeSports = {
  title: 'Entered the Proving Grounds',
  text: 'Discovered Jeff’s strength, endurance, obstacle racing, and armored combat history.'
};
