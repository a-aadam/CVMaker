// Common ATS terms. Matching is case-insensitive; the casing here is what gets shown.
export const SKILL_TERMS: string[] = [
  // Languages
  'JavaScript', 'TypeScript', 'Python', 'Java', 'C#', 'C++', 'C', 'Go', 'Golang', 'Rust', 'Ruby', 'PHP', 'Swift',
  'Kotlin', 'Scala', 'R', 'MATLAB', 'SQL', 'NoSQL', 'Bash', 'PowerShell', 'Perl', 'Dart', 'Elixir', 'Haskell',
  'Objective-C', 'VBA', 'HTML', 'CSS', 'Sass', 'GraphQL', 'Solidity',
  // Frameworks and libraries
  'React', 'React Native', 'Next.js', 'Vue', 'Vue.js', 'Angular', 'Svelte', 'Node.js', 'Express', 'NestJS', 'Django',
  'Flask', 'FastAPI', 'Spring', 'Spring Boot', '.NET', 'ASP.NET', 'Rails', 'Ruby on Rails', 'Laravel', 'Flutter',
  'jQuery', 'Redux', 'Tailwind', 'Bootstrap', 'TensorFlow', 'PyTorch', 'Keras', 'scikit-learn', 'Pandas', 'NumPy',
  'Spark', 'Apache Spark', 'Hadoop', 'Kafka', 'Airflow', 'dbt', 'LangChain', 'Hugging Face',
  // Data and storage
  'PostgreSQL', 'MySQL', 'SQL Server', 'Oracle', 'MongoDB', 'Redis', 'Elasticsearch', 'DynamoDB', 'Cassandra',
  'Snowflake', 'BigQuery', 'Redshift', 'Databricks', 'SQLite', 'Firebase', 'Supabase',
  // Cloud and DevOps
  'AWS', 'Azure', 'GCP', 'Google Cloud', 'Docker', 'Kubernetes', 'Terraform', 'Ansible', 'Jenkins', 'GitHub Actions',
  'GitLab CI', 'CI/CD', 'Linux', 'Unix', 'Git', 'Serverless', 'Lambda', 'EC2', 'S3', 'Helm', 'Prometheus', 'Grafana',
  'Datadog', 'Splunk', 'Nginx', 'Microservices', 'REST', 'REST APIs', 'RESTful APIs', 'APIs', 'gRPC', 'WebSockets',
  'DevOps', 'SRE', 'Infrastructure as Code', 'Cloud Computing', 'Networking', 'TCP/IP', 'Cybersecurity', 'OAuth',
  // Data, AI and analytics
  'Machine Learning', 'Deep Learning', 'Artificial Intelligence', 'AI', 'Natural Language Processing', 'NLP',
  'Computer Vision', 'Generative AI', 'LLM', 'LLMs', 'Large Language Models', 'Data Science', 'Data Analysis',
  'Data Analytics', 'Data Engineering', 'Data Visualization', 'Data Modeling', 'Data Warehousing', 'ETL', 'ELT',
  'Statistics', 'Statistical Analysis', 'A/B Testing', 'Predictive Modeling', 'Big Data', 'Business Intelligence',
  'Tableau', 'Power BI', 'Looker', 'Excel', 'Microsoft Excel', 'Google Analytics', 'SAS', 'SPSS', 'Jupyter',
  // Practices
  'Agile', 'Scrum', 'Kanban', 'Waterfall', 'Lean', 'Six Sigma', 'Test-Driven Development', 'TDD', 'Unit Testing',
  'Automated Testing', 'QA', 'Quality Assurance', 'Code Review', 'System Design', 'Software Architecture',
  'Object-Oriented Programming', 'OOP', 'Design Patterns', 'Data Structures', 'Algorithms', 'Debugging',
  'Performance Optimization', 'Scalability', 'Security', 'Accessibility', 'Responsive Design', 'UI', 'UX',
  'UI/UX', 'User Research', 'Usability Testing', 'Wireframing', 'Prototyping', 'Figma', 'Sketch', 'Adobe XD',
  'Adobe Creative Suite', 'Photoshop', 'Illustrator', 'InDesign', 'Jira', 'Confluence', 'Trello', 'Asana', 'Notion',
  'Salesforce', 'HubSpot', 'SAP', 'ERP', 'CRM', 'Shopify', 'WordPress', 'SEO', 'SEM', 'Google Ads',
  'Content Marketing', 'Digital Marketing', 'Email Marketing', 'Social Media', 'Social Media Marketing',
  'Copywriting', 'Market Research', 'Brand Management', 'Product Management', 'Product Strategy', 'Roadmapping',
  'Project Management', 'Program Management', 'Stakeholder Management', 'Change Management', 'Risk Management',
  'Vendor Management', 'Budgeting', 'Forecasting', 'Financial Analysis', 'Financial Modeling', 'Accounting',
  'Bookkeeping', 'GAAP', 'IFRS', 'Auditing', 'Compliance', 'Regulatory Compliance', 'Due Diligence', 'Valuation',
  'Supply Chain', 'Logistics', 'Procurement', 'Inventory Management', 'Operations Management', 'Process Improvement',
  'Business Development', 'Sales', 'B2B', 'B2C', 'SaaS', 'Account Management', 'Lead Generation',
  'Customer Success', 'Customer Service', 'Client Relations', 'Negotiation', 'Recruiting', 'Talent Acquisition',
  'Onboarding', 'Training', 'Coaching', 'Mentoring', 'Human Resources', 'Payroll', 'KPIs', 'OKRs', 'ROI', 'P&L',
  'Strategic Planning', 'Business Analysis', 'Requirements Gathering', 'Process Mapping', 'Documentation',
  'Technical Writing', 'Public Speaking', 'Presentation Skills', 'Research', 'Healthcare', 'HIPAA', 'GDPR',
  'PMP', 'CPA', 'CFA', 'ITIL', 'CompTIA', 'CISSP',
  // Soft skills ATS often screens for
  'Leadership', 'Team Leadership', 'Communication', 'Written Communication', 'Verbal Communication', 'Teamwork',
  'Collaboration', 'Cross-functional Collaboration', 'Problem Solving', 'Critical Thinking', 'Analytical Skills',
  'Attention to Detail', 'Time Management', 'Organization', 'Adaptability', 'Creativity', 'Decision Making',
  'Conflict Resolution', 'Customer Focus', 'Self-motivated', 'Multitasking', 'Interpersonal Skills',
];

export const STOPWORDS = new Set(
  (
    'a an the and or but if then of to in on at by for with from into over under about as is are was were be been being ' +
    'this that these those it its we our you your they their he she them us i me my will would should can could may might must ' +
    'do does did done have has had having not no yes all any each every some such more most other than so very also just ' +
    'who whom which what when where why how there here up down out off again further once both few own same too only ' +
    'job role position candidate candidates team teams company work working works experience experiences year years ' +
    'ability able strong excellent good great new including include includes etc using use used across within ' +
    'responsibilities responsible requirements required requirement preferred plus qualifications qualification ' +
    'skills skill knowledge understanding looking join help ensure make well based related relevant opportunity ' +
    'apply applicants employer equal benefits salary per day week month time full part remote hybrid office location ' +
    'minimum least ideal ideally successful environment etc e.g i.e like one two three four five'
  ).split(/\s+/),
);
