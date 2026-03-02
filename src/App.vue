<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'

interface TacticAction {
  Step: number
  ItemAbbr: string
  Time: number
  Supply: string
  Number: number
}

interface TacticData {
  Id: string
  Name: string
  Author: string
  Description: string
  ApplicableVersion: string
  TacticType: string
  TacVersion: number
  UpdateTime: string
  ModName: string
  ModVersion: number
  Matchup: string
  Actions: TacticAction[]
  ActionsListStr: string
}

const formRef = ref<FormInstance>()
const actionFormRef = ref<FormInstance>()

const tactic = ref<TacticData>({
  Id: crypto.randomUUID(),
  Name: 'ZvT 早期蟑螂rush',
  Author: 'test',
  Description: '4.10版本ZvT对抗人族速矿的蟑螂rush战术，适合新手',
  ApplicableVersion: '4.10',
  TacticType: 'Timeline',
  TacVersion: 1,
  UpdateTime: new Date().toISOString().slice(0, 19),
  ModName: 'Scii',
  ModVersion: 100,
  Matchup: 'zvt',
  Actions: [
    { Step: 1, ItemAbbr: '工蜂', Time: 30, Supply: '12/12', Number: 12 },
    { Step: 2, ItemAbbr: '血池', Time: 45, Supply: '12/12', Number: 1 },
    { Step: 3, ItemAbbr: '女王', Time: 135, Supply: '18/20', Number: 1 }
  ],
  ActionsListStr: ''
})

const newAction = ref<TacticAction>({
  Step: 0,
  ItemAbbr: '',
  Time: 0,
  Supply: '',
  Number: 1
})

const isActionDialogVisible = ref(false)
const isEditingAction = ref(false)
const editingIndex = ref(-1)

const actionsListStr = computed(() => {
  return tactic.value.Actions
    .sort((a, b) => a.Step - b.Step)
    .map(action => {
      const minutes = Math.floor(action.Time / 60)
      const seconds = action.Time % 60
      const timeStr = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      return `${timeStr}, ${action.ItemAbbr}*${action.Number}, ${action.Supply}`
    })
    .join('\\n')
})

const matchupOptions = [
  { label: 'ZvT', value: 'zvt' },
  { label: 'ZvP', value: 'zvp' },
  { label: 'ZvZ', value: 'zvz' },
  { label: 'TvZ', value: 'tvz' },
  { label: 'TvP', value: 'tvp' },
  { label: 'TvT', value: 'tvt' },
  { label: 'PvZ', value: 'pvz' },
  { label: 'PvT', value: 'pvt' },
  { label: 'PvP', value: 'pvp' }
]

const tacticTypeOptions = [
  { label: 'Timeline', value: 'Timeline' },
  { label: 'Build Order', value: 'Build Order' }
]

const formRules: FormRules = {
  Name: [{ required: true, message: '请输入战术名称', trigger: 'blur' }],
  Author: [{ required: true, message: '请输入作者', trigger: 'blur' }],
  Matchup: [{ required: true, message: '请选择对抗', trigger: 'change' }]
}

const actionFormRules: FormRules = {
  ItemAbbr: [{ required: true, message: '请输入单位/建筑', trigger: 'blur' }],
  Time: [{ required: true, message: '请输入时间', trigger: 'blur' }],
  Supply: [{ required: true, message: '请输入人口', trigger: 'blur' }],
  Number: [{ required: true, message: '请输入数量', trigger: 'blur' }]
}

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

const openAddActionDialog = () => {
  newAction.value = {
    Step: tactic.value.Actions.length + 1,
    ItemAbbr: '',
    Time: 0,
    Supply: '',
    Number: 1
  }
  isEditingAction.value = false
  editingIndex.value = -1
  isActionDialogVisible.value = true
}

const openEditActionDialog = (index: number) => {
  newAction.value = { ...tactic.value.Actions[index] }
  isEditingAction.value = true
  editingIndex.value = index
  isActionDialogVisible.value = true
}

const saveAction = () => {
  actionFormRef.value?.validate((valid) => {
    if (valid) {
      if (isEditingAction.value) {
        tactic.value.Actions[editingIndex.value] = { ...newAction.value }
      } else {
        tactic.value.Actions.push({ ...newAction.value })
      }
      reorderSteps()
      isActionDialogVisible.value = false
      ElMessage.success(isEditingAction.value ? '行动已更新' : '行动已添加')
    }
  })
}

const deleteAction = (index: number) => {
  tactic.value.Actions.splice(index, 1)
  reorderSteps()
  ElMessage.success('行动已删除')
}

const reorderSteps = () => {
  tactic.value.Actions.sort((a, b) => a.Time - b.Time)
  tactic.value.Actions.forEach((action, index) => {
    action.Step = index + 1
  })
}

