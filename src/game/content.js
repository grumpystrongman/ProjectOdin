export const socialProfile = {
  name: 'Jeff Barnes',
  headline: 'Senior Director of Business Intelligence, Data Engineering, and AI',
  summary: 'Healthcare analytics and data engineering leader building platforms, teams, AI workflows, and practical systems that turn complexity into action.',
  email: 'cmajeff@gmail.com',
  linkedin: 'https://www.linkedin.com/in/cmajeff/'
};

export const realms = [
  {
    id: 'about', name: 'Arrival Plaza: About Jeff', short: 'ABOUT JEFF', x: 0, z: 520, color: '#f2c76d', stem: 'citadel', elevation: 20,
    title: 'Who Jeff Barnes Is',
    body: 'The starting plaza explains who Jeff is before the visitor gets lost in the world: healthcare analytics leader, data engineering builder, AI strategist, team coach, and maker of working systems.',
    plain: 'About Jeff, career identity, and why this site exists.',
    quest: 'Start here: learn who Jeff is and what this world represents.',
    artifacts: ['jeff-profile-terminal', 'career-map', 'contact-beacon']
  },
  {
    id: 'archive', name: 'Healthcare Analytics Archive', short: 'HEALTHCARE', x: -720, z: -420, color: '#f2c76d', stem: 'archive', elevation: 34,
    title: 'Healthcare Analytics & Epic Foundations',
    body: 'Clinical analytics, Epic reporting, Clarity, operational insight, and the discipline of turning healthcare data into decisions that help patients and teams.',
    plain: 'Healthcare analytics, Epic, Clarity, reporting, population health, and operational decision support.',
    quest: 'Explore the healthcare analytics archive and inspect the clinical artifacts.',
    artifacts: ['clarity-temple', 'no-show-oracle', 'population-health-lantern']
  },
  {
    id: 'forge', name: 'Data Platform Forge', short: 'DATA PLATFORM', x: -280, z: 60, color: '#ff8f3d', stem: 'forge', elevation: 22,
    title: 'Fabric, Databricks, dbt, and Data Engineering',
    body: 'Governed data moves through Fivetran, Databricks, dbt, Fabric, Power BI, orchestration, and lineage. This district is about building platforms people can actually trust.',
    plain: 'Data engineering, cloud platforms, Fabric, Databricks, dbt, Power BI, orchestration, and lineage.',
    quest: 'Restart the data aqueduct and bring the platform lights online.',
    artifacts: ['fabric-aqueduct', 'dbt-hammer', 'databricks-crucible']
  },
  {
    id: 'citadel', name: 'Leadership Hall', short: 'LEADERSHIP', x: 370, z: -430, color: '#86b7ff', stem: 'citadel', elevation: 48,
    title: 'Leadership, Governance, and Team Design',
    body: 'A grounded district for coaching, governance, value-stream pods, prioritization, and the difficult human work behind strong analytics organizations.',
    plain: 'Leadership philosophy, management, governance, team design, coaching, and operating models.',
    quest: 'Balance the council by choosing outcomes over noise.',
    artifacts: ['council-table', 'value-stream-map', 'manager-coaching-bell']
  },
  {
    id: 'sanctum', name: 'AI and Agents Sanctum', short: 'AI / AGENTS', x: 760, z: 120, color: '#67f7ff', stem: 'sanctum', elevation: 56,
    title: 'AI, Agents, and ThreadlineAI',
    body: 'AI adoption, LLM workflows, model governance, agentic tools, and ThreadlineAI as a practical product idea rather than demo theater.',
    plain: 'AI strategy, agents, model governance, ThreadlineAI, and responsible implementation.',
    quest: 'Wake the companion intelligence without letting it replace judgment.',
    artifacts: ['threadline-core', 'model-drift-lens', 'ai-council-seal']
  },
  {
    id: 'observatory', name: 'Future Lab Observatory', short: 'FUTURE LAB', x: 70, z: -780, color: '#bc8cff', stem: 'observatory', elevation: 72,
    title: 'Research, Quantum Curiosity, and Future Systems',
    body: 'Experiments, simulations, weather signals, quantum curiosity, game systems, and future-facing builds that keep learning alive.',
    plain: 'Research, experiments, simulations, quantum curiosity, weather data, and future systems.',
    quest: 'Align three constellations of future work.',
    artifacts: ['quantum-star-map', 'weather-globe', 'simulation-lens']
  },
  {
    id: 'workshop', name: 'Projects Workshop', short: 'PROJECTS', x: 560, z: 560, color: '#72ffc2', stem: 'workshop', elevation: 18,
    title: 'GitHub Projects and Living Inventions',
    body: 'The projects district highlights repositories, prototypes, and living builds. It is where ideas become working software.',
    plain: 'GitHub projects, active builds, prototypes, and living inventions.',
    quest: 'Inspect the living artifacts and let the workshop remember what you found.',
    artifacts: ['github-forge', 'open-aegis-shield', 'threadline-workbench']
  },
  {
    id: 'gallery', name: 'LinkedIn and Posts Gallery', short: 'POSTS', x: -620, z: 560, color: '#4da3ff', stem: 'archive', elevation: 26,
    title: 'LinkedIn Posts, Images, and Public Voice',
    body: 'A gallery district for Jeff’s public posts, images, leadership reflections, project updates, and professional story. Current cards are structured placeholders until exported LinkedIn assets are added.',
    plain: 'LinkedIn profile, post gallery, public writing, images, and professional voice.',
    quest: 'Walk the gallery and inspect public-story cards.',
    artifacts: ['linkedin-profile-gate', 'post-gallery-wall', 'public-voice-archive']
  }
];

