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
  CircularProgress,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import MenuBookIcon from "@mui/icons-material/MenuBook";
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

export default function GoalDetails({ goals = [], goalId, onGoalDeleted, refreshGoalData: parentRefreshGoalData }) {
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [dailyCards, setDailyCards] = useState([]);
  const [declarationOpen, setDeclarationOpen] = useState(false);
  const [isLoadingDeclaration, setIsLoadingDeclaration] = useState(false);

  // New effect to handle export button click for declaration
  useEffect(() => {
    // Function to handle export button clicks
    const handleExportButtonClick = () => {
      // Check if declaration dialog should be temporarily opened for export
      const shouldOpenDeclaration = document.querySelector('[data-export-id="goal-declaration-content"]') === null;
      
      if (shouldOpenDeclaration && selectedGoal) {
        console.log("Opening declaration dialog for export");
        handleOpenDeclaration();
      }
    };

    // Add event listener for export button clicks
    document.addEventListener('click', (e) => {
      if (e.target.closest('button') && e.target.textContent.includes('Export')) {
        handleExportButtonClick();
      }
    });

    return () => {
      // Clean up event listener
      document.removeEventListener('click', handleExportButtonClick);
    };
  }, [selectedGoal]);

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

    // 獲取當前用戶ID
    const getCurrentUserId = () => {
      const userId = localStorage.getItem("userId");
      const tempId = localStorage.getItem("tempId");
      return userId || tempId;
    };

    const currentUserId = getCurrentUserId();
    console.log("當前用戶ID:", currentUserId);

    try {
      // 從 goals 數組中選擇，並檢查用戶ID
      if (goals && goals.length > 0) {
        const goal = goals.find((g) => {
          const matchId = (g._id === goalId || g.id === goalId);
          const matchUserId = (g.userId === currentUserId);
          
          console.log("目標匹配檢查:", {
            goalId: g._id || g.id,
            matchId,
            goalUserId: g.userId,
            currentUserId,
            matchUserId
          });

          return matchId && matchUserId;
        });

        if (goal) {
          console.log("從本地goals數組找到匹配目標:", goal);
          setSelectedGoal(goal);
          return;
        } else {
          console.log(`在本地goals數組中未找到ID為${goalId}的目標，且用戶ID匹配，嘗試從API獲取`);
        }
      } else {
        console.log("goals數組為空或無效");
      }
      
      // 如果在本地goals數組中未找到目標，嘗試從API直接獲取
      const fetchGoalDetails = async () => {
        try {
          console.log(`嘗試從API獲取目標詳情，ID: ${goalId}`);
          const response = await apiService.goals.getById(goalId);
          
          if (response && response.data && response.data.data) {
            const apiGoal = response.data.data;
            
            // 額外檢查用戶ID是否匹配
            if (apiGoal.userId !== currentUserId) {
              console.error("目標不屬於當前用戶");
              return;
            }
            
            console.log("從API獲取到目標詳情:", apiGoal);
            setSelectedGoal(apiGoal);
          } else {
            console.error("API沒有返回有效的目標數據");
          }
        } catch (error) {
          console.error(`從API獲取目標詳情失敗，ID: ${goalId}`, error);
        }
      };
      
      fetchGoalDetails();
    } catch (error) {
      console.error("選擇目標時出錯:", error);
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
    // 使用深拷贝确保不共享对象引用
    const safeUpdatedCards = JSON.parse(JSON.stringify(updatedCards));
    
    console.log('GoalDetails中接收到卡片更新:', {
      卡片数量: safeUpdatedCards.length,
      首个卡片状态: safeUpdatedCards[0]?.taskCompletions
    });
    
    // 更新本地状态
    setDailyCards(safeUpdatedCards);
    
    // 更新selectedGoal中的dailyCards
    if (selectedGoal) {
      setSelectedGoal({
        ...selectedGoal,
        dailyCards: safeUpdatedCards
      });
    }
  };

  // 處理打開目標宣言對話框
  const handleOpenDeclaration = async () => {
    console.log("開始處理打開宣言流程", { 
      selectedGoal, 
      declaration: selectedGoal?.declaration 
    });

    if (!selectedGoal) {
      console.warn("沒有選中的目標，無法打開宣言");
      setDeclarationOpen(true);
      return;
    }

    try {
      setIsLoadingDeclaration(true);
      const goalId = selectedGoal._id || selectedGoal.id;

      // 強制獲取最新數據
      try {
        const response = await apiService.goals.getById(goalId);
        
        if (response && response.data && response.data.data) {
          const freshGoal = response.data.data;
          console.log("從API獲取最新目標數據:", freshGoal);

          // 確保declaration對象存在
          if (!freshGoal.declaration) {
            freshGoal.declaration = {
              content: `This goal isn't just another item on my list–it's something I genuinely want to achieve.

我是 User，我踏上這條路是因為：這是一個對我意義深遠的追求，來自內心最真誠的渴望。

我相信我有能力實現它，因為我已經準備好了。這是我的信心和力量之源。

我不需要等待"完全準備好"。現在就是開始的最佳時刻。接下來，我將邁出第一步，讓動力帶領我前進。

我明白，只要我每天堅持，一點一滴，我就會逐漸接近我渴望實現的目標。

當我閉上眼睛，我清晰地看到這個畫面：
[尚未設定願景圖像]

這不僅僅是我期望結果的願景，更是推動我前進的驅動力。`,
              updatedAt: new Date(),
              vision: ""
            };
          }

          // 更新本地狀態
          setSelectedGoal(freshGoal);
          
          // 直接打開對話框
          setDeclarationOpen(true);
        } else {
          console.warn("API返回無效的目標數據");
          setDeclarationOpen(true);
        }
      } catch (apiError) {
        console.error("獲取目標詳情失敗", apiError);
        
        // 即使API失敗，也嘗試使用本地數據
        const localGoal = { ...selectedGoal };
        if (!localGoal.declaration) {
          localGoal.declaration = {
            content: `預設宣言內容 - 無法從API獲取`,
            updatedAt: new Date()
          };
        }
        
        setDeclarationOpen(true);
      } finally {
        setIsLoadingDeclaration(false);
      }
    } catch (error) {
      console.error("打開宣言對話框時發生錯誤", error);
      setDeclarationOpen(true);
      setIsLoadingDeclaration(false);
    }
  };
  
  // 处理关闭目标宣言对话框
  const handleCloseDeclaration = async () => {
    setDeclarationOpen(false);
    
    // 关闭后立即刷新目标数据，确保显示最新数据
    if (selectedGoal) {
      try {
        const goalId = selectedGoal._id || selectedGoal.id;
        console.log("关闭宣言对话框后刷新目标数据:", goalId);
        
        // 使用Promise.all同时刷新目标数据和每日卡片数据
        Promise.all([
          // 刷新目标数据
          refreshGoalData(goalId).catch(error => {
            console.error("后台刷新目标数据失败:", error);
          }),
          
          // 重新获取每日卡片数据
          (async () => {
            try {
              console.log("重新获取每日卡片数据");
              const response = await apiService.goals.getById(goalId);
              if (response.data && response.data.data && response.data.data.dailyCards) {
                console.log("获取到最新每日卡片数据:", response.data.data.dailyCards.length, "张卡片");
                setDailyCards(response.data.data.dailyCards);
              }
            } catch (error) {
              console.error("获取每日卡片数据失败:", error);
            }
          })()
        ]).catch(error => {
          // 这里可以考虑添加一个轻量级的通知，但不阻塞UI
          console.error("数据刷新失败:", error);
        });
      } catch (error) {
        console.error("关闭对话框后处理失败:", error);
      }
    }
  };
  
  // 刷新目标数据
  const refreshGoalData = async (goalId) => {
    try {
      console.log("刷新目标数据:", goalId);
      
      // 检查goalId是否有效
      if (!goalId) {
        console.error("无法刷新目标数据：goalId无效");
        return;
      }
      
      // 使用从父组件传递的刷新方法
      if (parentRefreshGoalData) {
        try {
          const updatedGoal = await parentRefreshGoalData(goalId);
          if (updatedGoal) {
            // 直接设置更新后的目标
            setSelectedGoal(updatedGoal);
            return;
          }
        } catch (refreshError) {
          console.error("父组件刷新方法失败:", refreshError);
          // 继续使用默认方法
        }
      }
      
      // 如果父组件没有提供刷新方法或刷新失败，使用默认的获取方法
      try {
        const response = await apiService.goals.getById(goalId);
        if (response.data && response.data.data) {
          console.log("获取到最新目标数据:", response.data.data);
          // 更新本地状态
          setSelectedGoal(response.data.data);
        }
      } catch (error) {
        console.error(`获取目标详情失败，ID: ${goalId}`, error);
      }
    } catch (error) {
      console.error("刷新目标数据失败:", error);
    }
  };
  
  // 处理保存目标宣言
  const handleSaveDeclaration = async (goalId, updatedGoal) => {
    try {
      console.log("開始保存宣言數據:", { 
        原始goalId: goalId, 
        updatedGoal: {
          title: updatedGoal.title,
          hasDeclaration: !!updatedGoal.declaration
        }
      });

      // 增強ID驗證
      const safeGoalId = goalId || 
        (selectedGoal?._id) || 
        (selectedGoal?.id) || 
        updatedGoal?._id || 
        updatedGoal?.id;

      if (!safeGoalId) {
        console.error("無法確定目標ID，更新失敗");
        throw new Error("Invalid Goal ID");
      }

      console.log("使用安全的目標ID:", safeGoalId);

      // 準備更新數據
      const fullUpdateData = {
        ...updatedGoal,
        _id: safeGoalId  // 確保ID一致
      };

      // 調用API更新
      const response = await apiService.goals.update(safeGoalId, fullUpdateData);
      
      // 確保返回完整數據
      const updatedGoalData = response?.data?.data || {
        ...selectedGoal,
        ...fullUpdateData
      };

      // 更新本地狀態
      setSelectedGoal(prevGoal => ({
        ...prevGoal,
        ...updatedGoalData,
        _id: safeGoalId  // 強制設置ID
      }));

      // 通知父組件進行全局更新
      if (parentRefreshGoalData) {
        try {
          await parentRefreshGoalData(safeGoalId);
        } catch (refreshError) {
          console.warn("父組件更新失敗", refreshError);
        }
      }

      return {
        data: updatedGoalData,
        status: 200
      };
    } catch (error) {
      console.error("保存宣言失敗:", error);
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
              disabled={isLoadingDeclaration}
            >
              {isLoadingDeclaration ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                <MenuBookIcon />
              )}
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
        {selectedGoal.visionImageUrl ? (
          <Fade in={true} timeout={800}>
            <Box>
              <img
                src={selectedGoal.visionImageUrl}
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

      {/* 每周DailyCards显示 */}
      <WeeklyDailyCards
        goal={selectedGoal}
        dailyCards={dailyCards}
        onCardsUpdate={handleDailyCardsUpdate}
        onViewDeclaration={handleOpenDeclaration}
      />

      {/* <DailyTasks tasks={dailyTasks} /> */}

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
