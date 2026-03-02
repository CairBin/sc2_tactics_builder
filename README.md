# 星际争霸2 战术文件生成器

一个基于 Vue 3 + Element Plus + Font Awesome 构建的星际争霸2战术文件生成器，支持通过可视化操作生成符合特定格式的 JSON 战术文件。

## 功能特性

- ✅ 可视化编辑战术信息（名称、作者、描述、版本等）
- ✅ 直观的行动列表管理（添加、编辑、删除、调整顺序）
- ✅ 自动生成 ActionsListStr 字段
- ✅ 一键下载 JSON 战术文件
- ✅ 响应式设计，适配各种屏幕尺寸
- ✅ 美观的卡片式布局
- ✅ Font Awesome 图标支持

## 技术栈

- Vue 3 + TypeScript
- Element Plus
- Font Awesome
- Vite

## 安装与运行

### 安装依赖

```bash
npm install
```

### 开发模式运行

```bash
npm run dev
```

### 构建生产版本

```bash
npx vite build
```

## Cloudflare Worker 自动部署

项目已配置 Cloudflare Worker 自动构建和部署，通过 GitHub Actions 实现。

### 配置步骤

1. **安装 Wrangler CLI**（本地开发用）
   ```bash
   npm install -g wrangler
   ```

2. **配置 Cloudflare API Token**
   - 在 GitHub 仓库中添加名为 `CLOUDFLARE_API_TOKEN` 的 secret
   - 此 token 需要具有 Workers KV 编辑权限

3. **部署命令**
   ```bash
   wrangler deploy
   ```

### 自动部署流程

- 当推送到 `main` 或 `master` 分支时，GitHub Actions 会自动：
  1. 安装依赖
  2. 构建项目
  3. 部署到 Cloudflare Workers

## 使用方法

1. **填写战术信息**：在表单中填写战术名称、作者、描述等基本信息
2. **添加行动**：点击"添加行动"按钮，填写单位/建筑、时间、人口、数量等信息
3. **管理行动**：可以通过上下箭头调整行动顺序，或编辑/删除行动
4. **预览生成结果**：在 ActionsListStr 预览区域查看生成的格式
5. **生成并下载**：点击"生成并下载 JSON 文件"按钮，保存战术文件

## 战术文件格式

生成的 JSON 文件格式如下：

```json
{
  "Id": "f81d4fae-7dec-11d0-a765-00a0c91e6bf6",
  "Name": "ZvT 早期蟑螂rush",
  "Author": "test",
  "Description": "4.10版本ZvT对抗人族速矿的蟑螂rush战术，适合新手",
  "ApplicableVersion": "4.10",
  "TacticType": "Timeline",
  "TacVersion": 1,
  "UpdateTime": "2024-05-20T14:30:00",
  "ModName": "Scii",
  "ModVersion": 100,
  "Matchup": "zvt",
  "Actions": [
    {
      "Step": 1,
      "ItemAbbr": "工蜂",
      "Time": 30,
      "Supply": "12/12",
      "Number": 12
    }
  ],
  "ActionsListStr": "00:30, 工蜂*12, 12/12"
}
```

## 许可证

MIT License - By CairBin

## 项目地址

[GitHub 仓库](https://github.com/cairbin/sc2_tactics_builder)