export const artifacts = {
  'jeff-profile-terminal': { realm: 'about', title: 'Jeff Barnes Profile Terminal', type: 'About Jeff', body: 'Jeff Barnes is a senior healthcare analytics, business intelligence, data engineering, and AI leader. This world is a portfolio you can walk through: projects, leadership ideas, technical architecture, and public thinking.' },
  'career-map': { realm: 'about', title: 'Career Map', type: 'Career / Leadership', body: 'The map connects healthcare operations, Epic analytics, enterprise data platforms, AI strategy, management, coaching, and product building into one practical career story.' },
  'contact-beacon': { realm: 'about', title: 'Contact Beacon', type: 'Contact', body: 'Contact should be clear, readable, and useful. The Vault still protects the reveal, but the card now says Jeff Barnes and displays the email cleanly.' },
  'clarity-temple': { realm: 'archive', title: 'The Clarity Temple', type: 'Epic / Analytics', body: 'A temple of clinical context where raw records become trusted operational knowledge. It represents the discipline required to make healthcare analytics useful instead of merely impressive.' },
  'no-show-oracle': { realm: 'archive', title: 'The No-Show Oracle', type: 'Predictive Operations', body: 'A prediction engine is only worthwhile when it changes action. The oracle is framed around prevention, not prediction theater.' },
  'population-health-lantern': { realm: 'archive', title: 'Population Health Lantern', type: 'Equity / Access', body: 'A lantern carried into underserved corners of the system. It represents analytics that finds people before they fall through the cracks.' },
  'fabric-aqueduct': { realm: 'forge', title: 'The Fabric Aqueduct', type: 'Cloud Platform', body: 'Blue rivers of governed data flow from source systems through Fivetran, Databricks, dbt, Fabric, and Power BI. The aqueduct is the platform story made visible.' },
  'dbt-hammer': { realm: 'forge', title: 'The dbt Hammer', type: 'Transformation Craft', body: 'A tool for repeatable shaping. It turns ad hoc work into tested transformations, lineage, and durable trust.' },
  'databricks-crucible': { realm: 'forge', title: 'Databricks Crucible', type: 'Lakehouse', body: 'A furnace where raw enterprise data becomes structured, governed, and reusable. Heat is pressure. Pressure is where platforms prove whether they are real.' },
  'council-table': { realm: 'citadel', title: 'The Council Table', type: 'Leadership', body: 'The table does not reward the loudest voice. It rewards the clearest tradeoff, the visible constraint, and the decision that can survive implementation.' },
  'value-stream-map': { realm: 'citadel', title: 'The Value Stream Map', type: 'Team Design', body: 'Pods, ownership, and service design become a navigable map. The lesson is simple: structure either lowers friction or creates it.' },
  'manager-coaching-bell': { realm: 'citadel', title: 'Manager Coaching Bell', type: 'People Leadership', body: 'A quiet bell used before difficult conversations. It reminds the player that leadership is not rescuing people from responsibility; it is helping them carry it well.' },
  'threadline-core': { realm: 'sanctum', title: 'The Threadline Core', type: 'AI Sidecar', body: 'A persistent context-aware companion that follows work across windows, documents, tabs, and decisions. The core represents ThreadlineAI as a living artifact.' },
  'model-drift-lens': { realm: 'sanctum', title: 'The Drift Lens', type: 'AI Governance', body: 'Models age. Context shifts. The lens shows why governance, monitoring, and humility matter more than demos.' },
  'ai-council-seal': { realm: 'sanctum', title: 'AI Council Seal', type: 'Governance', body: 'A seal that refuses to glow for hype alone. It represents vendor review, clinical safety, drift monitoring, and the habit of asking what problem the model actually solves.' },
  'quantum-star-map': { realm: 'observatory', title: 'The Quantum Star Map', type: 'Research', body: 'An experimental navigation chart for ideas that may not be practical yet but are still worth studying because the future rarely asks permission.' },
  'weather-globe': { realm: 'observatory', title: 'The Weather Globe', type: 'Simulation', body: 'Weather, signals, and probability become a celestial instrument. It connects curiosity, data ingestion, and environmental systems.' },
  'simulation-lens': { realm: 'observatory', title: 'Simulation Lens', type: 'Learning Tool', body: 'A glass instrument for making invisible systems visible. It connects physics, data, games, and the habit of learning by building.' },
  'github-forge': { realm: 'workshop', title: 'The GitHub Forge', type: 'Living Code', body: 'Repositories become workbenches. The sync layer lets the workshop hydrate itself from GitHub data when a safe API route is available.' },
  'open-aegis-shield': { realm: 'workshop', title: 'The OpenAegis Shield', type: 'Security / Trust', body: 'A shield for responsible systems. It represents the security, privacy, compliance, and governance themes running through healthcare technology.' },
  'threadline-workbench': { realm: 'workshop', title: 'Threadline Workbench', type: 'Product Build', body: 'A bench covered with window handles, context threads, and UI panels. It represents the practical product work of turning an AI sidecar idea into a real Windows-native companion.' },
  'linkedin-profile-gate': { realm: 'gallery', title: 'LinkedIn Profile Gate', type: 'LinkedIn', body: 'The gallery links to Jeff’s LinkedIn profile at https://www.linkedin.com/in/cmajeff/. Exported screenshots and post media can be dropped into this district next.' },
  'post-gallery-wall': { realm: 'gallery', title: 'Post Gallery Wall', type: 'Posts / Images', body: 'A structured gallery for LinkedIn posts, screenshots, project updates, leadership reflections, and public writing. Current cards are seeded placeholders until real post exports are added.' },
  'public-voice-archive': { realm: 'gallery', title: 'Public Voice Archive', type: 'Writing / Thought Leadership', body: 'This archive is for the tone and substance of Jeff’s posts: grounded leadership, healthcare analytics, data platforms, AI, and the human side of technical work.' }
};

