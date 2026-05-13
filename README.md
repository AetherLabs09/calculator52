# 计算器工具软件

基于 Vue3 + Element Plus + Node.js + SQLite 的计算器应用

## 功能特性

1. **基础四则运算** - 支持加、减、乘、除常规数学计算
2. **小数点与正负号** - 可输入小数，支持正负数切换
3. **清零删除功能** - 支持单步删除和一键清空
4. **历史记录保存** - 自动记录计算式子与结果，可回看复用
5. **括号优先级运算** - 支持多层括号混合运算
6. **后退撤销功能** - 逐步撤销输入内容
7. **竖屏基础计算** - 响应式设计，支持移动端

## 项目结构

```
.
├── Dockerfile              # Docker镜像构建文件
├── nginx.conf             # Nginx配置文件
├── start.sh               # 容器启动脚本
└── repo/
    ├── frontend/          # 前端项目
    │   ├── src/
    │   │   ├── components/
    │   │   │   └── Calculator.vue
    │   │   ├── App.vue
    │   │   └── main.js
    │   ├── index.html
    │   ├── package.json
    │   └── vite.config.js
    └── backend/           # 后端项目
        ├── server.js
        └── package.json
```

## Docker 部署

### 构建镜像

```bash
docker build -t calculator-app .
```

### 运行容器

```bash
docker run -d -p 80:80 --name calculator calculator-app
```

### 访问应用

打开浏览器访问: http://localhost

## 本地开发

### 后端开发

```bash
cd repo/backend
npm install
npm start
```

后端服务运行在 http://localhost:3000

### 前端开发

```bash
cd repo/frontend
npm install
npm run dev
```

前端服务运行在 http://localhost:5173

## 技术栈

- **前端**: Vue 3, Element Plus, Vite
- **后端**: Node.js, Express
- **数据库**: SQLite (better-sqlite3)
- **Web服务器**: Nginx
- **容器化**: Docker

## API 接口

- `GET /api/history` - 获取历史记录
- `POST /api/history` - 保存历史记录
- `DELETE /api/history` - 清空所有历史记录
- `DELETE /api/history/:id` - 删除指定历史记录

## 容器内目录结构

- `/app/frontend` - 前端静态文件
- `/app/backend` - 后端应用
- `/app/db` - SQLite数据库文件
