export const socialProfile = {
  name: 'Jeff Barnes',
  headline: 'Principal Enterprise Architect / Platform Transformation Executive',
  summary: 'Healthcare analytics, enterprise architecture, data engineering, AI governance, and platform transformation leader building systems people can trust and use.',
  email: 'cmajeff@gmail.com',
  phone: '812.781.0028',
  linkedin: 'https://www.linkedin.com/in/cmajeff/'
};

export const realms = [
  { id: 'about', name: 'Jeff Barnes Commons', short: 'COMMONS', x: 0, z: 520, color: '#f0c26f', stem: 'citadel', elevation: 12, title: 'The starting square', body: 'A warm village square built around Jeff’s portrait, story, resume, and the clearest path into the rest of the site.', plain: 'About Jeff, resume access, identity, and site map.', quest: 'Start here: meet Jeff and choose where to walk next.', artifacts: ['about-jeff', 'resume-hall', 'commons-map'] },
  { id: 'resume', name: 'Resume Hall', short: 'RESUME', x: -760, z: 150, color: '#d9a85c', stem: 'archive', elevation: 24, title: 'Career, accomplishments, and credentials', body: 'A clear professional hall for Jeff’s resume, accomplishments, experience, technical scope, and leadership story.', plain: 'Full resume, career history, achievements, skills, and professional positioning.', quest: 'Open Resume Hall to read Jeff’s career record.', artifacts: ['resume-scroll', 'accomplishment-banners', 'skill-ledger'] },
  { id: 'chronicle', name: 'Chronicle House', short: 'ARTICLES', x: -650, z: 620, color: '#8ec1ff', stem: 'archive', elevation: 20, title: 'Articles, LinkedIn posts, images, and public voice', body: 'A readable gallery house where scraped LinkedIn posts open as full scrollable articles with images and source links.', plain: 'Full articles, images, LinkedIn source links, and public writing.', quest: 'Read recent articles inside the Chronicle House.', artifacts: ['linkedin-profile-gate', 'post-gallery-wall', 'public-voice-archive'] },
  { id: 'foundry', name: 'The Foundry', short: 'DATA PLATFORM', x: -220, z: -260, color: '#ff9d4a', stem: 'forge', elevation: 18, title: 'Data platforms and architecture', body: 'A working forge for Microsoft Fabric, Databricks, dbt, semantic modeling, pipelines, governance, and cloud modernization.', plain: 'Data engineering, architecture, Fabric, Databricks, dbt, Power BI, semantic modeling, and platform transformation.', quest: 'Inspect the forge artifacts to understand Jeff’s platform work.', artifacts: ['fabric-aqueduct', 'dbt-hammer', 'databricks-crucible'] },
  { id: 'ai', name: 'AI Workshop', short: 'AI WORKSHOP', x: 720, z: 90, color: '#6ee7d8', stem: 'sanctum', elevation: 26, title: 'Responsible AI, agents, and ThreadlineAI', body: 'A lantern-lit workshop for AI governance, LLM workflows, model drift, agents, and practical product experimentation.', plain: 'AI governance, agents, ThreadlineAI, responsible adoption, and enterprise workflow design.', quest: 'Open the AI Workshop and inspect the working prototypes.', artifacts: ['threadline-core', 'model-drift-lens', 'ai-council-seal'] },
  { id: 'healthcare', name: 'Healthcare Analytics Hall', short: 'HEALTHCARE', x: -760, z: -620, color: '#8fcf9f', stem: 'archive', elevation: 22, title: 'Healthcare analytics and Epic foundations', body: 'A hall for Epic, Clarity, Caboodle, Cogito/Nebula, operational analytics, decision support, patient access, and clinical context.', plain: 'Healthcare analytics, Epic, clinical and operational reporting, decision support, and no-show prevention.', quest: 'Walk the Healthcare Hall to see the clinical analytics thread.', artifacts: ['clarity-temple', 'no-show-oracle', 'population-health-lantern'] },
  { id: 'leadership', name: 'Leadership Library', short: 'LEADERSHIP', x: 420, z: -650, color: '#bca3ff', stem: 'citadel', elevation: 28, title: 'Leadership, governance, and people systems', body: 'A library for team design, executive communication, coaching, governance, portfolio leadership, and operating models.', plain: 'Leadership philosophy, people management, governance, value-stream design, and decision-making.', quest: 'Read the leadership shelves and council artifacts.', artifacts: ['council-table', 'value-stream-map', 'manager-coaching-bell'] },
  { id: 'workshop', name: 'Project Workshop', short: 'PROJECTS', x: 620, z: 610, color: '#72ffc2', stem: 'workshop', elevation: 16, title: 'GitHub projects and working experiments', body: 'A project workshop for ThreadlineAI, OpenAegis, OpenPulse, Project ODIN, and practical software experiments.', plain: 'GitHub projects, prototypes, code, product experiments, and living builds.', quest: 'Inspect the project benches and repository signals.', artifacts: ['github-forge', 'open-aegis-shield', 'threadline-workbench'] }
];

