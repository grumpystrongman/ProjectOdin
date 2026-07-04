export const realms = [
  {
    id: 'archive', name: 'The Forgotten Archive', short: 'ARCHIVE', x: -640, z: -480, color: '#f2c76d', stem: 'archive', elevation: 34,
    title: 'Healthcare Analytics & Epic Foundations',
    body: 'Ancient record halls preserve clinical analytics, Epic reporting, Clarity, and the discipline of turning healthcare data into decisions that help people.',
    quest: 'Restore the Hall of Records by discovering two artifacts.',
    artifacts: ['clarity-temple', 'no-show-oracle', 'population-health-lantern']
  },
  {
    id: 'forge', name: 'The Forge of Systems', short: 'FORGE', x: -240, z: 160, color: '#ff8f3d', stem: 'forge', elevation: 22,
    title: 'Fabric, Databricks, dbt, and Data Engineering',
    body: 'Massive machines move blue rivers of governed data through Fivetran, Databricks, dbt, Fabric, Power BI, orchestration, and lineage.',
    quest: 'Restart the data aqueduct and bring the city lights back online.',
    artifacts: ['fabric-aqueduct', 'dbt-hammer', 'databricks-crucible']
  },
  {
    id: 'citadel', name: 'The Citadel', short: 'CITADEL', x: 350, z: -390, color: '#86b7ff', stem: 'citadel', elevation: 48,
    title: 'Leadership, Governance, and Team Design',
    body: 'A marble council chamber where competing needs become prioritized systems. This realm holds coaching, pods, governance, and practical leadership.',
    quest: 'Balance the council by choosing outcomes over noise.',
    artifacts: ['council-table', 'value-stream-map', 'manager-coaching-bell']
  },
  {
    id: 'sanctum', name: 'The Hall of Intelligence', short: 'AI SANCTUM', x: 680, z: 110, color: '#67f7ff', stem: 'sanctum', elevation: 56,
    title: 'AI, Agents, and ThreadlineAI',
    body: 'Black stone, blue light, and machines that almost seem alive. This realm holds AI adoption, LLM workflows, model governance, and ThreadlineAI.',
    quest: 'Wake the companion intelligence without letting it replace judgment.',
    artifacts: ['threadline-core', 'model-drift-lens', 'ai-council-seal']
  },
  {
    id: 'observatory', name: 'The Observatory of Possibilities', short: 'OBSERVATORY', x: 70, z: -740, color: '#bc8cff', stem: 'observatory', elevation: 72,
    title: 'Research, Quantum Curiosity, and Future Systems',
    body: 'Stars form query plans and constellations become architecture diagrams. This is the curiosity engine: quantum, simulation, weather, and experiments.',
    quest: 'Align three constellations of future work.',
    artifacts: ['quantum-star-map', 'weather-globe', 'simulation-lens']
  },
  {
    id: 'workshop', name: 'The Living Workshop', short: 'WORKSHOP', x: 520, z: 520, color: '#72ffc2', stem: 'workshop', elevation: 18,
    title: 'GitHub Projects and Living Inventions',
    body: 'Every repository becomes a workbench artifact. This room changes as projects evolve.',
    quest: 'Inspect the living artifacts and let the workshop remember what you found.',
    artifacts: ['github-forge', 'open-aegis-shield', 'threadline-workbench']
  }
];

export const artifacts = {
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
  'github-forge': { realm: 'workshop', title: 'The GitHub Forge', type: 'Living Code', body: 'Repositories become workbenches. Sprint 3 adds a sync layer so the workshop can hydrate itself from GitHub data when a safe API route is available.' },
  'open-aegis-shield': { realm: 'workshop', title: 'The OpenAegis Shield', type: 'Security / Trust', body: 'A shield for responsible systems. It represents the security, privacy, compliance, and governance themes running through healthcare technology.' },
  'threadline-workbench': { realm: 'workshop', title: 'Threadline Workbench', type: 'Product Build', body: 'A bench covered with window handles, context threads, and UI panels. It represents the practical product work of turning an AI sidecar idea into a real Windows-native companion.' }
};

export const githubSeeds = [
  { repo: 'ThreadlineAI', title: 'Context-aware Windows AI sidecar', realm: 'sanctum', status: 'active', signal: 97, language: 'C# / WinUI / ASP.NET', url: 'https://github.com/grumpystrongman/ThreadlineAI' },
  { repo: 'AnalyticsPlatform', title: 'Self-service analytics and metadata platform foundation', realm: 'forge', status: 'active', signal: 91, language: 'Python / dbt / lakehouse', url: 'https://github.com/grumpystrongman/AnalyticsPlatform' },
  { repo: 'OpenAegis', title: 'Trust, security, and defensive AI patterns', realm: 'workshop', status: 'prototype', signal: 82, language: 'Security patterns', url: 'https://github.com/grumpystrongman/OpenAegis' },
  { repo: 'OpenPulse', title: 'Signals, monitoring, and operational pulse concepts', realm: 'observatory', status: 'prototype', signal: 79, language: 'Monitoring', url: 'https://github.com/grumpystrongman/OpenPulse' },
  { repo: 'PayerPlan', title: 'Healthcare payer planning and operational analytics concept', realm: 'archive', status: 'prototype', signal: 76, language: 'Healthcare analytics', url: 'https://github.com/grumpystrongman/PayerPlan' }
];

export const tablets = [
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
  'Architecture is empathy with a deployment plan.',
  'The best platform is the one people can trust when nobody is watching.'
];

export const corvusLines = {
  idle: [
    'Books rarely disappear on their own.',
    'Machines were never the difficult part. People usually were.',
    'A river of data is useless if no one trusts where it flows.',
    'The old builders made everything look inevitable. It never was.'
  ],
  archive: ['The Archive likes discipline. It punishes assumptions.', 'Clinical context is not decoration. It is the door.'],
  forge: ['The aqueduct is moving again. Data prefers momentum.', 'A platform is just architecture until people trust it.'],
  citadel: ['Notice how every council member believes they are the constraint.', 'Leadership is not volume. It is shape.'],
  sanctum: ['The machine is awake. That does not mean it is wise.', 'Intelligence without governance becomes weather.'],
  observatory: ['Future systems always look absurd before they look obvious.', 'Curiosity is expensive. Ignorance is worse.'],
  workshop: ['The workshop remembers commits better than people remember promises.', 'Every unfinished project is either waste or a seed. Choose carefully.'],
  vault: ['Access must be earned. Not because it is precious, but because attention is.']
};

export const achievements = {
  firstStep: { title: 'First Discovery', text: 'Entered the world behind the gate.' },
  firstArtifact: { title: 'Keeper of Knowledge', text: 'Discovered the first professional artifact.' },
  threeRealms: { title: 'Cartographer of Systems', text: 'Visited three realms of the Architect.' },
  allRealms: { title: 'Master Architect', text: 'Visited every realm in the first world map.' },
  trialClear: { title: 'Vaultbreaker', text: 'Balanced speed, reliability, and innovation.' },
  workshop: { title: 'Builder of Worlds', text: 'Inspected the Living Workshop.' },
  syncedWorkshop: { title: 'Living Workshop', text: 'Synchronized repository signals into the world.' },
  tabletKeeper: { title: 'Tablet Keeper', text: 'Recovered six leadership tablets.' },
  backendOnline: { title: 'Signal Fire Lit', text: 'Connected the world to the production backend.' }
};