const moveAction = (index: number, direction: 'up' | 'down') => {
  if (direction === 'up' && index > 0) {
    ;[tactic.value.Actions[index], tactic.value.Actions[index - 1]] = [
      tactic.value.Actions[index - 1],
      tactic.value.Actions[index]
    ]
    reorderSteps()
  } else if (direction === 'down' && index < tactic.value.Actions.length - 1) {
    ;[tactic.value.Actions[index], tactic.value.Actions[index + 1]] = [
      tactic.value.Actions[index + 1],
      tactic.value.Actions[index]
    ]
    reorderSteps()
  }
}

const generateJson = () => {
  tactic.value.UpdateTime = new Date().toISOString().slice(0, 19)
  tactic.value.ActionsListStr = actionsListStr.value.replace(/\\n/g, '\n')
  
  const data = { ...tactic.value }
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${tactic.value.Name.replace(/\s+/g, '_')}.json`
  link.click()
  URL.revokeObjectURL(url)
  
  ElMessage.success('战术文件已生成并下载')
}

const resetForm = () => {
  tactic.value = {
    Id: crypto.randomUUID(),
    Name: '',
    Author: '',
    Description: '',
    ApplicableVersion: '',
    TacticType: 'Timeline',
    TacVersion: 1,
    UpdateTime: new Date().toISOString().slice(0, 19),
    ModName: 'Scii',
    ModVersion: 100,
    Matchup: '',
    Actions: [],
    ActionsListStr: ''
  }
  ElMessage.info('表单已重置')
}
</script>

<template>
  <div class="app-container">
    <el-container class="main-container">
      <el-header class="app-header">
        <div class="header-content">
          <h1><i class="fas fa-trophy"></i> 星际争霸2 战术文件生成器</h1>
        </div>
      </el-header>
      
      <el-main class="app-main">
        <el-card class="form-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span><i class="fas fa-file-alt"></i> 战术信息</span>
            </div>
          </template>
          
          <el-form ref="formRef" :model="tactic" :rules="formRules" label-width="100px">
            <el-row :gutter="16">
              <el-col :xs="24" :sm="12" :md="12" :lg="12">
                <el-form-item label="战术名称" prop="Name">
                  <el-input v-model="tactic.Name" placeholder="请输入战术名称" />
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="12" :md="12" :lg="12">
                <el-form-item label="作者" prop="Author">
                  <el-input v-model="tactic.Author" placeholder="请输入作者" />
                </el-form-item>
              </el-col>
            </el-row>
            
            <el-row :gutter="16">
              <el-col :xs="24" :sm="12" :md="12" :lg="12">
                <el-form-item label="对抗" prop="Matchup">
                  <el-select v-model="tactic.Matchup" placeholder="请选择对抗" style="width: 100%">
                    <el-option 
                      v-for="item in matchupOptions" 
                      :key="item.value" 
                      :label="item.label" 
                      :value="item.value" 
                    />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="12" :md="12" :lg="12">
                <el-form-item label="适用版本">
                  <el-input v-model="tactic.ApplicableVersion" placeholder="例如: 4.10" />
                </el-form-item>
              </el-col>
            </el-row>
            
            <el-row :gutter="16">
              <el-col :xs="24" :sm="12" :md="12" :lg="12">
                <el-form-item label="战术类型">
                  <el-select v-model="tactic.TacticType" placeholder="请选择战术类型" style="width: 100%">
                    <el-option 
                      v-for="item in tacticTypeOptions" 
                      :key="item.value" 
                      :label="item.label" 
                      :value="item.value" 
                    />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="12" :md="12" :lg="12">
                <el-form-item label="战术版本">
                  <el-input-number v-model="tactic.TacVersion" :min="1" style="width: 100%" />
                </el-form-item>
              </el-col>
            </el-row>
            
            <el-form-item label="描述">
              <el-input 
                v-model="tactic.Description" 
                type="textarea" 
                :rows="3" 
                placeholder="请输入战术描述" 
              />
            </el-form-item>
          </el-form>
        </el-card>
        
        <el-card class="actions-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span><i class="fas fa-list"></i> 行动列表</span>
              <el-button type="primary" @click="openAddActionDialog">
                <i class="fas fa-plus"></i> 添加行动
              </el-button>
            </div>
          </template>
          
          <el-table :data="tactic.Actions" style="width: 100%" stripe>
            <el-table-column prop="Step" label="步骤" width="70" align="center" />
            <el-table-column prop="ItemAbbr" label="单位/建筑" min-width="120" />
            <el-table-column label="时间" width="100" align="center">
              <template #default="{ row }">
                {{ formatTime(row.Time) }}
              </template>
            </el-table-column>
            <el-table-column prop="Supply" label="人口" width="90" align="center" />
            <el-table-column prop="Number" label="数量" width="70" align="center" />
            <el-table-column label="操作" width="220" align="center" fixed="right">
              <template #default="{ row, $index }">
                <el-button 
                  size="small" 
                  @click="moveAction($index, 'up')" 
                  :disabled="$index === 0"
                >
                  <i class="fas fa-arrow-up"></i>
                </el-button>
                <el-button 
                  size="small" 
                  @click="moveAction($index, 'down')" 
                  :disabled="$index === tactic.Actions.length - 1"
                >
                  <i class="fas fa-arrow-down"></i>
                </el-button>
                <el-button size="small" type="primary" @click="openEditActionDialog($index)">
                  <i class="fas fa-edit"></i>
                </el-button>
                <el-button size="small" type="danger" @click="deleteAction($index)">
                  <i class="fas fa-trash"></i>
                </el-button>
              </template>
            </el-table-column>
          </el-table>
          
          <div class="actions-preview" v-if="tactic.Actions.length > 0">
            <div class="preview-title"><i class="fas fa-eye"></i> ActionsListStr 预览</div>
            <el-input 
              v-model="actionsListStr" 
              type="textarea" 
              :rows="4" 
              readonly 
            />
          </div>
        </el-card>
        
        <el-card class="buttons-card" shadow="hover">
          <div class="action-buttons">
            <el-button size="large" @click="resetForm">
              <i class="fas fa-redo-alt"></i> 重置
            </el-button>
            <el-button type="primary" size="large" @click="generateJson">
              <i class="fas fa-download"></i> 生成并下载 JSON 文件
            </el-button>
          </div>
        </el-card>
      </el-main>
      
      <el-footer class="app-footer">
        <div class="footer-content">
          <div class="footer-links">
            <a href="https://github.com/cairbin/sc2_tactics_builder" target="_blank">
              <i class="fab fa-github"></i> CairBin/sc2_tactics_builder
            </a>
          </div>
          <div class="footer-info">
            <span class="author">By CairBin</span>
            <span class="separator">|</span>
            <span class="license">
              <i class="fas fa-balance-scale"></i>&nbsp;<el-tag type="success" size="small">MIT License</el-tag>
            </span>
          </div>
        </div>
      </el-footer>
    </el-container>
    
    <el-dialog 
      v-model="isActionDialogVisible" 
      :title="isEditingAction ? '编辑行动' : '添加行动'" 
      width="450px"
    >
      <el-form ref="actionFormRef" :model="newAction" :rules="actionFormRules" label-width="100px">
        <el-form-item label="单位/建筑" prop="ItemAbbr">
          <el-input v-model="newAction.ItemAbbr" placeholder="请输入单位/建筑名称" />
        </el-form-item>
        <el-form-item label="时间(秒)" prop="Time">
          <el-input-number v-model="newAction.Time" :min="0" style="width: 100%" />
        </el-form-item>
        <el-form-item label="人口" prop="Supply">
          <el-input v-model="newAction.Supply" placeholder="例如: 12/12" />
        </el-form-item>
        <el-form-item label="数量" prop="Number">
          <el-input-number v-model="newAction.Number" :min="1" style="width: 100%" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="isActionDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveAction">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.app-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.main-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-header {
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  padding: 0;
  height: auto;
  flex-shrink: 0;
}

.header-content {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 16px 20px;
}

.header-content h1 {
  margin: 0;
  font-size: clamp(20px, 4vw, 28px);
  color: #303133;
  display: flex;
  align-items: center;
  gap: 12px;
  white-space: nowrap;
}

.header-content h1 i {
  font-size: 28px;
  color: #667eea;
}

.app-main {
  padding: clamp(16px, 3vw, 30px);
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
  flex: 1;
  overflow-y: auto;
}

.form-card,
.actions-card,
.buttons-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  font-size: 16px;
  color: #303133;
  flex-wrap: wrap;
  gap: 12px;
}

.card-header span i {
  margin-right: 8px;
  color: #667eea;
}

.card-header .el-button i {
  margin-right: 5px;
}

.actions-preview {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
}

.preview-title {
  font-weight: 600;
  margin-bottom: 12px;
  color: #606266;
  display: flex;
  align-items: center;
  gap: 8px;
}

.preview-title i {
  color: #667eea;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 16px;
  flex-wrap: wrap;
}

.action-buttons .el-button i {
  margin-right: 5px;
}

.app-footer {
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 -2px 12px rgba(0, 0, 0, 0.1);
  padding: 0;
  height: auto;
  flex-shrink: 0;
}

.footer-content {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.footer-links a {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #409eff;
  text-decoration: none;
  font-size: 15px;
  transition: color 0.3s;
  white-space: nowrap;
}

.footer-links a:hover {
  color: #66b1ff;
}

.footer-links a i {
  font-size: 18px;
}

.footer-info {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #606266;
  font-size: 14px;
  flex-wrap: wrap;
}

.separator {
  color: #dcdfe6;
}

.app-footer :deep(.el-tag) {
  font-weight: 500;
  white-space: nowrap;
}

@media (max-width: 768px) {
  .app-main {
    padding: 12px;
  }
  
  .header-content {
    padding: 12px 16px;
  }
  
  .footer-content {
    padding: 12px 16px;
    flex-direction: column;
    align-items: center;
  }
  
  .card-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .action-buttons .el-button {
    width: 100%;
  }
  
  .el-table-column--fixed-right {
    width: 220px !important;
  }
}
</style>
