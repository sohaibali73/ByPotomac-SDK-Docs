'use client';

import { useState } from 'react';

interface CodeExample {
  language: string;
  label: string;
  code: string;
}

interface CodeTabsProps {
  examples: CodeExample[];
  title?: string;
}

export default function CodeTabs({ examples, title }: CodeTabsProps) {
  const [activeTab, setActiveTab] = useState(0);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(examples[activeTab].code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="rounded-xl overflow-hidden border border-border bg-card">
      {/* Header */}
      <div className="flex items-center justify-between bg-muted border-b border-border px-4 py-2">
        <div className="flex items-center gap-2">
          {title && <span className="text-sm text-muted-foreground">{title}</span>}
        </div>
        {/* Language Tabs */}
        <div className="flex items-center gap-1">
          {examples.map((example, index) => (
            <button
              key={example.language}
              onClick={() => setActiveTab(index)}
              className={`px-3 py-1.5 text-xs rounded-md transition-all ${
                activeTab === index
                  ? 'bg-primary text-primary-foreground font-medium'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/80'
              }`}
            >
              {example.label}
            </button>
          ))}
        </div>
      </div>

      {/* Code Block */}
      <div className="relative">
        <pre className="p-4 overflow-x-auto text-sm">
          <code className="text-muted-foreground font-mono">{examples[activeTab].code}</code>
        </pre>

        {/* Copy Button */}
        <button
          onClick={handleCopy}
          className="absolute top-3 right-3 px-2.5 py-1 text-xs bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground rounded-md transition-colors border border-border"
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
    </div>
  );
}

// Pre-built code examples for common operations
export const authLoginExamples: CodeExample[] = [
  {
    language: 'curl',
    label: 'cURL',
    code: `curl -X POST https://api.bypotomac.com/auth/v2/login \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "user@example.com",
    "password": "your-password"
  }'`,
  },
  {
    language: 'javascript',
    label: 'Node.js',
    code: `const response = await fetch('https://api.bypotomac.com/auth/v2/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'your-password',
  }),
});

const data = await response.json();
console.log(data.access_token);`,
  },
  {
    language: 'python',
    label: 'Python',
    code: `import requests

response = requests.post(
    'https://api.bypotomac.com/auth/v2/login',
    json={
        'email': 'user@example.com',
        'password': 'your-password'
    }
)

data = response.json()
print(data['access_token'])`,
  },
  {
    language: 'csharp',
    label: 'C#',
    code: `using var client = new HttpClient();
var content = new StringContent(
    JsonSerializer.Serialize(new { 
        email = "user@example.com", 
        password = "your-password" 
    }),
    Encoding.UTF8,
    "application/json"
);

var response = await client.PostAsync(
    "https://api.bypotomac.com/auth/v2/login", 
    content
);

var data = await response.Content.ReadAsStringAsync();`,
  },
];

export const chatExamples: CodeExample[] = [
  {
    language: 'curl',
    label: 'cURL',
    code: `curl -X POST https://api.bypotomac.com/api/chat \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \\
  -d '{
    "message": "Analyze the current market conditions for tech stocks",
    "session_id": "optional-session-id"
  }'`,
  },
  {
    language: 'javascript',
    label: 'Node.js',
    code: `const response = await fetch('https://api.bypotomac.com/api/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_ACCESS_TOKEN',
  },
  body: JSON.stringify({
    message: 'Analyze the current market conditions for tech stocks',
    session_id: 'optional-session-id',
  }),
});

// Handle streaming response
const reader = response.body.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  console.log(decoder.decode(value));
}`,
  },
  {
    language: 'python',
    label: 'Python',
    code: `import requests

response = requests.post(
    'https://api.bypotomac.com/api/chat',
    headers={
        'Authorization': 'Bearer YOUR_ACCESS_TOKEN'
    },
    json={
        'message': 'Analyze the current market conditions for tech stocks',
        'session_id': 'optional-session-id'
    },
    stream=True
)

# Handle streaming response
for line in response.iter_lines():
    if line:
        print(line.decode('utf-8'))`,
  },
];
