import { HfInference } from '@huggingface/inference';
import Progress from '../models/Progress.js';
import Goal from '../models/Goal.js';
import Report from '../models/Report.js';
import NodeCache from 'node-cache';
const cache = new NodeCache({ stdTTL: 3600 }); // 缓存1小时

class ReportService {
  static async generateReport(goalId, userId, timeRange = 'daily') {
    try {
      // 1. 获取目标信息
      const goal = await Goal.findById(goalId);
      if (!goal) {
        throw new Error('目标不存在');
      }

      // 2. 获取进度记录
      const progress = await Progress.find({
        goalId,
        date: {
          $gte: new Date(new Date().setHours(0, 0, 0, 0)),
          $lt: new Date(new Date().setHours(23, 59, 59, 999))
        }
      }).sort({ date: -1 });

      // 3. 分析数据
      const analysis = {
        totalRecords: progress.length,
        completedTasks: progress.filter(p => p.completed).length,
        completionRate: progress.length > 0 ? 
          (progress.filter(p => p.completed).length / progress.length) * 100 : 0,
        lastUpdate: progress.length > 0 ? progress[0].date : new Date()
      };

      // 4. 准备提示词
      const prompt = this._preparePrompt(goal, progress, analysis);
      
      // 5. 生成AI分析
      const aiAnalysis = await this._generateAIAnalysis(prompt);

      // 6. 创建报告
      const report = new Report({
        goalId,
        userId,
        content: aiAnalysis,
        analysis,
        type: timeRange,
        period: {
          startDate: new Date(new Date().setHours(0, 0, 0, 0)),
          endDate: new Date(new Date().setHours(23, 59, 59, 999))
        },
        isGenerated: true
      });

      await report.save();
      return report;
    } catch (error) {
      console.error('生成报告失败:', error);
      throw error;
    }
  }

  static async getLatestReport(goalId, userId) {
    try {
      return await Report.findOne({ goalId, userId })
        .sort({ createdAt: -1 });
    } catch (error) {
      console.error('获取最新报告失败:', error);
      throw error;
    }
  }

  static async _generateAIAnalysis(prompt) {
    try {
      const hf = new HfInference(process.env.HUGGING_FACE_API_KEY);
      
      const result = await hf.textGeneration({
        model: 'gpt2', // 或其他适合的模型
        inputs: prompt,
        parameters: {
          max_new_tokens: 500,
          temperature: 0.7,
          top_p: 0.95,
          do_sample: true
        }
      });

      return result.generated_text;
    } catch (error) {
      console.error('AI 分析生成失败:', error);
      throw new Error('AI分析生成失败，请稍后重试');
    }
  }

  static _preparePrompt(goal, progress, analysis) {
    return `
作为一个专业的目标分析助手，请根据以下信息生成一份详细的分析报告：

目标信息：
标题：${goal.title}
当前任务：${goal.currentSettings?.dailyTask || '无'}
优先级：${goal.priority || '未设置'}

今日进度数据：
- 总记录数：${analysis.totalRecords}
- 已完成任务：${analysis.completedTasks}
- 完成率：${analysis.completionRate.toFixed(1)}%

详细记录：
${progress.map(p => `- ${new Date(p.date).toLocaleTimeString()}: ${p.content || '无内容'}`).join('\n')}

请从以下几个方面进行分析：
1. 进度评估：分析当前进度情况，包括完成度和效率
2. 模式识别：分析用户的工作/学习模式，找出规律
3. 改进建议：根据分析提出具体的改进建议
4. 激励反馈：给出积极的反馈和鼓励

请用中文回复，语气要积极正面，建议要具体可行。
    `.trim();
  }

  static _generateSuggestions(analysis, goal) {
    const suggestions = [];

    if (analysis.totalRecords === 0) {
      suggestions.push('• 今天还没有任何进度记录，建议及时记录您的进展。');
    } else if (analysis.completionRate < 50) {
      suggestions.push('• 当前完成率较低，建议制定更具体的行动计划。');
      suggestions.push('• 考虑将任务拆分成更小的步骤，逐步完成。');
    } else if (analysis.completionRate >= 80) {
      suggestions.push('• 完成情况良好，继续保持这样的节奏！');
      suggestions.push('• 可以考虑适当提高目标难度，挑战自己。');
    }

    if (goal.currentSettings?.dailyTask) {
      suggestions.push(`• 今日任务「${goal.currentSettings.dailyTask}」正在进行中。`);
    }

    return suggestions.join('\n');
  }

  static _generateActionPlan(analysis, goal) {
    const plans = [];
    
    if (goal.currentSettings?.dailyTask) {
      plans.push(`1. 完成今日任务：${goal.currentSettings.dailyTask}`);
    }

    if (analysis.completionRate < 50) {
      plans.push('2. 回顾未完成的任务，找出困难点');
      plans.push('3. 适当调整任务难度或寻求帮助');
    } else {
      plans.push('2. 记录今日经验和心得');
      plans.push('3. 规划明日任务重点');
    }

    return plans.join('\n');
  }

  static _generateInsights(analysis, goal) {
    const insights = [];
    
    if (analysis.totalRecords > 0) {
      insights.push(`今日任务参与度：${analysis.completionRate.toFixed(1)}%`);
      insights.push(`完成任务数量：${analysis.completedTasks}/${analysis.totalRecords}`);
    }
    
    return insights;
  }

  static _generateRecommendations(analysis, goal) {
    const recommendations = [];
    
    if (analysis.completionRate < 50) {
      recommendations.push('建议增加任务执行频率');
      recommendations.push('考虑调整任务难度');
    } else if (analysis.completionRate >= 80) {
      recommendations.push('可以尝试提高任务难度');
      recommendations.push('分享成功经验给其他用户');
    }
    
    return recommendations;
  }
}

export default ReportService;