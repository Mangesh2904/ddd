import { askGemini, generateContent } from '../services/geminiService.js';
import Placement from '../models/Placement.js';

export const generatePlacementContent = async (req, res) => {
  const { companyName, role } = req.body;
  const userId = req.user ? req.user.id : null;

  // Debug logging
  console.log('=== Placement Content Generation ===');
  console.log('Company Name:', companyName);
  console.log('Role:', role);
  console.log('User ID:', userId);

  try {
    if (!companyName || !companyName.trim()) {
      console.log('Error: Company name is missing');
      return res.status(400).json({ error: 'Company name is required' });
    }

    if (!role || !role.trim()) {
      console.log('Error: Role is missing');
      return res.status(400).json({ error: 'Role is required' });
    }

    // Generate comprehensive placement preparation guidance
    const guidancePrompt = `Create a comprehensive placement preparation guide for the ${role} position at ${companyName}.

**CRITICAL: Make this guide practical, actionable, and company-specific.**

Structure the guide with these sections:

## About ${companyName}
- Brief company overview and what they do
- Company culture and values
- Why work at ${companyName}
- Recent news or developments

## ${role} Role at ${companyName}
- Key responsibilities and expectations
- Required technical skills
- Day-to-day activities
- Team structure and collaboration

## Interview Process
- Typical interview rounds (phone screen, technical, behavioral, system design, etc.)
- What to expect in each round
- Duration and timeline
- Common interview formats

## Technical Preparation
### Core Topics to Master
- List the most important technical topics for ${role}
- Prioritize based on ${companyName}'s tech stack
- Include both fundamental and advanced concepts

### Key Skills Required
- Programming languages (with proficiency levels)
- Frameworks and tools
- System design knowledge
- Problem-solving approaches

### Data Structures & Algorithms
- Most frequently asked DS&A topics
- Difficulty levels to focus on
- Time complexity analysis tips

### System Design (if applicable)
- Key system design concepts
- Scalability and distributed systems
- ${companyName}-specific architecture patterns

## Preparation Strategy
### Timeline (Recommended)
- Week 1-2: Focus areas
- Week 3-4: Focus areas
- Week 5-6: Final preparation

### Daily Study Plan
- Hours to dedicate
- Topic distribution
- Practice vs Theory ratio

### Practice Recommendations
- Number of problems to solve
- Types of problems to focus on
- Mock interview importance

## Important Tips
- Company-specific interview tips
- Common mistakes to avoid
- How to stand out
- Questions to ask interviewers

## Soft Skills & Behavioral Prep
- Common behavioral questions for ${role}
- STAR method examples
- Leadership and teamwork scenarios
- Communication tips

Format this professionally with clear markdown headers, bullet points, and actionable advice. Make it comprehensive but scannable.`;

    // Generate resources with REAL links
    const resourcesPrompt = `Generate a comprehensive list of learning resources to prepare for ${role} position at ${companyName}.

**CRITICAL: Provide REAL, WORKING resources. Use well-known platforms and channels.**

Return ONLY a JSON object in this exact format:
{
  "youtube": [
    {
      "title": "<Descriptive title of what this video/playlist teaches>",
      "channel": "<Channel name from: freeCodeCamp, Traversy Media, The Net Ninja, Academind, Programming with Mosh, Web Dev Simplified, Fireship, Tech With Tim, CS Dojo, etc.>",
      "description": "<Why this is useful for the role>",
      "type": "playlist|video"
    }
  ],
  "coding_practice": [
    {
      "platform": "LeetCode|HackerRank|InterviewBit|CodeSignal",
      "title": "<What to practice>",
      "description": "<Specific problem patterns or lists>",
      "difficulty": "Easy|Medium|Hard|Mixed",
      "link_description": "<e.g., 'Search for Amazon tagged problems on LeetCode'>"
    }
  ],
  "articles": [
    {
      "title": "<Article topic>",
      "platform": "Medium|GeeksforGeeks|Dev.to|Company Engineering Blog",
      "description": "<What you'll learn>",
      "search_query": "<Exact search query to find this>"
    }
  ],
  "github_repos": [
    {
      "title": "<Repository purpose>",
      "description": "<What it contains>",
      "topics": ["<topic1>", "<topic2>"],
      "search_query": "<GitHub search query like 'interview preparation ${role}'>"
    }
  ],
  "documentation": [
    {
      "title": "<Technology/Tool name>",
      "type": "Official Docs|Tutorial|Guide",
      "description": "<Why read this>",
      "platform": "<Where to find it>"
    }
  ],
  "courses": [
    {
      "title": "<Course name>",
      "platform": "Udemy|Coursera|edX|YouTube",
      "description": "<What it covers>",
      "relevance": "<How it helps for ${companyName} ${role}>"
    }
  ],
  "books": [
    {
      "title": "<Book name>",
      "author": "<Author name>",
      "description": "<What it covers>",
      "relevance": "<Why it's important>"
    }
  ],
  "company_specific": [
    {
      "type": "Engineering Blog|Tech Talks|Open Source Projects|Career Page",
      "title": "<Resource title>",
      "description": "<What to learn from it>",
      "how_to_find": "<Where to look for this resource>"
    }
  ]
}

IMPORTANT:
- Provide 3-5 items per category
- Focus on quality over quantity
- Make sure resources are actually relevant to ${role} at ${companyName}
- Include diverse learning formats
- Prioritize free resources when possible`;

    // Get guidance and resources in parallel
    console.log('Sending prompts to Gemini for:', companyName, 'and role:', role);
    const [guidanceResponse, resourcesResponse] = await Promise.all([
      generateContent(guidancePrompt, 4096),
      generateContent(resourcesPrompt, 4096)
    ]);
    console.log('Received responses from Gemini');

    // Parse resources JSON with robust error handling
    let resources;
    try {
      console.log('Raw resources response length:', resourcesResponse.length);
      
      // Clean the response to extract JSON
      let cleanedResourcesResponse = resourcesResponse
        .replace(/```json\n?/gi, '')
        .replace(/```\n?/gi, '')
        .replace(/^[^{]*/, '') // Remove any text before {
        .replace(/[^}]*$/, '') // Remove any text after }
        .trim();
      
      // Try to find JSON object in the response
      const jsonObjectMatch = cleanedResourcesResponse.match(/\{[\s\S]*\}/);
      if (jsonObjectMatch) {
        cleanedResourcesResponse = jsonObjectMatch[0];
      }
      
      console.log('Cleaned response length:', cleanedResourcesResponse.length);
      
      resources = JSON.parse(cleanedResourcesResponse);
      
      // Validate resources format
      if (typeof resources !== 'object' || Array.isArray(resources)) {
        throw new Error('Invalid resources format - not an object');
      }

      console.log('Successfully parsed resources');

    } catch (parseError) {
      console.error('Error parsing resources JSON:', parseError.message);
      console.error('Response that failed:', resourcesResponse.substring(0, 500));
      
      // Fallback resources structure
      resources = {
        youtube: [
          {
            title: `${role} Interview Preparation`,
            channel: "freeCodeCamp",
            description: "Comprehensive interview preparation videos",
            type: "playlist"
          },
          {
            title: `${companyName} Interview Experience`,
            channel: "Tech With Tim",
            description: "Learn from real interview experiences",
            type: "video"
          }
        ],
        coding_practice: [
          {
            platform: "LeetCode",
            title: `${companyName} Tagged Problems`,
            description: "Practice problems frequently asked by the company",
            difficulty: "Mixed",
            link_description: `Search for '${companyName}' tagged problems on LeetCode`
          },
          {
            platform: "InterviewBit",
            title: `${role} Practice Track`,
            description: "Structured practice for the role",
            difficulty: "Mixed",
            link_description: "Complete the structured interview preparation track"
          }
        ],
        articles: [
          {
            title: `How to Crack ${companyName} Interview`,
            platform: "GeeksforGeeks",
            description: "Interview preparation guide",
            search_query: `${companyName} interview preparation`
          }
        ],
        github_repos: [
          {
            title: "Interview Preparation Kit",
            description: "Comprehensive collection of interview resources",
            topics: ["interviews", "coding", role.toLowerCase()],
            search_query: `${role} interview preparation`
          }
        ],
        documentation: [
          {
            title: "Core Technologies Documentation",
            type: "Official Docs",
            description: "Study official documentation of technologies used",
            platform: "Official websites"
          }
        ],
        courses: [
          {
            title: `${role} Interview Preparation`,
            platform: "YouTube",
            description: "Free comprehensive course",
            relevance: "Covers all essential topics"
          }
        ],
        books: [
          {
            title: "Cracking the Coding Interview",
            author: "Gayle Laakmann McDowell",
            description: "Classic interview preparation book",
            relevance: "Essential for technical interviews"
          }
        ],
        company_specific: [
          {
            type: "Engineering Blog",
            title: `${companyName} Engineering Blog`,
            description: "Learn about the company's tech stack and challenges",
            how_to_find: `Search for '${companyName} engineering blog' or visit company website`
          }
        ]
      };
      console.log('Using fallback resources');
    }

    // Save to database if user is authenticated
    if (userId) {
      try {
        const placement = new Placement({
          userId,
          companyName: companyName.trim(),
          role: role.trim(),
          guidance: guidanceResponse,
          resources: resources
        });
        await placement.save();
      } catch (saveError) {
        console.error('Error saving placement data:', saveError);
        // Don't fail the request if saving fails
      }
    }

    res.status(200).json({
      guidance: guidanceResponse,
      resources: resources,
      companyName: companyName.trim(),
      role: role.trim()
    });

  } catch (error) {
    console.error('Error generating placement content:', error);
    res.status(500).json({ error: 'Failed to generate placement content' });
  }
};