export const linkedinGallery = [
  { id: 'profile', title: 'Jeff Barnes on LinkedIn', category: 'Profile', image: null, url: 'https://www.linkedin.com/in/cmajeff/', excerpt: 'Open Jeff’s LinkedIn profile. Future export can hydrate this card with profile imagery and current headline.' },
  { id: 'leadership', title: 'Leadership Reflections', category: 'Leadership', image: null, url: 'https://www.linkedin.com/in/cmajeff/recent-activity/all/', excerpt: 'Posts about managing teams, coaching managers, governance, priorities, and building healthier operating systems.' },
  { id: 'healthcare-analytics', title: 'Healthcare Analytics', category: 'Healthcare', image: null, url: 'https://www.linkedin.com/in/cmajeff/recent-activity/all/', excerpt: 'Posts and future screenshots about Epic analytics, decision support, clinical operations, dashboards, and outcomes.' },
  { id: 'ai-data-platforms', title: 'AI and Data Platforms', category: 'AI / Data', image: null, url: 'https://www.linkedin.com/in/cmajeff/recent-activity/all/', excerpt: 'Posts about AI adoption, data engineering, Fabric, Databricks, dbt, and practical platform leadership.' },
  { id: 'projects', title: 'Projects and Builds', category: 'Projects', image: null, url: 'https://www.linkedin.com/in/cmajeff/recent-activity/all/', excerpt: 'Posts about ThreadlineAI, Project ODIN, experiments, prototypes, and the habit of learning by building.' }
];