export const artifacts = {
  'about-jeff': { realm: 'about', title: 'About Jeff Barnes', type: 'About Me', body: 'Open a full about-me profile focused on Jeff’s leadership, architecture, healthcare analytics, AI work, and practical builder mindset.', action: 'about' },
  'resume-hall': { realm: 'about', title: 'Resume Hall', type: 'Resume', body: 'Open Jeff’s structured resume, accomplishments, experience, technical skills, and career story.', action: 'resume' },
  'commons-map': { realm: 'about', title: 'Commons Map', type: 'Map', body: 'A storybook map of Jeff Barnes Commons, showing the named locations and what each building contains.', action: 'map' },
  'resume-scroll': { realm: 'resume', title: 'Principal Architect Resume', type: 'Resume', body: 'The full structured resume view: summary, accomplishments, experience, skills, and education.', action: 'resume' },
  'accomplishment-banners': { realm: 'resume', title: 'Accomplishment Banners', type: 'Career Impact', body: 'Impact banners for RUHD, HIMSS AMAM, dashboard modernization, no-show reduction, savings, platform adoption, and delivery acceleration.', action: 'resume' },
  'skill-ledger': { realm: 'resume', title: 'Skill Ledger', type: 'Skills', body: 'A ledger of platforms, healthcare analytics, architecture, AI governance, leadership, and technical capabilities.', action: 'resume' },
  'linkedin-profile-gate': { realm: 'chronicle', title: 'LinkedIn Profile Gate', type: 'LinkedIn', body: 'Open Jeff’s LinkedIn profile and recent activity.', action: 'linkedin' },
  'post-gallery-wall': { realm: 'chronicle', title: 'Article Gallery Wall', type: 'Articles / Images', body: 'Open the full article gallery. Each card should show the article image, full scraped post text, and original LinkedIn source link.', action: 'gallery' },
  'public-voice-archive': { realm: 'chronicle', title: 'Public Voice Archive', type: 'Writing', body: 'Read Jeff’s recent public writing about AI, healthcare analytics, trust, data platforms, and leadership.', action: 'gallery' },
  'fabric-aqueduct': { realm: 'foundry', title: 'Fabric Aqueduct', type: 'Cloud Platform', body: 'Microsoft Fabric, Power BI, semantic modeling, reusable development patterns, and governed analytics modernization.' },
  'dbt-hammer': { realm: 'foundry', title: 'dbt Hammer', type: 'Transformation Craft', body: 'Repeatable transformation patterns, tested data models, lineage, and practical delivery discipline.' },
  'databricks-crucible': { realm: 'foundry', title: 'Databricks Crucible', type: 'Lakehouse', body: 'Databricks, lakehouse architecture, pipelines, Unity Catalog, governance, and pipeline-centered platform thinking.' },
  'threadline-core': { realm: 'ai', title: 'ThreadlineAI Core', type: 'AI Sidecar', body: 'A Windows-native context-aware AI sidecar concept that follows work across apps, documents, tabs, and decisions.' },
  'model-drift-lens': { realm: 'ai', title: 'Model Drift Lens', type: 'AI Governance', body: 'Models age, context shifts, and governance must be operational rather than ceremonial.' },
  'ai-council-seal': { realm: 'ai', title: 'AI Council Seal', type: 'Responsible AI', body: 'Vendor review, model governance, deployment oversight, accountability, and responsible AI adoption in healthcare.' },
  'clarity-temple': { realm: 'healthcare', title: 'Epic Clarity Desk', type: 'Epic / Analytics', body: 'Epic Clarity, Caboodle, Cogito/Nebula, clinical and operational reporting, and the discipline needed to turn healthcare data into decisions.' },
  'no-show-oracle': { realm: 'healthcare', title: 'No-Show Oracle', type: 'Predictive Operations', body: 'Predictive work that reduced patient no-shows by 5% and generated an estimated $2M annual impact.' },
  'population-health-lantern': { realm: 'healthcare', title: 'Population Health Lantern', type: 'Equity / Access', body: 'Analytics that helps identify access, operational, and population-health issues before people fall through the cracks.' },
  'council-table': { realm: 'leadership', title: 'Council Table', type: 'Executive Leadership', body: 'Executive communication, governance, board engagement, portfolio decisions, and tradeoffs that survive implementation.' },
  'value-stream-map': { realm: 'leadership', title: 'Value Stream Map', type: 'Team Design', body: 'Pods, ownership, operating models, prioritization, and structures that either reduce friction or create it.' },
  'manager-coaching-bell': { realm: 'leadership', title: 'Manager Coaching Bell', type: 'People Leadership', body: 'Leadership that helps people carry responsibility well rather than rescuing them from accountability.' },
  'github-forge': { realm: 'workshop', title: 'GitHub Forge', type: 'Living Code', body: 'Repositories, prototypes, and active software experiments that show the builder side of Jeff’s work.' },
  'open-aegis-shield': { realm: 'workshop', title: 'OpenAegis Shield', type: 'Security / Trust', body: 'Trust, defensive AI patterns, security, privacy, compliance, and healthcare technology risk.' },
  'threadline-workbench': { realm: 'workshop', title: 'Threadline Workbench', type: 'Product Build', body: 'A practical AI product workbench connecting app context, conversation UI, local services, and LLM workflow design.' }
};

