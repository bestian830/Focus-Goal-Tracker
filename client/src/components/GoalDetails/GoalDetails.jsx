import { useState, useEffect } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  IconButton,
  Box,
  Typography,
  Fade,
  Tooltip,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import ProgressTimeline from "./ProgressTimeline";
import DailyTasks from "./DailyTasks";
import WeeklyDailyCards from "./WeeklyDailyCards";
import GoalDeclaration from "./GoalDeclaration";
import apiService from "../../services/api";

// 添加一組鼓勵性名言
const inspirationalQuotes = [
  {
    text: "目標的存在不僅是為了達成，更是為了指引方向。",
    author: "布魯斯·李"
  },
  {
    text: "成功不是最終目標，而是朝著既定方向不斷前進的過程。",
    author: "溫斯頓·邱吉爾"
  },
  {
    text: "你不需要看到整個樓梯，只需要踏出第一步。",
    author: "馬丁·路德·金"
  },
  {
    text: "堅持理想，不要因為遇到暫時的困難而放棄。",
    author: "居里夫人"
  },
  {
    text: "每一個你不想起床的日子，都是一個改變生活的機會。",
    author: "梅拉尼·罗宾斯"
  }
];

export default function GoalDetails({ goals = [], goalId, onGoalDeleted }) {
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [dailyCards, setDailyCards] = useState([]);
  const [declarationOpen, setDeclarationOpen] = useState(false);

  // 通过 goals 数组选择目标
  useEffect(() => {
    console.log("Goals in GoalDetails:", goals);
    // 如果有目标，选择第一个作为默认显示
    if (goals.length > 0 && !selectedGoal) {
      console.log("Setting first goal as default:", goals[0]);
      setSelectedGoal(goals[0]);
    }
  }, [goals, selectedGoal]);

  // 通过 goalId 选择特定目标
  useEffect(() => {
    console.log("goalId in GoalDetails:", goalId);
    if (!goalId) return;

    // 从 goals 数组中选择
    if (goals && goals.length > 0) {
      const goal = goals.find((g) => g._id === goalId || g.id === goalId);
      if (goal) {
        console.log("Found goal from goals array:", goal);
        setSelectedGoal(goal);
      }
    }
  }, [goalId, goals]);

  // 当选中目标变化时，更新每日卡片数据
  useEffect(() => {
    if (selectedGoal && selectedGoal.dailyCards) {
      setDailyCards(selectedGoal.dailyCards);
    } else {
      setDailyCards([]);
    }
  }, [selectedGoal]);

  // Handle opening delete confirmation dialog
  const handleOpenDeleteDialog = () => {
    setDeleteDialogOpen(true);
  };

  // Handle closing delete confirmation dialog
  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
  };

  // Handle deleting the goal
  const handleDeleteGoal = async () => {
    if (!selectedGoal) return;

    try {
      setIsDeleting(true);

      // Call API to delete the goal
      await apiService.goals.delete(selectedGoal._id || selectedGoal.id);

      console.log(
        `Goal deleted successfully: ${selectedGoal._id || selectedGoal.id}`
      );

      // Close dialog
      setDeleteDialogOpen(false);

      // Clear selected goal
      setSelectedGoal(null);

      // Notify parent component
      if (onGoalDeleted) {
        onGoalDeleted(selectedGoal._id || selectedGoal.id);
      }
    } catch (error) {
      console.error("Failed to delete goal:", error);
    } finally {
      setIsDeleting(false);
    }
  };
  
  // 处理DailyCards更新
  const handleDailyCardsUpdate = (updatedCards) => {
    // 更新本地状态
    setDailyCards(updatedCards);
    
    // 更新selectedGoal中的dailyCards
    if (selectedGoal) {
      setSelectedGoal({
        ...selectedGoal,
        dailyCards: updatedCards
      });
    }
  };

  // 处理打开目标宣言对话框
  const handleOpenDeclaration = () => {
    setDeclarationOpen(true);
  };
  
  // 处理关闭目标宣言对话框
  const handleCloseDeclaration = () => {
    setDeclarationOpen(false);
  };
  
  // 处理保存目标宣言
  const handleSaveDeclaration = async (goalId, updatedGoal) => {
    try {
      // 首先更新目标的基本信息
      const baseResponse = await apiService.goals.update(goalId, updatedGoal);
      
      // 然后如果有宣言内容，单独更新宣言
      if (updatedGoal.declaration) {
        await apiService.goals.updateDeclaration(goalId, updatedGoal.declaration);
      }
      
      // 更新本地状态
      if (baseResponse.data) {
        setSelectedGoal(baseResponse.data);
      } else {
        // 如果API没有返回完整数据，则合并更新
        setSelectedGoal(prevGoal => ({
          ...prevGoal,
          ...updatedGoal
        }));
      }
      
      return true;
    } catch (error) {
      console.error("保存目标宣言失败:", error);
      throw error;
    }
  };

  // 如果没有目标，显示提示信息
  if (goals.length === 0 && !goalId) {
    return (
      <div className="goal-details empty-state">
        <h3>还没有设定目标</h3>
        <p>点击"添加目标"按钮开始你的第一个目标</p>
      </div>
    );
  }

  // 如果没有选中的目标，显示加载状态
  if (!selectedGoal) return <div className="goal-details">Loading...</div>;

  console.log("Selected goal in render:", selectedGoal);

  // 构建dailyTasks数据
  const dailyTasks = selectedGoal.checkpoints
    ? selectedGoal.checkpoints
        .filter((cp) => cp.isDaily)
        .map((cp) => ({
          id: cp._id,
          text: cp.title,
          completed: cp.isCompleted,
        }))
    : [];

  // 如果有currentSettings中的dailyTask，也添加到任务列表
  if (selectedGoal.currentSettings && selectedGoal.currentSettings.dailyTask) {
    // 查找是否已经有相同的任务
    const taskExists = dailyTasks.some(
      (task) => task.text === selectedGoal.currentSettings.dailyTask
    );

    if (!taskExists) {
      dailyTasks.push({
        id: "daily-" + Date.now(),
        text: selectedGoal.currentSettings.dailyTask,
        completed: false, // 默认未完成
      });
    }
  }

  const getRandomQuote = () => {
    const randomIndex = Math.floor(Math.random() * inspirationalQuotes.length);
    return inspirationalQuotes[randomIndex];
  };

  return (
    <div className="goal-details">
      <Box
        className="goal-header"
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <div>
          {/* 移除目標選擇器按鈕 - 开始 */}
          {/* {goals.length > 0 && (
            <div className="goals-selector">
              {goals.map((goal) => (
                <button
                  key={goal._id || goal.id}
                  className={`goal-tab ${
                    selectedGoal._id === goal._id || selectedGoal.id === goal.id
                      ? "active"
                      : ""
                  }`}
                  onClick={() => setSelectedGoal(goal)}
                >
                  {goal.title}
                </button>
              ))}
            </div>
          )} */}
          {/* 移除目標選擇器按鈕 - 结束 */}

          <h3>{selectedGoal.title}</h3>
        </div>

        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {/* 宣言按钮 */}
          <Tooltip title="查看目标宣言">
            <IconButton
              color="primary"
              size="small"
              onClick={handleOpenDeclaration}
              aria-label="View goal declaration"
              sx={{ marginTop: "8px", marginRight: "8px" }}
            >
              <MenuBookIcon />
            </IconButton>
          </Tooltip>
          
          {/* 删除按钮 */}
          <IconButton
            color="error"
            size="small"
            onClick={handleOpenDeleteDialog}
            aria-label="Delete goal"
            sx={{ marginTop: "8px" }}
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      </Box>

      <p>{selectedGoal.description}</p>

      {/* Vision Image 與鼓勵名言 */}
      <Box className="vision-section" sx={{ my: 3, textAlign: 'center' }}>
        {selectedGoal.details && selectedGoal.details.visionImage ? (
          <Fade in={true} timeout={800}>
            <Box>
              <img
                src={selectedGoal.details.visionImage}
                alt="目標願景"
                style={{ 
                  maxWidth: "100%", 
                  maxHeight: "250px", 
                  borderRadius: "8px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)" 
                }}
              />
              <Typography 
                variant="body1" 
                sx={{ 
                  mt: 2, 
                  fontStyle: 'italic', 
                  color: 'text.secondary',
                  maxWidth: "80%",
                  mx: 'auto'
                }}
              >
                "{getRandomQuote().text}"
                <Typography component="span" variant="body2" sx={{ display: 'block', mt: 0.5 }}>
                  — {getRandomQuote().author}
                </Typography>
              </Typography>
            </Box>
          </Fade>
        ) : (
          <Fade in={true} timeout={800}>
            <Box sx={{ 
              py: 4, 
              px: 3, 
              bgcolor: 'background.paper', 
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
              maxWidth: "90%",
              mx: 'auto'
            }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontStyle: 'italic', 
                  color: 'text.primary',
                  mb: 1
                }}
              >
                "{getRandomQuote().text}"
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                — {getRandomQuote().author}
              </Typography>
            </Box>
          </Fade>
        )}
      </Box>

      <ProgressTimeline
        progress={
          selectedGoal.progress !== undefined
            ? selectedGoal.progress * 10 // 如果有直接的进度值
            : selectedGoal.checkpoints && selectedGoal.checkpoints.length > 0
            ? (selectedGoal.checkpoints.filter((cp) => cp.isCompleted).length /
                selectedGoal.checkpoints.length) *
              100
            : 0
        }
      />

      {/* 每周DailyCards显示 */}
      <WeeklyDailyCards 
        goal={selectedGoal}
        dailyCards={dailyCards}
        onCardsUpdate={handleDailyCardsUpdate}
      />

      <DailyTasks tasks={dailyTasks} />

      {/* 目标宣言对话框 */}
      <GoalDeclaration
        goal={selectedGoal}
        isOpen={declarationOpen}
        onClose={handleCloseDeclaration}
        onSave={handleSaveDeclaration}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Delete Goal</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the goal "{selectedGoal?.title}"?
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} disabled={isDeleting}>
            Cancel
          </Button>
          <Button
            onClick={handleDeleteGoal}
            color="error"
            variant="contained"
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
