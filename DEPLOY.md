# GitHub Pages 部署

当前目录已经是无构建步骤的静态站点，已部署到：<https://xingyuijk.github.io/entanglement-swapping-review/>。对应公开仓库为 <https://github.com/Xingyuijk/entanglement-swapping-review>，没有覆盖已有的 `quantum-storage-review`。

下面是从空目录重新部署时的参考命令（当前仓库已经完成这些步骤）：

```bash
cd website
git init
git add .
git commit -m "Initial entanglement swapping literature map"
gh repo create Xingyuijk/entanglement-swapping-review --public --source=. --remote=origin --push
gh api --method POST repos/Xingyuijk/entanglement-swapping-review/pages \
  -f "source[branch]=main" -f "source[path]=/"
```

也可以在 GitHub 仓库 Settings → Pages 中选择 `main` branch / root。`index.html` 位于根目录，`.nojekyll` 已包含。