export const githubSeeds = [
  { repo: 'ThreadlineAI', title: 'Context-aware Windows AI sidecar', realm: 'sanctum', status: 'active', signal: 97, language: 'C# / WinUI / ASP.NET', url: 'https://github.com/grumpystrongman/ThreadlineAI' },
  { repo: 'AnalyticsPlatform', title: 'Self-service analytics and metadata platform foundation', realm: 'forge', status: 'active', signal: 91, language: 'Python / dbt / lakehouse', url: 'https://github.com/grumpystrongman/AnalyticsPlatform' },
  { repo: 'OpenAegis', title: 'Trust, security, and defensive AI patterns', realm: 'workshop', status: 'prototype', signal: 82, language: 'Security patterns', url: 'https://github.com/grumpystrongman/OpenAegis' },
  { repo: 'OpenPulse', title: 'Signals, monitoring, and operational pulse concepts', realm: 'observatory', status: 'prototype', signal: 79, language: 'Monitoring', url: 'https://github.com/grumpystrongman/OpenPulse' },
  { repo: 'PayerPlan', title: 'Healthcare payer planning and operational analytics concept', realm: 'archive', status: 'prototype', signal: 76, language: 'Healthcare analytics', url: 'https://github.com/grumpystrongman/PayerPlan' }
];

export const tablets = [
  'This is Jeff Barnes’ portfolio world. The theme serves the person, not the other way around.',
  'The strongest wall is not built from stone. It is built from understanding.',
  'Every system eventually reflects those who designed it.',
  'A leader who hoards knowledge has already begun to fail.',
  'Dashboards matter less than the decisions they improve.',
  'Prediction is not the goal. Prevention is the goal.',
  'The work is not to impress the machine. The work is to help people move.',
  'Tools are not strategy. They are leverage applied to a clear intent.',
  'A brittle process will eventually reveal the truth about its designer.',
  'The more complex the system, the more human the explanation must become.',
  'Governance that cannot be used in the hallway will fail in the meeting.',
  'Architecture is empathy with a deployment plan.'
];

export const corvusLines = {
  idle: [
    'This world is here to introduce Jeff Barnes, not hide him behind lore.',
    'Move through the districts. Each one translates a part of Jeff’s work into space.',
    'A river of data is useless if no one trusts where it flows.',
    'The old builders made everything look inevitable. It never was.'
  ],
  about: ['Start with the person. The architecture matters because Jeff built, led, questioned, and learned through it.', 'The plaza is the plain-English answer to why this place exists.'],
  archive: ['The Archive likes discipline. It punishes assumptions.', 'Clinical context is not decoration. It is the door.'],
  forge: ['The aqueduct is moving again. Data prefers momentum.', 'A platform is just architecture until people trust it.'],
  citadel: ['Notice how every council member believes they are the constraint.', 'Leadership is not volume. It is shape.'],
  sanctum: ['The machine is awake. That does not mean it is wise.', 'Intelligence without governance becomes weather.'],
  observatory: ['Future systems always look absurd before they look obvious.', 'Curiosity is expensive. Ignorance is worse.'],
  workshop: ['The workshop remembers commits better than people remember promises.', 'Every unfinished project is either waste or a seed. Choose carefully.'],
  gallery: ['The gallery should eventually hold real posts, real images, and Jeff’s public voice.', 'A portfolio should show the person in motion, not just a résumé frozen in place.'],
  vault: ['Access must be earned. Not because it is precious, but because attention is.']
};

export const achievements = {
  firstStep: { title: 'First Discovery', text: 'Entered Jeff Barnes’ portfolio world.' },
  firstArtifact: { title: 'Keeper of Knowledge', text: 'Discovered the first professional artifact.' },
  threeRealms: { title: 'Cartographer of Systems', text: 'Visited three districts of Jeff’s work.' },
  allRealms: { title: 'World Reader', text: 'Visited every district in the first world map.' },
  trialClear: { title: 'Vaultbreaker', text: 'Balanced speed, reliability, and innovation.' },
  workshop: { title: 'Builder of Worlds', text: 'Inspected the Projects Workshop.' },
  syncedWorkshop: { title: 'Living Workshop', text: 'Synchronized repository signals into the world.' },
  tabletKeeper: { title: 'Tablet Keeper', text: 'Recovered six leadership tablets.' },
  backendOnline: { title: 'Signal Fire Lit', text: 'Connected the world to the production backend.' }
};
