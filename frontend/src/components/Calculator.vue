<template>
  <div class="calculator">
    <div class="display">
      <div class="expression">{{ expression || '0' }}</div>
      <div class="result">{{ result || '0' }}</div>
    </div>
    
    <div class="buttons">
      <el-button class="btn func" @click="clearAll">C</el-button>
      <el-button class="btn func" @click="toggleSign">±</el-button>
      <el-button class="btn func" @click="backspace">⌫</el-button>
      <el-button class="btn operator" @click="inputOperator('/')">÷</el-button>
      
      <el-button class="btn number" @click="inputNumber('7')">7</el-button>
      <el-button class="btn number" @click="inputNumber('8')">8</el-button>
      <el-button class="btn number" @click="inputNumber('9')">9</el-button>
      <el-button class="btn operator" @click="inputOperator('*')">×</el-button>
      
      <el-button class="btn number" @click="inputNumber('4')">4</el-button>
      <el-button class="btn number" @click="inputNumber('5')">5</el-button>
      <el-button class="btn number" @click="inputNumber('6')">6</el-button>
      <el-button class="btn operator" @click="inputOperator('-')">−</el-button>
      
      <el-button class="btn number" @click="inputNumber('1')">1</el-button>
      <el-button class="btn number" @click="inputNumber('2')">2</el-button>
      <el-button class="btn number" @click="inputNumber('3')">3</el-button>
      <el-button class="btn operator" @click="inputOperator('+')">+</el-button>
      
      <el-button class="btn func" @click="inputBracket('(')">(</el-button>
      <el-button class="btn number" @click="inputNumber('0')">0</el-button>
      <el-button class="btn func" @click="inputBracket(')')">)</el-button>
      <el-button class="btn operator equal" @click="calculate">=</el-button>
      
      <el-button class="btn number dot" @click="inputDot">.</el-button>
      <el-button class="btn history-btn" @click="showHistory = true">历史</el-button>
    </div>

    <el-drawer v-model="showHistory" title="计算历史" direction="rtl" size="300px">
      <div class="history-actions">
        <el-button type="danger" size="small" @click="clearHistory">清空历史</el-button>
      </div>
      <div class="history-list">
        <div 
          v-for="item in history" 
          :key="item.id" 
          class="history-item"
          @click="useHistory(item)"
        >
          <div class="history-expression">{{ item.expression }}</div>
          <div class="history-result">= {{ item.result }}</div>
        </div>
        <div v-if="history.length === 0" class="no-history">暂无历史记录</div>
      </div>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

const expression = ref('')
const result = ref('')
const showHistory = ref(false)
const history = ref([])
const API_BASE = '/api'

const inputNumber = (num) => {
  expression.value += num
}

const inputOperator = (op) => {
  const lastChar = expression.value.slice(-1)
  if (['+', '-', '*', '/'].includes(lastChar)) {
    expression.value = expression.value.slice(0, -1) + op
  } else {
    expression.value += op
  }
}

const inputDot = () => {
  const parts = expression.value.split(/[\+\-\*\/]/)
  const lastPart = parts[parts.length - 1]
  if (!lastPart.includes('.')) {
    if (lastPart === '' || lastPart === '(') {
      expression.value += '0.'
    } else {
      expression.value += '.'
    }
  }
}

const inputBracket = (bracket) => {
  if (bracket === '(') {
    const lastChar = expression.value.slice(-1)
    if (lastChar && !['+', '-', '*', '/', '('].includes(lastChar)) {
      expression.value += '*'
    }
    expression.value += '('
  } else {
    const openCount = (expression.value.match(/\(/g) || []).length
    const closeCount = (expression.value.match(/\)/g) || []).length
    if (openCount > closeCount) {
      const lastChar = expression.value.slice(-1)
      if (!['+', '-', '*', '/', '('].includes(lastChar)) {
        expression.value += ')'
      }
    }
  }
}

