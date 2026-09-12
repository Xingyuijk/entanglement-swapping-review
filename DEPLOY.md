# GitHub Pages 部署

当前目录已经是无构建步骤的静态站点。建议新建一个独立公开仓库，例如 `entanglement-swapping-review`，不要覆盖已有的 `quantum-storage-review`。

```bash
cd website
git init
git add .
git commit -m "Initial entanglement swapping literature map"
gh repo create Xingyuijk/entanglement-swapping-review --public --source=. --remote=origin --push
gh api --method POST repos/Xingyuijk/entanglement-swapping-review/pages \
  -f "source[branch]=main" -f "source[path]=/"
```

也可以在 GitHub 仓库 Settings → Pages 中选择 `main` branch / root。`index.html` 位于根目录，`.nojekyll` 已包含。仓库名称尚未由用户最终确认，因此本轮没有创建远程仓库或写入 GitHub 外部状态。