export const linkedinGallery = [
  { id: 'profile', title: 'Jeff Barnes on LinkedIn', category: 'Profile', image: null, url: 'https://www.linkedin.com/in/cmajeff/', excerpt: 'Open Jeff’s LinkedIn profile. Imported post data loads from public/data/linkedin-gallery.json when available.' }
];

export const githubSeeds = [
  { repo: 'ThreadlineAI', title: 'Context-aware Windows AI sidecar', realm: 'ai', status: 'active', signal: 97, language: 'C# / WinUI / ASP.NET', url: 'https://github.com/grumpystrongman/ThreadlineAI' },
  { repo: 'ProjectOdin', title: 'Immersive first-person portfolio world', realm: 'workshop', status: 'active', signal: 94, language: 'Three.js / Vite', url: 'https://github.com/grumpystrongman/ProjectOdin' },
  { repo: 'OpenAegis', title: 'Trust, security, and defensive AI patterns', realm: 'workshop', status: 'prototype', signal: 82, language: 'Security patterns', url: 'https://github.com/grumpystrongman/OpenAegis' },
  { repo: 'OpenPulse', title: 'Signals, monitoring, and operational pulse concepts', realm: 'workshop', status: 'prototype', signal: 79, language: 'Monitoring', url: 'https://github.com/grumpystrongman/OpenPulse' },
  { repo: 'PayerPlan', title: 'Healthcare payer planning and operational analytics concept', realm: 'healthcare', status: 'prototype', signal: 76, language: 'Healthcare analytics', url: 'https://github.com/grumpystrongman/PayerPlan' }
];

export const tablets = [
  'This is Jeff Barnes Commons. The fantasy world serves the person, not the other way around.',
  'A dashboard is not the destination. A better decision is.',
  'The real journey in data is from uncertainty to confidence.',
  'Governance that cannot be used in a hallway will fail in a meeting.',
  'A platform is only successful when people trust it enough to rely on it.',
  'Prediction is not the goal. Prevention is the goal.',
  'Architecture is empathy with a deployment plan.',
  'Leadership is not volume. It is shape, clarity, and consequence.',
  'The model is not the product. The workflow is.',
  'Tools are leverage, not strategy.',
  'The best systems make the complex usable without pretending it is simple.',
  'Build the thing. Then make it trustworthy.'
];

export const corvusLines = {
  idle: ['Welcome to Jeff Barnes Commons.', 'Every building has a clear name. Every named place has a reason to exist.', 'Follow the signs: Resume Hall, Chronicle House, The Foundry, AI Workshop, Healthcare Analytics Hall, Leadership Library, and Project Workshop.'],
  about: ['Start in the Commons. Meet the person before the architecture.', 'The portrait, resume, and map explain where you are.'],
  resume: ['Resume Hall holds the professional record: impact, leadership, systems, and outcomes.', 'Read the banners. They are not decorations; they are receipts.'],
  chronicle: ['Chronicle House turns public posts into full readable articles.', 'A post should open like a book, not flicker like a tooltip.'],
  foundry: ['The Foundry is where pipelines, models, and platforms get hammered into shape.', 'Data platforms fail when they are built for diagrams instead of people.'],
  ai: ['The AI Workshop glows because the work is alive, not because the hype is loud.', 'Responsible AI is not a slogan. It is an operating discipline.'],
  healthcare: ['Healthcare Analytics Hall keeps context close to the numbers.', 'Clinical analytics must serve decisions, patients, and operational reality.'],
  leadership: ['Leadership Library is quieter than the forge, but it shapes more outcomes.', 'A good operating model lowers the temperature in the room.'],
  workshop: ['The Project Workshop remembers commits better than promises.', 'The best prototype is the one someone can actually use.'],
  vault: ['Contact is still a gate, but the site should never hide who Jeff is.']
};

export const achievements = {
  firstStep: { title: 'Arrived at the Commons', text: 'Entered Jeff Barnes Commons.' },
  firstArtifact: { title: 'First Reading', text: 'Opened the first named artifact.' },
  threeRealms: { title: 'Village Walker', text: 'Visited three named locations.' },
  allRealms: { title: 'Commons Cartographer', text: 'Visited every major location in Jeff Barnes Commons.' },
  trialClear: { title: 'Contact Gate Opened', text: 'Balanced speed, reliability, and innovation.' },
  workshop: { title: 'Builder’s Bench', text: 'Inspected the Project Workshop.' },
  syncedWorkshop: { title: 'Living Workshop', text: 'Synchronized repository signals into the world.' },
  tabletKeeper: { title: 'Library Keeper', text: 'Recovered six leadership tablets.' },
  backendOnline: { title: 'Signal Fire Lit', text: 'Connected the world to the backend.' }
};