const toggleSign = () => {
  if (expression.value === '') return
  
  const lastNumberMatch = expression.value.match(/(-?\d+\.?\d*)$/)
  if (lastNumberMatch) {
    const lastNumber = lastNumberMatch[0]
    const startIndex = lastNumberMatch.index
    const toggledNumber = lastNumber.startsWith('-') 
      ? lastNumber.substring(1) 
      : '-' + lastNumber
    expression.value = expression.value.substring(0, startIndex) + toggledNumber
  }
}

const backspace = () => {
  expression.value = expression.value.slice(0, -1)
}

const clearAll = () => {
  expression.value = ''
  result.value = ''
}

const calculate = async () => {
  if (!expression.value) return
  
  try {
    const openCount = (expression.value.match(/\(/g) || []).length
    const closeCount = (expression.value.match(/\)/g) || []).length
    let finalExpression = expression.value
    if (openCount > closeCount) {
      finalExpression += ')'.repeat(openCount - closeCount)
    }
    
    const evalResult = eval(finalExpression)
    const finalResult = Number.isInteger(evalResult) 
      ? evalResult.toString() 
      : parseFloat(evalResult.toFixed(10)).toString()
    
    result.value = finalResult
    
    await saveHistory(expression.value, finalResult)
  } catch (error) {
    ElMessage.error('表达式错误')
    result.value = 'Error'
  }
}

const saveHistory = async (expr, res) => {
  try {
    const response = await fetch(`${API_BASE}/history`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ expression: expr, result: res })
    })
    if (response.ok) {
      await loadHistory()
    }
  } catch (error) {
    console.error('保存历史失败:', error)
  }
}

const loadHistory = async () => {
  try {
    const response = await fetch(`${API_BASE}/history`)
    const data = await response.json()
    if (data.success) {
      history.value = data.data
    }
  } catch (error) {
    console.error('加载历史失败:', error)
  }
}

const clearHistory = async () => {
  try {
    await fetch(`${API_BASE}/history`, { method: 'DELETE' })
    history.value = []
    ElMessage.success('历史已清空')
  } catch (error) {
    ElMessage.error('清空历史失败')
  }
}

const useHistory = (item) => {
  expression.value = item.result
  showHistory.value = false
}

onMounted(() => {
  loadHistory()
})
</script>

<style scoped>
.calculator {
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  overflow: hidden;
}

.display {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 30px 20px;
  text-align: right;
  min-height: 120px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.expression {
  color: rgba(255, 255, 255, 0.7);
  font-size: 18px;
  margin-bottom: 10px;
  word-wrap: break-word;
  word-break: break-all;
}

.result {
  color: #fff;
  font-size: 36px;
  font-weight: bold;
  word-wrap: break-word;
  word-break: break-all;
}

.buttons {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1px;
  background: #e0e0e0;
  padding: 1px;
}

.btn {
  height: 65px;
  font-size: 22px;
  font-weight: 500;
  border: none;
  border-radius: 0;
  margin: 0;
  transition: all 0.2s;
}

.btn:hover {
  opacity: 0.8;
}

.btn:active {
  transform: scale(0.95);
}

.number {
  background: #fff;
  color: #333;
}

.operator {
  background: #ff9500;
  color: #fff;
}

.func {
  background: #a5a5a5;
  color: #fff;
}

.equal {
  background: #ff9500;
  color: #fff;
}

.dot {
  grid-column: span 1;
}

.history-btn {
  grid-column: span 3;
  background: #667eea;
  color: #fff;
}

.history-actions {
  margin-bottom: 15px;
}

.history-list {
  max-height: calc(100vh - 200px);
  overflow-y: auto;
}

.history-item {
  padding: 12px;
  margin-bottom: 10px;
  background: #f5f7fa;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.history-item:hover {
  background: #e6e8eb;
  transform: translateX(5px);
}

.history-expression {
  color: #606266;
  font-size: 14px;
  margin-bottom: 5px;
  word-wrap: break-word;
}

.history-result {
  color: #409eff;
  font-size: 18px;
  font-weight: bold;
}

.no-history {
  text-align: center;
  color: #909399;
  padding: 40px 0;
}
</style>