export const getPlacementHistory = async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required to access placement history' });
    }

    const history = await Placement.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json({ history });
  } catch (error) {
    console.error('Error fetching placement history:', error);
    res.status(500).json({ error: 'Failed to fetch placement history' });
  }
};

export const searchCompanies = async (req, res) => {
  const { query } = req.query;

  if (!query || query.trim().length < 2) {
    return res.status(400).json({ error: 'Query must be at least 2 characters' });
  }

  try {
    const searchPrompt = `List 10 well-known technology companies whose names start with or contain "${query}". Include both large corporations and notable startups.

Return ONLY a JSON array of company names, no additional text:
["Company Name 1", "Company Name 2", ...]

Examples format: ["Google", "Microsoft", "Amazon", "Meta", "Netflix", "Apple", "Tesla", "Uber", "Airbnb", "Stripe"]

Focus on:
- Tech companies (software, hardware, cloud, AI, etc.)
- Companies known for hiring software engineers
- Mix of FAANG, unicorns, and well-known startups
- Real company names only

Return exactly 10 suggestions that match "${query}".`;

    const response = await generateContent(searchPrompt, 1024);
    
    // Parse the JSON response with robust error handling
    let companies;
    try {
      console.log('Company search response length:', response.length);
      
      // More aggressive cleaning
      let cleanedResponse = response
        .replace(/```json\n?/gi, '')
        .replace(/```\n?/gi, '')
        .replace(/^[^\[]*/, '') // Remove text before [
        .replace(/[^\]]*$/, '') // Remove text after ]
        .trim();
      
      // Try to extract JSON array
      const jsonMatch = cleanedResponse.match(/\[[\s\S]*?\]/);
      if (jsonMatch) {
        cleanedResponse = jsonMatch[0];
      }
      
      console.log('Cleaned company response:', cleanedResponse.substring(0, 200));
      
      companies = JSON.parse(cleanedResponse);
      
      if (!Array.isArray(companies)) {
        throw new Error('Invalid response format - not an array');
      }
      
      // Filter out any non-string entries and limit to 10
      companies = companies
        .filter(c => typeof c === 'string' && c.trim().length > 0)
        .slice(0, 10);
      
      if (companies.length === 0) {
        throw new Error('No valid companies in response');
      }
      
      console.log(`Found ${companies.length} companies`);
      
    } catch (parseError) {
      console.error('Error parsing companies:', parseError.message);
      console.error('Response:', response.substring(0, 300));
      
      // Fallback with common tech companies matching the query
      const queryLower = query.toLowerCase();
      const fallbackCompanies = [
        'Google', 'Microsoft', 'Amazon', 'Apple', 'Meta',
        'Netflix', 'Tesla', 'Uber', 'Airbnb', 'Adobe',
        'Oracle', 'IBM', 'Salesforce', 'Intel', 'Nvidia',
        'Twitter', 'LinkedIn', 'Spotify', 'Slack', 'Zoom',
        'PayPal', 'Stripe', 'Square', 'Shopify', 'Atlassian',
        'Dropbox', 'Snapchat', 'Pinterest', 'Reddit', 'Discord',
        'GitHub', 'GitLab', 'Figma', 'Notion', 'Asana'
      ];
      
      companies = fallbackCompanies
        .filter(c => c.toLowerCase().includes(queryLower))
        .slice(0, 10);
      
      // If no matches, suggest based on first letter
      if (companies.length === 0) {
        companies = fallbackCompanies
          .filter(c => c.toLowerCase().startsWith(queryLower[0]))
          .slice(0, 10);
      }
      
      // If still no matches, return top 10
      if (companies.length === 0) {
        companies = fallbackCompanies.slice(0, 10);
      }
      
      console.log('Using fallback companies:', companies.length);
    }

    res.status(200).json({ companies });
  } catch (error) {
    console.error('Error searching companies:', error);
    res.status(500).json({ error: 'Failed to search companies' });
  }
};
