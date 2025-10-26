import { generateStructuredRoadmap } from '../services/geminiService.js';
import Roadmap from '../models/Roadmap.js';

export const generateRoadmap = async (req, res) => {
  const { topic, weeks } = req.body;
  const userId = req.user ? req.user.id : null;

  try {
    if (!topic || !weeks) {
      return res.status(400).json({ error: 'Topic and weeks are required' });
    }

    if (weeks < 1 || weeks > 52) {
      return res.status(400).json({ error: 'Weeks must be between 1 and 52' });
    }

    console.log(` Generating ${weeks}-week roadmap for "${topic}" using Gemini AI`);

    const structuredRoadmap = await generateStructuredRoadmap(topic, weeks);
    const markdownContent = formatRoadmapToMarkdown(structuredRoadmap);

    if (userId) {
      const roadmap = new Roadmap({
        userId,
        topic,
        duration: weeks,
        requestedDuration: weeks,
        content: markdownContent,
        structuredRoadmap: structuredRoadmap,
      });
      await roadmap.save();
      console.log(` Saved roadmap to database`);
    }

    res.status(200).json({
      success: true,
      roadmap: markdownContent,
      structuredData: structuredRoadmap,
      topic: topic,
      weeks: weeks
    });

  } catch (error) {
    console.error('Error generating roadmap:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to generate roadmap',
      message: error.message 
    });
  }
};

export const getRoadmapHistory = async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const history = await Roadmap.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json({ history });
  } catch (error) {
    console.error('Error fetching roadmap history:', error);
    res.status(500).json({ error: 'Failed to fetch roadmap history' });
  }
};

export const submitFeedback = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { roadmapId, rating, helpful, learningPace, tooBasic, tooAdvanced, comments, completedWeeks } = req.body;
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!roadmapId) {
      return res.status(400).json({ error: 'Roadmap ID is required' });
    }

    const roadmap = await Roadmap.findOne({ _id: roadmapId, userId });
    
    if (!roadmap) {
      return res.status(404).json({ error: 'Roadmap not found' });
    }

    roadmap.feedback = {
      rating,
      helpful,
      learningPace,
      tooBasic,
      tooAdvanced,
      comments,
      completedWeeks: completedWeeks || 0,
      submittedAt: new Date()
    };

    await roadmap.save();

    res.status(200).json({ 
      message: 'Feedback submitted successfully',
      feedback: roadmap.feedback 
    });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({ error: 'Failed to submit feedback' });
  }
};

export const getRoadmapById = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const roadmap = await Roadmap.findOne({ _id: id, userId });
    
    if (!roadmap) {
      return res.status(404).json({ error: 'Roadmap not found' });
    }

    res.status(200).json({ roadmap });
  } catch (error) {
    console.error('Error fetching roadmap:', error);
    res.status(500).json({ error: 'Failed to fetch roadmap' });
  }
};

function formatRoadmapToMarkdown(roadmap) {
  let md = `# ${roadmap.topic} Learning Roadmap\n\n`;
  md += `**Duration:** ${roadmap.duration_weeks} weeks\n`;
  md += `**Total Hours:** ${roadmap.total_estimated_hours}\n\n`;
  
  if (roadmap.description) {
    md += `${roadmap.description}\n\n`;
  }

  if (roadmap.prerequisites && roadmap.prerequisites.length > 0) {
    md += `## Prerequisites\n`;
    roadmap.prerequisites.forEach(p => md += `- ${p}\n`);
    md += `\n`;
  }

  if (roadmap.milestones) {
    md += `## Weekly Breakdown\n\n`;
    
    roadmap.milestones.forEach(week => {
      md += `### ${week.title}\n\n`;
      md += `**Difficulty:** ${week.difficulty}\n`;
      md += `**Hours:** ${week.estimated_hours}\n\n`;

      if (week.topics) {
        md += `#### Topics\n`;
        week.topics.forEach(t => md += `- ${t}\n`);
        md += `\n`;
      }

      if (week.youtube_videos) {
        md += `#### 🎥 YouTube Resources\n`;
        week.youtube_videos.forEach(v => {
          if (v.search_query) {
            md += `- **${v.title}** by ${v.channel}\n`;
            md += `  - 🔍 Search: \`${v.search_query}\`\n`;
            if (v.type) md += `  - Type: ${v.type}\n`;
          } else if (v.url) {
            md += `- [${v.title}](${v.url}) by ${v.channel}\n`;
          }
        });
        md += `\n`;
      }

      md += `---\n\n`;
    });
  }

  if (roadmap.projects) {
    md += `## Projects\n\n`;
    roadmap.projects.forEach((p, i) => {
      md += `### ${i + 1}. ${p.title}\n`;
      md += `Week ${p.week_assignment} | ${p.difficulty}\n\n`;
      md += `${p.description}\n\n`;
    });
  }

  return md;
}
